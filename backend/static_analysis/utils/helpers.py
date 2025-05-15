import os
import subprocess
import requests
import logging
import static_analysis.utils.config as config
import pyzipper

logger = logging.getLogger()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

def run_tool(command, malware_file_name):
    try:
        result = subprocess.run(command, capture_output=True, text=True, shell=True)
        logger.debug(f"Running command: {command}")
        logger.debug(f"Command output: {result.stdout}")
        logger.debug(f"Command error: {result.stderr}")
        return result.stdout
    except Exception as e:
        logger.info(f"Error running {command} on {malware_file_name}: {e}")
        return f"Error running {command} on {malware_file_name}: {e}"
    

# # Function to check if file extension is allowed
def allowed_file(filename: str) -> bool:
    print(filename)
    return True if filename.split('.')[-1] in config.allowed_extension else False


def download_and_extract_zip(auth_key, sha256_hash, extract_dir, zip_path, download_url="https://mb-api.abuse.ch/api/v1/"):
    try:
        headers = {
            "Auth-Key": auth_key
        }
        data = {
            "query": "get_file",
            "sha256_hash": sha256_hash
        }
        os.makedirs(os.path.dirname(zip_path), exist_ok=True)
        response = requests.post(download_url, headers=headers, data=data)
        response.raise_for_status()  # Raises HTTPError for bad responses

        with open(zip_path, 'wb') as f:
            f.write(response.content)

        file_names = []
        with pyzipper.AESZipFile(zip_path, mode='r') as zf:
            zf.setpassword(b"infected")
            zf.extractall(path=extract_dir)
            file_names = zf.namelist()

        return file_names

    except Exception as e:
        logging.error(f"Error downloading or extracting zip file: {e}")
        return []


def cleanup(file_paths):
    try:
        # Check if the file exists before trying to delete it
        for each in file_paths:
            if os.path.exists(each):
                os.remove(each)
                logging.info(f"File '{each}' deleted successfully.")
            else:
                logging.info(f"File '{each}' does not exist.")
    except Exception as e:
        logging.error(f"Error occurred while deleting the file: {e}")
    
