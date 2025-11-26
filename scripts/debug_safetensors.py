import os
from safetensors import safe_open

def test_safetensors():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    model_path = os.path.join(project_root, "lora_model")
    file_path = os.path.join(model_path, "model-00001-of-00002.safetensors")

    print(f"Attempting to open: {file_path}")
    
    try:
        with safe_open(file_path, framework="pt") as f:
            print("Successfully opened file with safe_open.")
            keys = f.keys()
            print(f"Found {len(keys)} keys.")
            print("First 5 keys:", keys[:5])
    except Exception as e:
        print(f"Failed to open file: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_safetensors()
