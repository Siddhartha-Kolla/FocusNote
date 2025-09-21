import requests
import json
import os
import asyncio
import aiofiles
from PIL import Image
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
import tempfile

logger = logging.getLogger(__name__)

class OCRProcessor:
    """Optimized OCR processor for multiple images using OCR.space API"""
    
    def __init__(self, api_key: str = "K84093397988957"):
        self.api_key = api_key
        self.api_url = "https://api.ocr.space/parse/image"
        self.max_image_size = (1024, 1024)
    
    def downsize_image(self, image_path: str, output_path: Optional[str] = None, max_size: tuple = None) -> str:
        """
        Resize image to reduce file size and improve OCR accuracy
        
        Args:
            image_path: Path to input image
            output_path: Path for output image (optional)
            max_size: Maximum dimensions as (width, height)
        
        Returns:
            Path to the processed image
        """
        max_size = max_size or self.max_image_size
        
        try:
            with Image.open(image_path) as img:
                # Convert RGBA to RGB if necessary
                if img.mode == 'RGBA':
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    rgb_img.paste(img, mask=img.split()[-1])
                    img = rgb_img
                
                # Resize if image is larger than max_size
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Save processed image
                output_file = output_path or image_path
                img.save(output_file, optimize=True, quality=85)
                
                logger.info(f"Image processed: {image_path} -> {output_file} (size: {img.size})")
                return output_file
                
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            return image_path  # Return original path if processing fails
    
    async def process_single_image(self, image_path: str) -> Dict[str, Any]:
        """
        Process a single image with OCR.space API
        
        Args:
            image_path: Path to the image file
        
        Returns:
            Dictionary containing OCR results
        """
        try:
            # Preprocess image
            processed_path = self.downsize_image(image_path)
            
            # Prepare API payload
            payload = {
                "isOverlayRequired": False,
                "apikey": self.api_key,
                "language": "auto",
                "OCREngine": 2,
                "scale": True,
                "detectOrientation": True,
                "isTable": False,
                "filetype": "Auto"
            }
            
            # Make API request
            with open(processed_path, "rb") as f:
                response = requests.post(
                    self.api_url,
                    data=payload,
                    files={"file": f},
                    timeout=30
                )
            
            if response.status_code != 200:
                logger.error(f"OCR API request failed with status {response.status_code}")
                return {
                    "success": False,
                    "error": f"API request failed with status {response.status_code}",
                    "image_path": image_path
                }
            
            result = response.json()
            
            # Extract text from OCR response
            parsed_results = result.get("ParsedResults", [])
            if parsed_results and len(parsed_results) > 0:
                text = parsed_results[0].get("ParsedText", "")
                
                return {
                    "success": True,
                    "text": text.strip(),
                    "confidence": parsed_results[0].get("TextOverlay", {}).get("HasOverlay", False),
                    "image_path": image_path,
                    "raw_response": result
                }
            else:
                logger.warning(f"No text found in image {image_path}")
                return {
                    "success": False,
                    "error": "No text detected",
                    "image_path": image_path,
                    "text": ""
                }
        
        except requests.exceptions.Timeout:
            logger.error(f"OCR request timeout for image {image_path}")
            return {
                "success": False,
                "error": "Request timeout",
                "image_path": image_path
            }
        except Exception as e:
            logger.error(f"Error processing image {image_path}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "image_path": image_path
            }
    
    async def process_multiple_images(self, image_paths: List[str]) -> List[Dict[str, Any]]:
        """
        Process multiple images concurrently
        
        Args:
            image_paths: List of paths to image files
        
        Returns:
            List of OCR results for each image
        """
        logger.info(f"Processing {len(image_paths)} images with OCR")
        
        # Process images with some concurrency but not too much to avoid rate limiting
        semaphore = asyncio.Semaphore(3)  # Limit to 3 concurrent requests
        
        async def process_with_semaphore(image_path: str):
            async with semaphore:
                # Run the synchronous OCR processing in a thread pool
                return await asyncio.get_event_loop().run_in_executor(
                    None, 
                    lambda: asyncio.run(self.process_single_image(image_path))
                )
        
        try:
            # Process all images concurrently
            tasks = [self.process_single_image(path) for path in image_paths]
            results = []
            
            # Process images one by one to avoid overwhelming the API
            for i, image_path in enumerate(image_paths):
                logger.info(f"Processing image {i+1}/{len(image_paths)}: {Path(image_path).name}")
                result = await self.process_single_image(image_path)
                results.append(result)
                
                # Small delay between requests to be respectful to the API
                if i < len(image_paths) - 1:
                    await asyncio.sleep(0.5)
            
            # Log summary
            successful = sum(1 for r in results if r.get("success", False))
            logger.info(f"OCR processing complete: {successful}/{len(results)} images successful")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in batch OCR processing: {str(e)}")
            return []
    
    def combine_ocr_results(self, results: List[Dict[str, Any]], separator: str = "\n\n--- New Document ---\n\n") -> str:
        """
        Combine text from multiple OCR results
        
        Args:
            results: List of OCR results
            separator: String to separate text from different images
        
        Returns:
            Combined text string
        """
        combined_texts = []
        
        for i, result in enumerate(results):
            if result.get("success", False) and result.get("text"):
                text = result["text"].strip()
                if text:
                    # Add image header
                    image_name = Path(result.get("image_path", f"Image {i+1}")).name
                    header = f"=== {image_name} ===\n"
                    combined_texts.append(header + text)
        
        return separator.join(combined_texts)
    
    def validate_image_file(self, file_path: str) -> bool:
        """
        Validate if file is a supported image format
        
        Args:
            file_path: Path to the file
        
        Returns:
            True if file is a valid image
        """
        try:
            with Image.open(file_path) as img:
                # Check if it's a valid image format
                img.verify()
                return True
        except Exception:
            return False

# For backwards compatibility with existing code
def get_text_from_ocr_space(image_path: str = None) -> Dict[str, Any]:
    """
    Legacy function for single image processing
    """
    if not image_path:
        image_path = os.path.join(os.path.dirname(__file__), "input.png")
    
    processor = OCRProcessor()
    
    # Run async function in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(processor.process_single_image(image_path))
        return {
            "ParsedResults": [{"ParsedText": result.get("text", "")}] if result.get("success") else [],
            "OCRExitCode": 1 if result.get("success") else 2,
            "IsErroredOnProcessing": not result.get("success", False)
        }
    finally:
        loop.close()