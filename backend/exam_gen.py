import tempfile
from pathlib import Path
from hackai_api_access import HackAPI as hackai
import json
from latex_generator import LaTeXGenerator

class ExamGenerator:
    @staticmethod
    async def compile_latex_to_pdf(latex_content: str) -> bytes:
        """
        Compile LaTeX content to PDF and return the PDF as bytes.

        This uses the `LaTeXGenerator.generate_pdf` async method which compiles
        inside a temporary directory and only copies the resulting PDF into a
        fresh temporary path. We then read the PDF bytes and return them to the
        caller. No permanent files are left on disk.
        """
        from latex_generator import LaTeXGenerator
        import shutil
        from pathlib import Path

        generator = LaTeXGenerator()

        # Use a temporary directory for the output and let LaTeXGenerator handle
        # its own temp workspace. We'll copy the result into another temp file
        # so we can read bytes and then cleanup.
        try:
            with tempfile.TemporaryDirectory() as out_dir:
                out_path = Path(out_dir)
                # generate_pdf returns a path string or None
                pdf_path = await generator.generate_pdf(latex_content, out_path)

                if not pdf_path:
                    return b""

                pdf_path = Path(pdf_path)
                if not pdf_path.exists():
                    return b""

                # Read PDF bytes
                with open(pdf_path, "rb") as f:
                    pdf_bytes = f.read()

                return pdf_bytes
        except Exception:
            return b""
    def evaluate_answer(answer: str, question: str, user_answer: str) -> str:
        evaluation_context = r"""
        You are an expert exam evaluator.  
        Your job is to assess a user’s answer against a given exam question and the expected correct answer.  

        Evaluation guidelines:
        - Compare the user’s answer with the reference answer (if provided).
        - If no explicit reference answer is given, use general knowledge and the question context to evaluate correctness.
        - Mark whether the answer is correct, partially correct, or incorrect.
        - Give a short, constructive explanation why the evaluation was made.
        - Assign a score between 0 and 1, where:
        - 1 = fully correct
        - 0.5 = partially correct
        - 0 = incorrect
        - If the question is open-ended (interpretation, opinion, transfer), evaluate the **reasoning quality, relevance, and clarity** instead of only factual correctness.
        - Always return results in JSON format with the following structure:

        {
        "question": "...",
        "user_answer": "...",
        "evaluation": {
            "correctness": "correct | partially correct | incorrect",
            "score": 0.0-1.0,
            "explanation": "short explanation here"
        }
        }
        """
        prompt = f"""
        Question: {question}
        Expected Answer: {answer}
        User's Answer: {user_answer}    
        """

        return hackai.get_text_from_hackai_response(prompt, assistant=evaluation_context)


    def generate_exam_questions(prompt: str) -> str:
        promt_context = r"""
            You are an exam creator.  
            Your task is to generate a mock exam in strict JSON format based on the topics and parameters provided by the user.  

            Rules:
            1. Input sources:
            - Source text(s): parsed OCR text or reference material.
            - Extra topics: provided by the user without source text.

            2. Question schema:
            Each question must follow this structure:
            {
                "question": "The question text",
                "type": "multiple_choice | single_choice | free_text",
                "choices": ["Option A", "Option B", "Option C"],   // only for multiple_choice or single_choice
                "answer": "Correct answer or expected response",
                "difficulty": 1–5,   // 1 = easy, 5 = very difficult
                "task_type": "memory | interpretation | transfer"
            }

            3. Parameters (always provided by the user):
            - "total_questions": total number of questions to generate (integer).
            - "difficulty_distribution": percentage split for difficulty levels.  
                Example: {"1":40, "2":30, "3":20, "4":5, "5":5}
            - "task_distribution": percentage split for task types.  
                Example: {"memory":40, "interpretation":30, "transfer":30}

            Use these percentages to distribute the questions. If rounding is needed, keep the final total equal to "total_questions".

            4. Question design:
            - If a topic has source text → design text-specific questions.
            - If a topic has no source text → design general knowledge questions.
            - Mix question formats (multiple_choice, single_choice, free_text).
            - If OCR text is unclear, infer from context; if impossible, mark "[UNCLEAR]".
            - Keep exam language consistent with user input.

            5. Output:
            - A .tex file formatted for LaTeX exams.

        """



        prompt = f"Generate exam questions from the following text: {prompt}"
        response = hackai.get_text_from_hackai_response(prompt, assistant=promt_context)
        return response

    @staticmethod
    def questions_json_to_latex(questions_json: str, title: str = "Mock Exam", author: str = "FocusNote AI") -> str:
        """
        Convert exam questions JSON to a beautiful LaTeX exam document.
        """
        try:
            questions = json.loads(questions_json)
        except Exception:
            return f"% Error: Could not parse questions JSON\n{questions_json}"

        latex = [
            r"\documentclass[12pt]{article}",
            r"\usepackage[utf8]{inputenc}",
            r"\usepackage{enumitem}",
            r"\usepackage{tcolorbox}",
            r"\usepackage{geometry}",
            r"\geometry{margin=1in}",
            r"\usepackage{xcolor}",
            r"\definecolor{easy}{HTML}{DFF0D8}",
            r"\definecolor{medium}{HTML}{FCF8E3}",
            r"\definecolor{hard}{HTML}{F2DEDE}",
            r"\newcommand{\badge}[2]{\fcolorbox{#1}{#1}{\textbf{#2}}}",
            r"\begin{document}",
            f"\begin{{center}}\Huge\textbf{{{title}}}\\[1ex]\large {author}\\[2ex]\normalsize\today\end{{center}}",
            r"\vspace{1em}",
            r"\begin{tcolorbox}[colback=blue!5!white,colframe=blue!80!black,title=Instructions]",
            r"Answer all questions. For multiple choice, circle the correct option. For free text, write your answer in the space provided.",
            r"\end{tcolorbox}",
            ""
        ]
        def difficulty_badge(level):
            if str(level) in ['1', '2']:
                return "\\badge{easy}{Easy}"
            elif str(level) in ['3', '4']:
                return "\\badge{medium}{Medium}"
            elif str(level) == '5':
                return "\\badge{hard}{Hard}"
            return ""
        for i, q in enumerate(questions if isinstance(questions, list) else questions.get('questions', [])):
            latex.append(f"\\section*{{Question {i+1}}}")
            latex.append(q.get('question', ''))
            latex.append(f"\\textit{{Task type:}} {q.get('task_type', '')} ")
            latex.append(difficulty_badge(q.get('difficulty', '')))
            if q.get('type') in ['multiple_choice', 'single_choice'] and q.get('choices'):
                latex.append("\\begin{enumerate}[label=\Alph*.] ")
                for choice in q['choices']:
                    latex.append(f"  \\item {choice}")
                latex.append("\\end{enumerate}")
            elif q.get('type') == 'free_text':
                latex.append(r"\vspace{2em}")
                latex.append(r"\noindent\rule{\textwidth}{0.4pt}")
                latex.append(r"\vspace{2em}")
            latex.append(f"\\textbf{{Answer:}} {q.get('answer', '')}")
            latex.append("")
        latex.append(r"\end{document}")
        return "\n".join(latex)


    def get_exam_questions(
            total_questions: int = 10,
            level_one: int = 25,
            level_two: int = 25,
            level_three: int = 25,
            level_four: int = 15,
            level_five: int = 10,
            memory_task: int = 30,
            interpretation_task: int = 40,
            transfer_task: int = 30 ) -> str:
        
            prompt = f"""
            Source text (parsed from OCR):
            \"Newton's laws describe the relationship between motion and forces. 
            First law: an object remains at rest or in uniform motion unless acted on by a force. 
            Second law: F = m × a. 
            Third law: action equals reaction.\"

            Extra topics (user-defined):
            - Gravitational force
            - Kepler’s laws

            Parameters:
            {{
            "total_questions": {total_questions},
            "difficulty_distribution": {{"1":{level_one}, "2":{level_two}, "3":{level_three}, "4":{level_four}, "5":{level_five}}},
            "task_distribution": {{"memory":{memory_task}, "interpretation":{interpretation_task}, "transfer":{transfer_task}}}
            }}
            """

            return (ExamGenerator.generate_exam_questions(prompt))
    


if __name__ == "__main__":
    questions_json = ExamGenerator.get_exam_questions()
    latex_exam = ExamGenerator.questions_json_to_latex(questions_json, title="Beautiful AI-Generated Exam", author="FocusNote Team")
    print(latex_exam)
    pdf_path = ExamGenerator.compile_latex_to_pdf(latex_exam)
    if pdf_path:
        print(f"PDF generated: {pdf_path}")
    else:
        print("PDF generation failed.")