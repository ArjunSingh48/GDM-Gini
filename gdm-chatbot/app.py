from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import re
from dotenv import load_dotenv
from openai import OpenAI

# ========================
# Load API Key
# ========================
load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY"),
)

# ========================
# Load Knowledge Base
# ========================
with open("data.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Split into chunks (clean)
chunks = [line.strip() for line in text.split("\n") if line.strip()]

# ========================
# Embedding Model
# ========================
model = SentenceTransformer("all-MiniLM-L6-v2")

embeddings = model.encode(chunks)
embeddings = np.array(embeddings).astype("float32")

# Normalize for cosine similarity
faiss.normalize_L2(embeddings)

dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)

# ========================
# Search Function (RAG)
# ========================
def search(query, k=5):
    query_embedding = model.encode([query]).astype("float32")
    faiss.normalize_L2(query_embedding)

    D, I = index.search(query_embedding, k)
    return [chunks[i] for i in I[0]]

# ========================
# Privacy Filter (light)
# ========================
def sanitize_query(query):
    # Only remove long numbers (avoid breaking meaning)
    query = re.sub(r'\d{4,}', '[NUMBER]', query)
    return query

# ========================
# Disclaimer
# ========================
def append_disclaimer(response):
    return f"{response}\n\nDisclaimer: This is AI-generated information and should not replace professional medical advice."

# ========================
# Ask LLM
# ========================
def ask_llm(query, context):
    response = client.chat.completions.create(
        model="Qwen/Qwen2.5-14B",
        messages=[
            {
                "role": "system",
                "content": """You are a medical assistant for gestational diabetes.

Rules:
- Prefer provided context
- If context is insufficient, use general medical knowledge carefully
- Never hallucinate or invent facts
- If unsure, say: "I don't know"
- Keep answers short, clear, and safe
- Do NOT give medication prescriptions
- Recommend consulting a healthcare professional when needed
"""
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{query}"
            }
        ],
        temperature=0,
        max_tokens=200,
    )

    answer = response.choices[0].message.content.strip()
    return append_disclaimer(answer)

# ========================
# Main Loop
# ========================
print("GDM Chatbot Ready (type 'exit' to quit)\n")

while True:
    query = input("Ask: ").strip()

    if query.lower() == "exit":
        break

    # Clean input
    safe_query = sanitize_query(query)

    # Retrieve context
    results = search(safe_query, k=5)
    context = "\n".join(results)

    # Get answer
    answer = ask_llm(safe_query, context)

    # Safety fallback
    if "I don't know" in answer or len(answer) < 20:
        answer = "I’m not confident about this. Please consult your healthcare provider."

    print("\nAnswer:", answer)
    print("-" * 50)