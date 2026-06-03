"""Backend API del Radar Core SOC — Aurea Capital.

Espone i dati reali (letti da S3/LocalStack) al frontend React.
Avvio (dalla root del progetto):

    python -m uvicorn api.server:app --reload --port 8000

In sviluppo il frontend gira con Vite (`npm run dev` in web/) che fa da proxy
verso /api. In produzione si compila il frontend (`npm run build`) e questo
server serve anche i file statici di web/dist.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import data_access

app = FastAPI(title="Radar Core SOC API", version="1.0")

# CORS: utile in sviluppo quando il frontend gira su un'altra porta (Vite :5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "radar-core-soc"}


@app.get("/api/overview")
def overview():
    return JSONResponse(data_access.get_overview())


# --- Frontend statico (solo se gia' compilato) -----------------------------
_WEB_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'web', 'dist')
if os.path.isdir(_WEB_DIST):
    from fastapi.staticfiles import StaticFiles
    # Montato per ULTIMO: le route /api/* definite sopra hanno precedenza.
    app.mount("/", StaticFiles(directory=_WEB_DIST, html=True), name="static")
