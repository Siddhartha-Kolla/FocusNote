from hackai_api_access import HackAPI as hackai

class ExamGenerator:
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
            - Strict JSON array of exactly "total_questions" questions.
            - No additional commentary or text outside JSON.

        """



        prompt = f"Generate exam questions from the following text: {prompt}"
        response = hackai.get_text_from_hackai_response(prompt, assistant=promt_context)
        return response


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
       print(ExamGenerator.get_exam_questions())