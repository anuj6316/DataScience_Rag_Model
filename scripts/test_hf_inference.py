import requests
import time

def query_hf_inference_api():
    # Configuration
    hf_username = input("Enter your Hugging Face username: ")
    model_name = input("Enter your model name (the one you just uploaded): ")
    repo_id = f"{hf_username}/{model_name}"
    
    # You need a token from https://huggingface.co/settings/tokens
    api_token = input("Enter your Hugging Face API Token (starts with hf_...): ")
    
    API_URL = f"https://api-inference.huggingface.co/models/{repo_id}"
    headers = {"Authorization": f"Bearer {api_token}"}

    payload = {
        "inputs": "What is the capital of France?",
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.7,
            "return_full_text": False
        }
    }

    print(f"Querying {API_URL}...")
    
    # Retry logic because the model might need to "warm up" (load) on the serverless worker
    for i in range(5):
        response = requests.post(API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("\nResponse:")
            print(response.json())
            break
        elif "estimated_time" in response.json():
            wait_time = response.json()["estimated_time"]
            print(f"Model is loading... waiting {wait_time:.2f} seconds.")
            time.sleep(wait_time)
        else:
            print(f"Error: {response.status_code} - {response.text}")
            break

if __name__ == "__main__":
    query_hf_inference_api()
