import os
import re
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from openai import OpenAI
from static_analysis.utils import config
from static_analysis.utils.helpers import allowed_file, download_and_extract_zip, cleanup
from static_analysis.utils.analyze import analyze_sample

# Configure logging
logging.basicConfig(filename='app.log',
                    level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# FastAPI app
app = FastAPI()
client = OpenAI()

# Ensure required directories exist
Path(config.malware_upload_dir).mkdir(parents=True, exist_ok=True)

# Pydantic model for request body
class StaticAnalysisRequest(BaseModel):
    sha256: str

@app.post("/static_analysis")
async def upload_malware(request_data: StaticAnalysisRequest):
    hash_code = request_data.sha256
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

            completion = client.chat.completions.create(
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
            rules_path = f"{config.suricata_rules_dir}suricata_rule_{log_file}"

            with open(rules_path, "w", encoding="utf-8") as f:
                f.write(cleaned_rules)

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
