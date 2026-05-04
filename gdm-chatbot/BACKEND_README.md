# GDM Guide — Backend (Gini Chat API)

A FastAPI service that powers the **Gini** chatbot. It wraps a Hugging Face–hosted LLM (`Qwen/Qwen2.5-7B-Instruct`) with a RAG pipeline grounded in curated GDM educational content, and exposes a single `/chat` endpoint consumed by the frontend.

## Tech stack

- **Python 3.10+**
- **FastAPI** + **Uvicorn**
- **Hugging Face Inference API** (Qwen 2.5 7B Instruct)
- **Sentence-Transformers** / **FAISS** (or similar) for retrieval over the source PDF
- **ngrok** (or any public tunnel) to expose the local server to the frontend's edge function

## Prerequisites

- Python **3.10** or newer
- `pip` and `venv`
- A **Hugging Face access token** with Inference API permissions
- (Optional) **ngrok** account + auth token for exposing the API publicly

## Setup

```bash
# 1. Clone the backend repo and enter it
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate           # Windows PowerShell

# 3. Install dependencies
pip install -r requirements.txt
```

## Environment variables

Create a `.env` file in the backend root:

```env
# Hugging Face inference
HF_TOKEN="hf_xxx_your_token_here"
HF_MODEL="Qwen/Qwen2.5-7B-Instruct"

# Shared secret — must match CUSTOM_LLM_API_KEY in the frontend's edge function
API_SECRET="choose-a-long-random-string"

# Optional
PORT=8000
```

## Run locally

```bash
# Start the FastAPI server with auto-reload
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

The API is now available at **http://localhost:8000**.

Quick health check:

```bash
curl http://localhost:8000/health
```

## Endpoint

### `POST /chat`

**Headers**

| Header           | Value                          |
|------------------|--------------------------------|
| `Content-Type`   | `application/json`             |
| `Authorization`  | `Bearer <API_SECRET>`          |

**Request body**

```json
{
  "question": "What can I eat for breakfast?"
}
```

**Response**

```json
{
  "answer": "A balanced GDM-friendly breakfast pairs..."
}
```

**Example**

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_SECRET" \
  -d '{"question":"Is walking after meals helpful?"}'
```

## Exposing the API to the frontend

The frontend's `chat` edge function calls a public URL. The simplest way to expose your local server is with ngrok:

```bash
# 1. (One-time) authenticate ngrok
ngrok config add-authtoken <YOUR_NGROK_TOKEN>

# 2. Start the tunnel
ngrok http 8000
```

Copy the generated `https://xxxx.ngrok-free.app` URL and configure these two secrets in the frontend's backend dashboard:

| Secret name           | Value                                          |
|-----------------------|------------------------------------------------|
| `CUSTOM_LLM_URL`      | `https://xxxx.ngrok-free.app/chat`             |
| `CUSTOM_LLM_API_KEY`  | The same string you set as `API_SECRET` here   |

## Project structure

```
backend/
├── api.py                # FastAPI app + /chat endpoint
├── rag/                  # Retrieval pipeline (chunking, embeddings, search)
├── data/                 # Source PDF + generated embeddings index
├── requirements.txt
└── .env                  # Local secrets (not committed)
```

## Notes

- The model is **text-to-text only**. Speech-to-text is handled in the browser (Web Speech API).
- All answers are grounded in the curated source PDF; the frontend automatically appends a medical-disclaimer line if the model doesn't include one.
- Keep `API_SECRET` long and random — it is the only thing protecting your tunnel from abuse.
