import searcher
import llm

def generatefromContext(prompt: str):
    search = searcher.LocalSearcher("./data", "./index")
    searcherResult = search.search(prompt)
    rawHack = llm.HackAPI.get_text_from_hackai(prompt, searcherResult)
    return llm.HackAPI.extract_text_from_response(rawHack)