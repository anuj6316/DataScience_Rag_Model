#!/usr/bin/env python3
"""
Script to process knowledge_base_stream.jsonl:
1. Remove '_partXX.pdf' suffixes from filenames
2. Update path from '/content/drive/MyDrive/Colab Notebooks/data/' to '/home/anuj/DataScience_Rag_Model/data/rag_output/'
"""
import json
import re
from pathlib import Path


def clean_filename(filename):
    """Remove _partXX.pdf or _part_XX.pdf suffix from filename and restore original .pdf extension."""
    # Pattern to match _partXX.pdf or _part_XX.pdf
    pattern = r'_part_?\d+\.pdf$'
    # Replace with .pdf
    cleaned = re.sub(pattern, '.pdf', filename)
    return cleaned


def update_path(path):
    """Update old Colab paths to new local rag_output path."""
    # List of old paths to replace
    old_paths = [
        '/content/drive/MyDrive/Colab Notebooks/data/',
        '/content/drive/MyDrive/DataScience_Rag_Model/rag_output/'
    ]
    new_path = '/home/anuj/DataScience_Rag_Model/data/rag_output/'
    
    for old in old_paths:
        if old in path:
            return path.replace(old, new_path)
    
    return path


def process_jsonl_line(line):
    """Process a single JSONL line."""
    try:
        data = json.loads(line)
        
        # Base directory for source_file and original_file
        base_dir = '/home/anuj/DataScience_Rag_Model/data/rag_output/'
        
        # Update source_file - remove suffix and set full path
        if 'source_file' in data:
            cleaned_name = clean_filename(data['source_file'])
            # Ensure it's just the filename before appending path
            if '/' in cleaned_name:
                cleaned_name = cleaned_name.split('/')[-1]
            data['source_file'] = f"{base_dir}{cleaned_name}"
            
        # Update original_file - remove suffix and set full path
        if 'original_file' in data:
            cleaned_name = clean_filename(data['original_file'])
            # Ensure it's just the filename before appending path
            if '/' in cleaned_name:
                cleaned_name = cleaned_name.split('/')[-1]
            data['original_file'] = f"{base_dir}{cleaned_name}"
        
        # Update file_path - change path
        if 'file_path' in data:
            data['file_path'] = update_path(data['file_path'])
            # Also clean the filename in the path
            path_parts = data['file_path'].rsplit('/', 1)
            if len(path_parts) == 2:
                directory, filename = path_parts
                cleaned_filename = clean_filename(filename)
                data['file_path'] = f"{directory}/{cleaned_filename}"
        
        # Update diagram_images - change paths
        if 'diagram_images' in data and isinstance(data['diagram_images'], list):
            data['diagram_images'] = [update_path(img) for img in data['diagram_images']]
        
        return json.dumps(data, ensure_ascii=False)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return line  # Return original line if there's an error


def main():
    # Define paths
    input_file = Path('/home/anuj/DataScience_Rag_Model/data/knowledge_base_stream.jsonl')
    output_file = Path('/home/anuj/DataScience_Rag_Model/data/knowledge_base_stream_processed.jsonl')
    backup_file = Path('/home/anuj/DataScience_Rag_Model/data/knowledge_base_stream_backup.jsonl')
    
    print(f"Processing {input_file}...")
    
    # Create backup
    print(f"Creating backup at {backup_file}...")
    with open(input_file, 'r', encoding='utf-8') as f_in:
        with open(backup_file, 'w', encoding='utf-8') as f_backup:
            f_backup.write(f_in.read())
    print("Backup created successfully!")
    
    # Process the file
    lines_processed = 0
    with open(input_file, 'r', encoding='utf-8') as f_in:
        with open(output_file, 'w', encoding='utf-8') as f_out:
            for line in f_in:
                line = line.strip()
                if line:  # Skip empty lines
                    processed_line = process_jsonl_line(line)
                    f_out.write(processed_line + '\n')
                    lines_processed += 1
                    
                    # Print progress every 1000 lines
                    if lines_processed % 1000 == 0:
                        print(f"Processed {lines_processed} lines...")
    
    print(f"\nProcessing complete!")
    print(f"Total lines processed: {lines_processed}")
    print(f"Output saved to: {output_file}")
    print(f"\nTo replace the original file, run:")
    print(f"  mv {output_file} {input_file}")


if __name__ == '__main__':
    main()
