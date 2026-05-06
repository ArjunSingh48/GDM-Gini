from fastapi import FastAPI, Header, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import re
from dotenv import load_dotenv
from openai import OpenAI

from rag.store import ingest as rag_ingest, search as rag_search

# ========================
# Setup
# ========================
load_dotenv()

app = FastAPI()

# Allow the edge function / frontend to call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔐 Shared secret (must match CUSTOM_LLM_API_KEY in the edge function)
API_SECRET = os.getenv("API_SECRET")

# Hugging Face router (OpenAI-compatible)
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.getenv("HF_API_KEY") or os.getenv("HF_TOKEN"),
)

HF_MODEL = os.getenv("HF_MODEL", "Qwen/Qwen2.5-7B-Instruct")

# ========================
# Request format
# ========================
class Query(BaseModel):
    question: str

# ========================
# AUTH CHECK (Bearer Token)
# ========================
def verify_token(authorization: str | None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")
    token = authorization.replace("Bearer ", "", 1)
    if not API_SECRET or token != API_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")

# ========================
# Helpers
# ========================
def sanitize_query(query: str) -> str:
    return re.sub(r"\d{4,}", "[NUMBER]", query)

def ask_llm(query: str, context: str) -> str:
    response = client.chat.completions.create(
        model=HF_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a medical assistant for gestational diabetes.\n\n"
                    "Rules:\n"
                    "- Prefer provided context\n"
                    "- If context is insufficient, use general knowledge carefully\n"
                    "- Never hallucinate\n"
                    "- If unsure, say: \"I don't know\"\n"
                    "- Keep answers short and safe\n"
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{query}",
            },
        ],
        temperature=0,
        max_tokens=300,
    )
    return response.choices[0].message.content.strip()

# ========================
# /chat — SECURED, RAG-powered
# ========================
@app.post("/chat")
def chat(query: Query, authorization: str = Header(None)):
    verify_token(authorization)

    safe_query = sanitize_query(query.question)

    # Retrieve top-k relevant chunks from the FAISS index built by /ingest
    results = rag_search(safe_query, k=4)
    context = "\n\n---\n\n".join(c["text"] for c in results) if results else ""

    answer = ask_llm(safe_query, context)

    if "I don't know" in answer or len(answer) < 20:
        answer = "I'm not confident about this. Please consult your healthcare provider."

    return {"answer": answer}

# ========================
# /ingest — SECURED
# Upload one or more markdown files from the admin page (/admin/rag).
# Each file is chunked, embedded, and stored in the FAISS index on disk.
# Re-uploading a file replaces its previous chunks.
# ========================
@app.post("/ingest")
async def ingest_files(
    files: List[UploadFile] = File(...),
    authorization: str = Header(None),
):
    verify_token(authorization)

    payload: list[tuple[str, str]] = []
    for f in files:
        raw = await f.read()
        text = raw.decode("utf-8", errors="ignore")
        payload.append((f.filename, text))

    result = rag_ingest(payload)  # {"added": N, "total": M}
    return {
        "ok": True,
        "files": [f.filename for f in files],
        **result,
    }

# ========================
# Health checks
# ========================
@app.get("/")
def home():
    return {"message": "API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
