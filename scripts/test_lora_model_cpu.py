import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def test_model_cpu_offload():
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    model_path = os.path.join(project_root, "lora_model")
    offload_folder = os.path.join(project_root, "offload_weights")

    print(f"Loading model from: {model_path}")
    print(f"Offloading weights to: {offload_folder}")

    try:
        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        print("Tokenizer loaded.")
        
        # Load model with disk offloading
        print("Loading model (this may take a while)...")
        # Note: We remove quantization config as bitsandbytes is often GPU-only or problematic on CPU
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            device_map="auto",
            offload_folder=offload_folder,
            torch_dtype=torch.float32, # Use float32 for CPU stability
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )
        
        print("Model loaded successfully (with offloading).")

        # Test inference
        prompt = "What is the capital of France?"
        messages = [{"role": "user", "content": prompt}]
        
        if tokenizer.chat_template:
            text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        else:
            text = prompt

        print(f"Input text: {text}")
        inputs = tokenizer(text, return_tensors="pt").to(model.device)

        print("Generating response (this will be slow)...")
        outputs = model.generate(
            **inputs,
            max_new_tokens=50, # Keep it short
            do_sample=True,
            temperature=0.7,
        )

        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print("-" * 50)
        print("Model Response:")
        print(response)
        print("-" * 50)

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_model_cpu_offload()
