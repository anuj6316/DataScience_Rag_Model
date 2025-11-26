import os

def test_model():
    # Define paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    model_path = os.path.join(project_root, "lora_model")

    print(f"Loading model from: {model_path}")

    try:
        print("Importing libraries...")
        # Move imports inside to catch import errors
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
        print("Libraries imported.")

        # Load tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        print("Tokenizer loaded.")
        
        # Load model
        print("Loading model with 4-bit quantization...")
        
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )

        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            quantization_config=quantization_config,
            device_map="auto",
            trust_remote_code=True, # Often needed for newer/custom architectures
            low_cpu_mem_usage=True
        )
        
        print("Model and tokenizer loaded successfully.")

        # Test inference
        prompt = "What is the capital of France?"
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        # Apply chat template if available, otherwise just use raw prompt
        if tokenizer.chat_template:
            text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        else:
            text = prompt

        print(f"Input text: {text}")

        inputs = tokenizer(text, return_tensors="pt").to(model.device)

        print("Generating response...")
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
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
    test_model()
