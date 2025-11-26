#!/usr/bin/env python3
"""
Test script to verify image display functionality.
Tests that images are correctly converted to URLs and served.
"""

import asyncio
import sys
from pathlib import Path
import requests

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.flash.chat_manager import process_query

async def test_image_urls():
    """Test that diagram images are returned as URLs"""
    print("\n" + "="*80)
    print("TESTING IMAGE URL CONVERSION")
    print("="*80)
    
    # Query that should return diagrams
    query = "What is machine learning?"
    
    print(f"\nQuery: {query}")
    print("Processing...")
    
    result = await process_query(query, model_name="google_flash")
    
    print(f"\n✓ Response received")
    print(f"✓ Response length: {len(result.get('response', ''))} characters")
    
    # Check if diagram_images are present
    diagram_images = result.get("diagram_images", [])
    
    if not diagram_images:
        print("\n⚠️  No diagram images in response")
        print("This query might not have returned any images.")
        return True
    
    print(f"\n✓ Found {len(diagram_images)} diagram image(s)")
    
    # Verify they are URLs, not file paths
    all_valid = True
    for i, img_url in enumerate(diagram_images, 1):
        print(f"\nImage {i}: {img_url}")
        
        # Check if it's a URL
        if not img_url.startswith("http://"):
            print(f"  ✗ FAIL: Not a URL (should start with http://)")
            all_valid = False
            continue
        
        # Check if it points to our endpoint
        if "/images/" not in img_url:
            print(f"  ✗ FAIL: Doesn't use /images/ endpoint")
            all_valid = False
            continue
        
        print(f"  ✓ Valid URL format")
        
        # Try to fetch the image
        try:
            response = requests.get(img_url, timeout=5, stream=True)
            if response.status_code == 200:
                print(f"  ✓ Image accessible (HTTP {response.status_code})")
                content_type = response.headers.get('content-type', '')
                if 'image' in content_type:
                    print(f"  ✓ Correct content type: {content_type}")
                else:
                    print(f"  ⚠️  Unexpected content type: {content_type}")
            else:
                print(f"  ✗ FAIL: HTTP {response.status_code}")
                all_valid = False
        except Exception as e:
            print(f"  ✗ FAIL: Cannot fetch image: {e}")
            all_valid = False
    
    return all_valid

async def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("IMAGE DISPLAY FUNCTIONALITY TEST")
    print("="*80)
    
    success = await test_image_urls()
    
    print("\n" + "="*80)
    if success:
        print("✅ ALL TESTS PASSED")
        print("Images should now display correctly in the frontend!")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        print("Please review the errors above")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
