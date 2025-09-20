import requests


class HackAPI():
    @staticmethod   
    def extract_text_from_hackai_response(response):
        choices : list = response["choices"]

        dict_choices : dict = choices[0]
        message : dict = dict_choices["message"]
        content_raw : str = message["content"].split("</think>")
        content_assistant : str = content_raw[0].replace("<think>","").strip()
        content_response : str = content_raw[1].strip() if len(content_raw) > 1 else ""

        return content_assistant, content_response

    def get_text_from_hackai_response(user_prompt: str = "Do nothing"):
        response = requests.post(
            "https://ai.hackclub.com/chat/completions",
            headers={"Content-Type": "application/json"},
            json={
                "messages": [{"role": "user", "content": user_prompt}, 
                            {"role": "system", "content": "You are a helpful assistant"}
                            ],
            },
        )
        assistant, response = HackAPI.extract_text_from_hackai_response(response.json())
        return response

prompt:str = "Can you help me finding a good recipe for apple pie?"
response = HackAPI.get_text_from_hackai_response(prompt)
print(response)