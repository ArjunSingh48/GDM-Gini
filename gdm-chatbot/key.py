import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY"),
)

completion = client.chat.completions.create(
    model="Qwen/Qwen2.5-14B:featherless-ai",
    messages=[
        {"role": "user", "content": "What is the capital of France?"}
    ],
)

print(completion.choices[0].message.content)