import os
from safetensors.torch import load_file
from transformers import AutoConfig, AutoTokenizer

def verify_model_integrity():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    model_path = os.path.join(project_root, "lora_model")
    print(f"Verifying model at: {model_path}")

    # 1. Check Config
    try:
        print("Loading config...")
        config = AutoConfig.from_pretrained(model_path)
        print("Config loaded successfully.")
        print(f"Model Type: {config.model_type}")
    except Exception as e:
        print(f"Failed to load config: {e}")
        return

    # 2. Check Tokenizer
    try:
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        print("Tokenizer loaded successfully.")
    except Exception as e:
        print(f"Failed to load tokenizer: {e}")
        return

    # 3. Check Safetensors Metadata (Lightweight)
    try:
        print("Checking safetensors files...")
        from safetensors import safe_open
        
        files = [f for f in os.listdir(model_path) if f.endswith('.safetensors')]
        for f in files:
            full_path = os.path.join(model_path, f)
            print(f"Checking {f}...")
            with safe_open(full_path, framework="pt", device="cpu") as f_open:
                keys = f_open.keys()
                print(f"  - Valid. Contains {len(keys)} tensors.")
    except Exception as e:
        print(f"Failed to check safetensors: {e}")
        return

    print("\nModel files appear to be valid and readable.")
    print("Note: This does not verify the model logic or weights correctness, only file integrity.")

if __name__ == "__main__":
    verify_model_integrity()
