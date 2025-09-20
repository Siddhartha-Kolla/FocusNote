from hackai_api_access import HackAPI as hackai

def generate_exam_questions(ocr_text):
    promt_context = r"""
        You are an exam creator.  
        Your goal is to generate a complete mock exam based on the topics provided by the user.  

        Rules:
        1. Input sources:
        - Source text(s): parsed OCR text or provided reference material.
        - Extra topics: given by the user without source text.

        2. Task:
        - Create a mock exam with a mixture of question types: multiple choice, short answer, and open-ended problems.
        - When a topic is supported by source text, design questions that are text-specific.
        - When a topic has no source text, create general questions using your knowledge.
        - If a concept in the OCR text is unclear or corrupted, infer it from context; if not possible, mark as [UNCLEAR].

        3. Output format:
        - Title and instructions for the exam.
        - Numbered questions grouped by topic.
        - Mix of easy, medium, and difficult levels.
        - Keep language consistent with the input (English, German, etc.).
        - Do not include explanations or solutions unless explicitly asked later.

    """



    prompt = f"Generate exam questions from the following text: {ocr_text}"
    response = hackai.get_text_from_hackai_response(prompt, assistant=promt_context)
    return response



prompt = """
Source text (parsed from OCR):
"Newton's laws describe the relationship between motion and forces. 
First law: an object remains at rest or in uniform motion unless acted on by a force. 
Second law: F = m × a. 
Third law: action equals reaction."

Extra topics (user-defined):
- Gravitational force
- Kepler’s laws
"""
generate_exam_questions(prompt)