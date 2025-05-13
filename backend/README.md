# AI Malware Static Analysis

This repository contains a project for automating static malware analysis. The goal is to streamline the process of identifying potential issues in codebases, ensuring better code quality and maintainability.

## Prerequisites

- Python 3.10>= installed on your system.
- Required dependencies listed in `requirements.txt`.
- Install Docker

## 🚀 Setup Guide
Follow these steps to set up and run the **AI Static Analysis**:

### 1️⃣ Pull the Docker Image
    ```
        docker pull shubhamjoshi26/static_analysis:latest
    ```

### 2️⃣ Run the Docker Container
    ```
    docker run -d -p 8000:8000 --name static_analysis shubhamjoshi26/static_analysis:latest
    
    ```
### 3️⃣ Use postman or curl to send the request to application

    ```
    Server is running at: http://127.0.0.1:8000
    Use Postman or curl to send a request with the malware SHA256 hash to analyze.

    Example:
    Postman:
    POST URL: http://127.0.0.1:8000/static_analysis
    Body: { "sha256": "0966555bd577a1a3d45655422d0d41df77eb1834b93a56288ed336593b402d0e" }

    curl:
    curl -X POST http://localhost:8000/static_analysis \
     -H "Content-Type: application/json" \
     -d '{"sha256": "e852d254395ef04308bcde37c3ee9725ab23ca82a202e7d69028c8bee0f0d05f"}'

    The response will include a detailed analysis along with a generated Suricata rule for the given malware.
    ```

## Example responce:
    ```
        1. Malware Summary:
            The inspection of the executable file named "e852d254395ef04308bcde37c3ee9725ab23ca82a202e7d69028c8bee0f0d05f.exe" reveals it is a PE32 executable with a small file size, claiming to be Microsoft's OneDrive Assistant, which is contradictory given the context of it being in a "malwares" directory. This discrepancy indicates potential masquerading to evade detection. Additionally, there are multiple DOCX and DOC files that have been labeled as malware but lack specific indicators of embedded malicious activity from the provided tools, suggesting they might serve as decoys or supporting files.

        2. Suricata Signatures:
            - alert file any any -> any any (msg:'Suspicious executable masquerading as Microsoft OneDrive Assistant'; content:'Microsoft OneDrive Assistant.exe'; content:'e852d254395ef04308bcde37c3ee9725ab23ca82a202e7d69028c8bee0f0d05f.exe'; sid:1000003; rev:1;)

            - alert file any any -> any any (msg:'Suspicious DOCX file; possible decoy or embedded threats'; content:'5d161711985e25822e1425b12b0da31b00504111fc3360f0246a9bdcff2bc3de.docx'; sid:1000004; rev:1;)

            - alert file any any -> any any (msg:'Suspicious DOC file; potential for embedded threats'; content:'774c2629aff83ce568a6b12f867dfe67953bd54452ad5534a19a6436a696600f.doc'; sid:1000005; rev:1;)

    ```