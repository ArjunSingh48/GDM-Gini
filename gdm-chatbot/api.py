from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import re
from dotenv import load_dotenv
from openai import OpenAI

# ========================
# Setup
# ========================
app = FastAPI()

load_dotenv()

# 🔐 SECURITY SECRET
API_SECRET = os.getenv("API_SECRET")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY"),
)

# ========================
# Load Data
# ========================
with open("data.txt", "r", encoding="utf-8") as f:
    text = f.read()

chunks = [line.strip() for line in text.split("\n") if line.strip()]

# ========================
# Embeddings
# ========================
model = SentenceTransformer("all-MiniLM-L6-v2")

if os.path.exists("embeddings.npy"):
    embeddings = np.load("embeddings.npy")
else:
    embeddings = model.encode(chunks)
    embeddings = np.array(embeddings).astype("float32")
    np.save("embeddings.npy", embeddings)

faiss.normalize_L2(embeddings)

dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(embeddings)

# ========================
# Request format
# ========================
class Query(BaseModel):
    question: str

# ========================
# AUTH CHECK (Bearer Token)
# ========================
def verify_token(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = authorization.replace("Bearer ", "")

    if token != API_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

# ========================
# Helper functions
# ========================
def sanitize_query(query):
    return re.sub(r'\d{4,}', '[NUMBER]', query)

def search(query, k=5):
    query_embedding = model.encode([query]).astype("float32")
    faiss.normalize_L2(query_embedding)

    D, I = index.search(query_embedding, k)
    return [chunks[i] for i in I[0]]

def ask_llm(query, context):
    response = client.chat.completions.create(
        model="Qwen/Qwen2.5-7B-Instruct",
        messages=[
            {
                "role": "system",
                "content": """You are a medical assistant for gestational diabetes.

Rules:
- Prefer provided context
- If context is insufficient, use general knowledge carefully
- Never hallucinate
- If unsure, say: "I don't know"
- Keep answers short and safe
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

    return response.choices[0].message.content.strip()

# ========================
# API Endpoint (SECURED)
# ========================
@app.post("/chat")
def chat(
    query: Query,
    authorization: str = Header(None)
):
    # 🔐 AUTH CHECK
    verify_token(authorization)

    safe_query = sanitize_query(query.question)

    results = search(safe_query)
    context = "\n".join(results)

    answer = ask_llm(safe_query, context)

    if "I don't know" in answer or len(answer) < 20:
        answer = "I’m not confident about this. Please consult your healthcare provider."

    return {"answer": answer}

# ========================
# Health check
# ========================
@app.get("/")
def home():
    return {"message": "API is running"}

print("API_SECRET =", API_SECRET)