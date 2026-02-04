import requests
import json

try:
    response = requests.get("http://127.0.0.1:8000/resources/")
    if response.status_code == 200:
        data = response.json()
        if data and len(data) > 0:
            print("Keys found in first resource:", list(data[0].keys()))
        else:
            print("No resources found or empty list.")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {e}")
