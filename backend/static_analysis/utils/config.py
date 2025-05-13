from datetime import datetime

logs_dir="static_analysis/analysis_logs/"
suricata_rules_dir="static_analysis/suricata_rules/"
generate_rule_url="http://localhost:8000/static_analysis"
malware_dir = "malwares/"
current_datetime = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
log_file = f"{current_datetime}.txt"
virustotal_api_key="67f35ad3aa3530230dffb7e0028d63aed6c16ac98ebd070d0f0f29b82d7a5c47"
malwarebazaar_api_key="ae91b909722801031cc68672392dffae44a37c48893a9b9f"
malwarebazaar_download_url="https://mb-api.abuse.ch/api/v1/"
malware_upload_dir = "uploaded_files/"

# List of allowed file extensions (example)
allowed_extension = ["exe", "dll", "docx", "doc"]

# List of tools to be used for analysis
macros_tools = [
    "oleid",
    "file",
    # "strings",
    "mraptor",
    "olevba"
]

exe_tools =[
    # "capa",
    "file",
    # "strings",
    "exiftool"
]

executable_extensions = [
    'exe',   # Windows Executable File
    'dll',
]

macro_extensions = [
    'xlsm',  # Microsoft Excel Macro-Enabled Workbook
    'xlsb',  # Microsoft Excel Binary Workbook (can contain macros)
    'xltm',  # Microsoft Excel Macro-Enabled Template
    'xlam',  # Microsoft Excel Add-in
    'docm',  # Microsoft Word Macro-Enabled Document
    'dotm',  # Microsoft Word Macro-Enabled Template
    'pptm',  # Microsoft PowerPoint Macro-Enabled Presentation
    'ppam',  # Microsoft PowerPoint Add-in
    'vbs',   # VBScript file (commonly used for macros)
    'vbe',   # VBScript Encoded file
    'bas',   # Visual Basic Source Code file
    'cls',   # Visual Basic Class module file
    'frm',   # Visual Basic Form file
    'otm',   # Microsoft Outlook Macro-Enabled Template
    'mdb',   # Microsoft Access Database (may contain macros)
    'accdb', # Microsoft Access Database (may contain macros)
    'mda',   # Microsoft Access Add-in (macro file)
    'mde',   # Microsoft Access MDE (compiled macro file)
    'dsm',   # Delphi source file (contains macros)
    'docx',
    'doc',   
]