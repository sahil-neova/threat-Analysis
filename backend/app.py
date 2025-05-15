import os
import re
import logging
import smtplib
from email.message import EmailMessage
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from static_analysis.utils import config
from static_analysis.utils.helpers import allowed_file, download_and_extract_zip, cleanup
from static_analysis.utils.analyze import analyze_sample
from s3_utils import S3Utils
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()


# FastAPI app
app = FastAPI()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

BUCKET_NAME = "neova-cloudsec-ai2025"

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretjwtkey")
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ALGORITHM = "HS256"
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["neoThreatAgent"]
users_collection = db['Users']
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


# Configure logging
logging.basicConfig(filename='app.log',
                    level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')



# Ensure required directories exist
Path(config.malware_upload_dir).mkdir(parents=True, exist_ok=True)


# CORS settings
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Pydantic model for request body
class StaticAnalysisRequest(BaseModel):
    sha256: str
    user_id: str
    
class EmailRequest(BaseModel):
    recipient_email: str  # comma-separated if multiple

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str
    
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/create_user")
async def signup(user: SignupRequest):
    existing_user = users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists with this email.")
    if user.role not in ["admin", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role.")
    hashed_password = pwd_context.hash(user.password)
    users_collection.insert_one({"email": user.email, "password": hashed_password,"role": user.role})
    return {"message": "User created successfully!"}

@app.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        user = users_collection.find_one({"email": request.email})
        if not user:
            logging.error(f"Password reset failed for {request.email}: User not found")
            raise HTTPException(status_code=404, detail="User not found")

        if not pwd_context.verify(request.current_password, user['password']):
            logging.error(f"Password reset failed for {request.email}: Invalid current password")
            raise HTTPException(status_code=400, detail="Invalid current password")

        if request.current_password == request.new_password:
            logging.error(f"Password reset failed for {request.email}: New password same as current")
            raise HTTPException(status_code=400, detail="New password cannot be the same as current password")

        password_regex = r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
        import re
        if not re.match(password_regex, request.new_password):
            logging.error(f"Password reset failed for {request.email}: New password does not meet requirements")
            raise HTTPException(
                status_code=400,
                detail="New password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character (!@#$%^&*)"
            )

        hashed_new_password = pwd_context.hash(request.new_password)
        users_collection.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_new_password}}
        )
        logging.info(f"Password reset successful for {request.email}")
        return {"message": "Password reset successfully"}
    except Exception as e:
        logging.error(f"Error in reset_password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/admin_login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admins only.")
    token_data = {"sub": user["email"]}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"]),"role":"admin"}

@app.post("/login")
async def login(login_request: LoginRequest):
    user = users_collection.find_one({"email": login_request.email})
    if not user or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid email or password.")
    token_data = {"sub": user["email"]}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"]),"role":user["role"]}

@app.post("/static_analysis")
async def upload_malware(request_data: StaticAnalysisRequest):
    hash_code = request_data.sha256
    user_id = request_data.user_id
    if not hash_code:
        logging.error("Empty SHA256 hash provided")
        raise HTTPException(status_code=400, detail="Empty sha256 hash provided")

    zip_file = f"{config.malware_dir}{os.urandom(2).hex()}.zip"
    logging.debug(f"Generated zip file name: {zip_file}")

    try:
        # Download and extract
        malware_file_name = download_and_extract_zip(config.malwarebazaar_api_key, hash_code, config.malware_dir, zip_file)
        logging.debug(f"Extracted malware file name: {malware_file_name}")

        if not malware_file_name or malware_file_name[0] is None:
            logging.error("Failed to extract malware file")
            raise HTTPException(status_code=400, detail="Failed to extract malware file")

        file_extension = malware_file_name[0].split(".")[-1]
        logging.debug(f"Extracted file extension: {file_extension}")

        if not allowed_file(malware_file_name[0]):
            raise HTTPException(status_code=400, detail="File type not allowed")

        # Determine analysis tools
        tools = []
        if file_extension in config.macro_extensions:
            tools = config.macros_tools
        elif file_extension in config.executable_extensions:
            tools = config.exe_tools
        else:
            logging.warning("File type does not match known categories")

        log_file = config.log_file
        log_path = f"{config.logs_dir}analysis_log_{log_file}"
        os.makedirs(os.path.dirname(log_path), exist_ok=True)

        # Run analysis
        with open(log_path, 'a', encoding='utf-8') as f:
            for tool in tools:
                try:
                    logging.info(f"Running {tool} on {malware_file_name[0]}")
                    f.write(f"\nrunning {tool} tool on {malware_file_name[0]}:\n")
                    f.write(analyze_sample(tool, f"{config.malware_dir}{malware_file_name[0]}"))
                except Exception as e:
                    logging.error(f"Tool {tool} failed: {e}")
                    f.write(f"Error analyzing sample with {tool} tool: {e}\n")

        # Generate Suricata rules using OpenAI
        try:
            with open(log_path, 'r') as file:
                content = file.read()

            completion = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": f"""                             
                                            Analyze the provided content for any patterns or behaviors that may indicate malicious activity. Focus on identifying relevant network indicators, attack vectors, or suspicious behaviors. Based on this analysis, generate a concise summary of the potential malware and all corresponding Suricata IDS/IPS rules. 

                                            **Content:**
                                            {content}

                                            **Instructions:**
                                            - Provide a **brief summary** of the identified malware or suspicious behavior.
                                            - For each identified malicious activity, generate Suricata IDS/IPS rules following the signature syntax below. **Do not include explanations or descriptions—just the rules**.
                                            - Explain on what basis we are going to create the suricata rules.
                                            
                                            **Suricata Signature Syntax**:  
                                            `alert <protocol> <src_ip> <src_port> -> <dst_ip> <dst_port> (msg:'<message>'; <optional rule options>; sid:<unique_id>; rev:<revision_number>;)`

                                            **Output Format:**

                                            1. Malware Summary**:
                                            - Provide a **brief summary** of the identified malware or suspicious behavior.
                                            - For each identified malicious activity, generate Suricata IDS/IPS rules following the signature syntax below. **Do not include explanations or descriptions—just the rules**.
                                            - Explain on what basis we are going to create the suricata rules.

                                            2. Suricata Signatures**:
                                            alert <protocol> <src_ip> <src_port> -> <dst_ip> <dst_port> (msg:'<message>'; <optional rule options>; sid:<unique_id>; rev:<revision_number>;);
                                            
                                            **Example:**

                                            1. Malware Summary:
                                                Explain the malicious activity briefly

                                            2. Suricata Signatures:
                                            - alert file any any -> any any (msg:'Potential malicious macro in document'; content:'macro'; sid:1000001; rev:1;)
                                            - alert file any any -> any any (msg:'VBA script execution detected'; content:'VBA'; sid:1000002; rev:1;)
                                            """
                    }
                ]
            )

            rules = completion.choices[0].message.content
            cleaned_rules = re.sub(r'```(plaintext)?\n?', '', rules).replace('\\n', '\n')

            report_with_hash = f"SHA256: {hash_code}\n\n{cleaned_rules}"
            rules_path = f"{config.suricata_rules_dir}suricata_rule_{log_file}"
            os.makedirs(os.path.dirname(rules_path), exist_ok=True)

            with open(rules_path, "w", encoding="utf-8") as f:
                f.write(report_with_hash)

            # --- S3 Upload ---
            s3 = S3Utils()
            s3_key = f"threat-analysis-reports/{user_id}/suricata_rule_{log_file}"

            s3.upload_file(rules_path, BUCKET_NAME, s3_key)

            return FileResponse(path=rules_path, media_type="text/plain", filename=f"suricata_rule_{log_file}")

        except Exception as e:
            logging.error(f"OpenAI rule generation failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate Suricata rules")

    except Exception as e:
        logging.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
    finally:
        try:
            cleanup([zip_file])
            logging.info("Cleanup completed.")
        except Exception as e:
            logging.error(f"Cleanup failed: {e}")


@app.get("/list_threat_analysis_reports")
async def list_threat_analysis_reports(user_id: str = Query(..., description="MongoDB user ID")):
    try:
        s3_prefix = f"threat-analysis-reports/{user_id}/"
        s3 = S3Utils()
        file_keys = s3.list_files(BUCKET_NAME, s3_prefix)

        files = []
        for key in file_keys:
            view_url = s3.generate_presigned_url(BUCKET_NAME, key, disposition='inline')
            download_url = s3.generate_presigned_url(BUCKET_NAME, key, disposition='attachment')
            files.append({"s3_key": key, "view_url": view_url, "download_url": download_url})

        return JSONResponse(content={"files": files})

    except Exception as e:
        logging.error(f"❌ Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to list compliance reports.")


@app.post("/email_threat_analysis_report")
async def email_threat_analysis_report(request: EmailRequest):
    try:
        recipient_emails = [email.strip() for email in request.recipient_email.split(",")]
        rules_files = sorted(
            Path(config.suricata_rules_dir).glob("suricata_rule_*"),
            key=os.path.getmtime,
            reverse=True
        )

        if not rules_files:
            logging.error("No Suricata rules file found for emailing.")
            raise HTTPException(status_code=404, detail="Suricata rules file not found.")

        rules_file_path = str(rules_files[0])
        rules_filename = os.path.basename(rules_file_path)

        msg = EmailMessage()
        msg["Subject"] = f"neoThreatAgent Suricata Rules – {rules_filename}"
        msg["From"] = os.getenv("SENDER_EMAIL")
        msg["To"] = ", ".join(recipient_emails)
        msg.set_content("Please find attached the generated Suricata rules from neoThreatAgent.")

        with open(rules_file_path, "rb") as f:
            msg.add_attachment(
                f.read(),
                maintype="text",
                subtype="plain",
                filename=rules_filename
            )

        with smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT"))) as server:
            server.starttls()
            server.login(os.getenv("SMTP_USERNAME"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)

        logging.info(f"Suricata rules email sent to {', '.join(recipient_emails)}")
        return {"message": f"Suricata rules email sent to {', '.join(recipient_emails)} successfully."}
    except Exception as e:
        logging.error(f"Failed to send Suricata rules email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
