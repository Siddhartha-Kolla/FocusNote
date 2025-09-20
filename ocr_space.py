import requests
import json 
import os 
from hackai_api_access import HackAPI as hackai

def downsize_image(image_path, output_path=None, max_size=(1024, 1024)):
    from PIL import Image
    with Image.open(image_path) as img:
        img.thumbnail(max_size)
        if output_path:
            img.save(output_path)
        else:
            img.save(image_path)

def get_text_from_ocr_space():
    payload = {
        "isOverlayRequired": False,
        "apikey": "K84093397988957",
        "language": "eng",
        "OCREngine": 2,
        "scale": True,
        "detectOrientation": True,
    }
    path = os.path.join("/Users/arian/Informatik/FocusNote/orc_samples", "sample3.jpg")
    downsize_image(path, max_size=(1024, 1024))
    with open(path, "rb") as f:
        response = requests.post(
            "https://api.ocr.space/parse/image",
            data=payload,
            files={"file": f}
        )
        return response.content.decode()

with open("ocr_response.json", "r") as f:
    response = json.load(f)
    parsed_results = response.get("ParsedResults", [])
    if parsed_results:
        text = parsed_results[0].get("ParsedText", "")
        hackai.get_text_from_hackai_response(f"Please clean up the code {text}")
        print(text)
    else:
        print("No parsed results found.")
