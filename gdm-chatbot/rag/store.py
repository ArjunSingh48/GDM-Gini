import os, json, re
from pathlib import Path
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
INDEX_PATH = DATA_DIR / "index.faiss"
CHUNKS_PATH = DATA_DIR / "chunks.json"

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # 384 dims, fast
DIM = 384
CHUNK_SIZE = 700      # characters
CHUNK_OVERLAP = 120

_model = None
def model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBED_MODEL)
    return _model

def chunk_markdown(text: str, source: str):
    # Split on headings first, then sub-chunk by size
    blocks = re.split(r"\n(?=#{1,6}\s)", text)
    chunks = []
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        if len(block) <= CHUNK_SIZE:
            chunks.append({"source": source, "text": block})
        else:
            i = 0
            while i < len(block):
                chunks.append({"source": source, "text": block[i:i+CHUNK_SIZE]})
                i += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks

def _load():
    if INDEX_PATH.exists() and CHUNKS_PATH.exists():
        index = faiss.read_index(str(INDEX_PATH))
        chunks = json.loads(CHUNKS_PATH.read_text())
        return index, chunks
    return faiss.IndexFlatIP(DIM), []

def _save(index, chunks):
    faiss.write_index(index, str(INDEX_PATH))
    CHUNKS_PATH.write_text(json.dumps(chunks, ensure_ascii=False))

def ingest(files: list[tuple[str, str]]):
    """files = [(filename, markdown_text), ...]. Replaces any existing chunks from the same filename."""
    index, chunks = _load()
    # Drop existing chunks from these sources
    sources = {f[0] for f in files}
    keep_ids = [i for i, c in enumerate(chunks) if c["source"] not in sources]
    if keep_ids and len(keep_ids) != len(chunks):
        kept_vecs = np.vstack([index.reconstruct(i) for i in keep_ids])
        chunks = [chunks[i] for i in keep_ids]
        index = faiss.IndexFlatIP(DIM)
        index.add(kept_vecs)
    elif not keep_ids:
        index = faiss.IndexFlatIP(DIM)
        chunks = []

    new_chunks = []
    for name, text in files:
        new_chunks.extend(chunk_markdown(text, name))
    if not new_chunks:
        _save(index, chunks)
        return {"added": 0, "total": len(chunks)}

    vecs = model().encode([c["text"] for c in new_chunks], normalize_embeddings=True)
    index.add(np.array(vecs, dtype="float32"))
    chunks.extend(new_chunks)
    _save(index, chunks)
    return {"added": len(new_chunks), "total": len(chunks)}

def search(query: str, k: int = 4):
    index, chunks = _load()
    if not chunks:
        return []
    qv = model().encode([query], normalize_embeddings=True)
    scores, idxs = index.search(np.array(qv, dtype="float32"), k)
    return [chunks[i] for i in idxs[0] if i < len(chunks)]
