import os
from static_analysis.utils.helpers import run_tool
from datetime import datetime

current_datetime = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

def analyze_sample(command, malware_file_name):
    logs = run_tool(
        f'{command} "{malware_file_name}"',
        malware_file_name
    )
    return logs

