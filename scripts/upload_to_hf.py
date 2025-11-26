import os
from huggingface_hub import HfApi, create_repo

def upload_model_to_hf():
    # Configuration
    # REPLACE WITH YOUR USERNAME AND DESIRED MODEL NAME
    hf_username = input("Enter your Hugging Face username: ")
    model_name = input("Enter a name for your new model repo (e.g., my-lora-model): ")
    repo_id = f"{hf_username}/{model_name}"
    
    local_model_path = "../lora_model" # Path to your local model folder
    
    print(f"Preparing to upload '{local_model_path}' to '{repo_id}'...")

    try:
        api = HfApi()
        
        # 1. Create the repository (if it doesn't exist)
        print("Creating repository...")
        create_repo(repo_id, repo_type="model", exist_ok=True)
        
        # 2. Upload files
        print("Uploading files (this may take time depending on your internet speed)...")
        api.upload_folder(
            folder_path=local_model_path,
            repo_id=repo_id,
            repo_type="model",
        )
        
        print(f"\nSuccess! Model uploaded to: https://huggingface.co/{repo_id}")
        print("You can now use this repo ID for the Inference API.")
        
    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure you are logged in. Run 'huggingface-cli login' in your terminal first.")

if __name__ == "__main__":
    upload_model_to_hf()
