import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set in environment")

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"


def get_llm_definition(term: str,
                       model: str = "llama3-8b-8192",
                       max_tokens: int = 60,
                       backoff: float = 2.1) -> str:
    """
    Ask the Groq API for a short definition of `term`.
    """
    prompt = (
        f"You are a concise biomedical ontology assistant.\n"
        f"Provide a one-sentence definition for the entity “{term}”.\n"
        f"If you are unsure, reply exactly: No definition available."
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are helpful and precise."},
            {"role": "user",   "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.0,
    }

    resp = requests.post(GROQ_CHAT_URL, json=payload, headers=headers)
    resp.raise_for_status()
    data = resp.json()

    time.sleep(backoff)

     #Groq’s response JSON mirrors the OpenAI Chat format
    return data["choices"][0]["message"]["content"].strip()

#llm_def = get_llm_definition("p group")
#print(f"LLM definition: {llm_def}")
