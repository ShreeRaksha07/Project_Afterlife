
import os
from dotenv import load_dotenv
from groq import Groq

# Load the API key from backend/.env
load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: Groq API key not found!")
else:
    try:
        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": "Say hello and confirm that Groq is connected."
                }
            ]
        )

        print("SUCCESS: Groq connected!")
        print(response.choices[0].message.content)

    except Exception as e:
        print("Groq connection failed:")
        print(e)
