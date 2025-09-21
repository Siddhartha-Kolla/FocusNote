from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import requests
from PIL import Image, ImageEnhance
import os

processor = TrOCRProcessor.from_pretrained("microsoft/trocr-small-handwritten", use_fast=False)
print("Processor loaded.")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-small-handwritten")
print("Model and processor loaded.")

path = os.path.join("/Users/arian/informatik/FocusNote/orc_samples", "sample2.png")
image = Image.open(path).convert("RGB")

enhancer = ImageEnhance.Contrast(image)
image = enhancer.enhance(2.0)  # Faktor anpassen nach Bedarf


print("Image loaded.")
print(image)
print(path)
print(image.size)

pixel_values = processor(image, return_tensors="pt").pixel_values
generated_ids = model.generate(pixel_values)

print("Text generated.")

generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
print(generated_text)