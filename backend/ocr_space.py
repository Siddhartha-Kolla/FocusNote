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
        "language": "auto",
        "OCREngine": 2,
        "scale": True,
        "detectOrientation": True,
    }
    path = os.path.join("D:\\Hackathons\\FocusNote\\backend", "input.PNG")
    downsize_image(path, max_size=(1024, 1024))
    with open(path, "rb") as f:
        response = requests.post(
            "https://api.ocr.space/parse/image",
            data=payload,
            files={"file": f}
        )
    if response.status_code != 200:
        raise Exception(f"OCR.space API request failed with status code {response.status_code}")
    return response.json()

print("test test")
ocr_response = get_text_from_ocr_space()
print("test")
parsed_results = ocr_response.get("ParsedResults", [])
if parsed_results:

    latex_assistant = r"""
        You are an expert LaTeX formatter.  
        Your job is to transform messy OCR-parsed text into a clean, compilable LaTeX document.  

        Rules:
        - Always output a complete LaTeX file with preamble, \begin{document}, and \end{document}.
        - If the first line looks like a title, use \title{} and \maketitle.
        - Headings/subheadings → \section{} / \subsection{}.
        - Lists:
        - Lines starting with "-" or "•" → itemize.
        - Numbered lines (1., 2., a)) → enumerate.
        - Mathematical expressions (e.g., x^2, a/b, ∑, ∫, <=, >=) → convert into LaTeX math mode ($...$ or \[...\]).
        - Escape LaTeX special characters (% & _ # $ { }).
        - If text is unreadable or uncertain, wrap it in \texttt{[UNCLEAR: ...]}.
        - Preserve paragraph breaks.
        - Do not explain. Output **only the LaTeX code**.
        - Ensure the final output compiles without errors.
        """

    latex_userinput = r"""Please convert the OCR text into a clean, compilable LaTeX document.
        OCR Text: 

        Specific formatting rules:
        - Use this preamble exactly:

        \documentclass{article}
        \usepackage[utf8]{inputenc}
        \usepackage{amsmath,amssymb}
        \usepackage{csquotes}
        \usepackage{hyperref}
        \usepackage{graphicx}
        \usepackage{geometry}

        - Insert \title{}, \author{} (if available), and \date{} if the OCR text contains them. Always add \maketitle after \begin{document}.
        - Convert headings into \section{} and \subsection{}.
        - Place each exercise or problem statement into its own subsection if possible.
        - Format math cleanly using \[ ... \] for displayed equations and $...$ for inline math.
        - Always use proper decimal notation: `1,234.56` (dot for decimals, comma for thousands).
        - If the OCR produces strange fragments (like “дед. : М” or broken characters), replace them with \texttt{[UNCLEAR: ...]} inside the text, not inside math mode.
        - Escape LaTeX special characters (% & _ # $ { }).
        - Ensure equations are readable and consistent (e.g., \frac for fractions, \cdot for multiplication).
        - Only return the LaTeX code, no explanations.
        OCR Text: 
    """

    prompt_assistant = r"""
        You are an expert text corrector specialized in cleaning OCR-parsed documents.  
        Your task is to correct inaccuracies, misread characters, and structural errors in raw OCR text.  

        Guidelines:
        - Detect the main language (e.g., German, English, or another) and use it consistently.
        - Correct typical OCR mistakes:
        - Replace misread numbers or letters (e.g., "1,6N" vs "16N", "O" vs "0").
        - Fix broken mathematical notation (e.g., "10°" → "10^", "x , 2" → "x^2").
        - Normalize spacing and punctuation.    
        - If a word, number, or symbol cannot be confidently inferred, keep it but mark it as `[UNCLEAR: ...]`.
        - Do not translate the content into another language unless the OCR clearly switched incorrectly mid-text.
        - Preserve the logical meaning of the original text as much as possible.
        - Output only the corrected plain text. Do not add LaTeX, formatting, or explanations.
        - Ensure the final text is coherent and readable.
        - And also structure the text into paragraphs where appropriate.
        - And also add some of your own corrections based on context and common sense.
    """

    print("Raw OCR response:")
    text = parsed_results[0].get("ParsedText", "")
    result = hackai.get_text_from_hackai_response(f"Please clean up the text {text}. Do not add content by yourself. Do not give any explanations. Just return the cleaned text.", assistant=prompt_assistant)
    result_latex = hackai.get_text_from_hackai_response(latex_userinput+result, assistant=latex_assistant)
    print("Extracted and cleaned text:")
    print(result)
    print("LaTeX formatted text:")
    print(result_latex)
    with open("output.tex", "w", encoding="utf-8") as f:
        latex_lines = result_latex.splitlines()
        if len(latex_lines) > 2:
            latex_content = "\n".join(latex_lines[1:-1])
        else:
            latex_content = result_latex
        f.write(latex_content)
    print("LaTeX output written to output.tex")
else:
    print(ocr_response)
    print("No parsed results found.")
