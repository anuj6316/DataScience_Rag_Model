import os

def check_file():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    model_path = os.path.join(project_root, "lora_model")
    file_path = os.path.join(model_path, "model-00001-of-00002.safetensors")

    print(f"Checking access to: {file_path}")
    
    if os.path.exists(file_path):
        print("File exists.")
        if os.access(file_path, os.R_OK):
            print("File is readable.")
        else:
            print("File is NOT readable (permission denied).")
        
        try:
            size = os.path.getsize(file_path)
            print(f"File size: {size} bytes")
        except Exception as e:
            print(f"Error getting size: {e}")
            
    else:
        print("File does NOT exist.")
        # List directory content to see what's there
        if os.path.exists(model_path):
            print(f"Contents of {model_path}:")
            print(os.listdir(model_path))
        else:
            print(f"Directory {model_path} does not exist.")

if __name__ == "__main__":
    check_file()
