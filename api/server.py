"""Backend API del Radar Core SOC — Aurea Capital.

Espone i dati reali (letti da S3/LocalStack) al frontend React.
Avvio (dalla root del progetto):

    python -m uvicorn api.server:app --reload --port 8000

In sviluppo il frontend gira con Vite (`npm run dev` in web/) che fa da proxy
verso /api. In produzione si compila il frontend (`npm run build`) e questo
server serve anche i file statici di web/dist.
"""
import os

from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import data_access, pdf_gen

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


@app.get("/api/dashboard")
def dashboard():
    """Dati aggregati di tutte le sezioni collegate (una sola lettura S3)."""
    return JSONResponse(data_access.get_dashboard())


# --- Generazione PDF / dossier ---------------------------------------------
def _pdf(data: bytes, filename: str):
    return Response(content=data, media_type='application/pdf',
                    headers={'Content-Disposition': f'inline; filename="{filename}"'})


@app.get("/api/pdf/forense")
def pdf_forense(id: str = Query("")):
    dash = data_access.get_dashboard()
    alerts = dash['honeyfile']['alerts']
    item = next((h for h in alerts if h['id'] == id), None) or (alerts[0] if alerts else None)
    if not item:
        return Response(status_code=404, content='Nessun honey-hit disponibile')
    return _pdf(pdf_gen.pdf_forense(item), f"dossier_{item.get('user', 'forense')}.pdf")


@app.get("/api/pdf/esfiltrazione")
def pdf_esfiltrazione(id: str = Query("")):
    dash = data_access.get_dashboard()
    events = dash['esfiltrazione']['events']
    item = next((e for e in events if e['id'] == id), None) or (events[0] if events else None)
    if not item:
        return Response(status_code=404, content='Nessun evento disponibile')
    return _pdf(pdf_gen.pdf_esfiltrazione(item), f"incidente_{item.get('file', 'dlp')}.pdf")


@app.get("/api/pdf/honeytoken")
def pdf_honeytoken(name: str = Query("")):
    dash = data_access.get_dashboard()
    tokens = dash['honeytoken']['tokens']
    item = next((t for t in tokens if t['name'] == name), None) or (tokens[0] if tokens else None)
    if not item:
        return Response(status_code=404, content='Nessun token disponibile')
    return _pdf(pdf_gen.pdf_honeytoken(item), f"dossier_token_{item.get('tone', 'token')}.pdf")


@app.get("/api/pdf/behavioral")
def pdf_behavioral():
    dash = data_access.get_dashboard()
    return _pdf(pdf_gen.pdf_behavioral(dash['behavioral']), "report_behavioral.pdf")


@app.get("/api/pdf/nis2")
def pdf_nis2():
    dash = data_access.get_dashboard()
    return _pdf(pdf_gen.pdf_nis2(dash['report'], dash['overview']), "rapporto_nis2.pdf")


@app.get("/api/pdf/bundle")
def pdf_bundle():
    dash = data_access.get_dashboard()
    return Response(content=pdf_gen.bundle_zip(dash), media_type='application/zip',
                    headers={'Content-Disposition': 'attachment; filename="bundle_compliance_aurea.zip"'})


# --- Frontend statico (solo se gia' compilato) -----------------------------
_WEB_DIST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'web', 'dist')
if os.path.isdir(_WEB_DIST):
    from fastapi.staticfiles import StaticFiles
    # Montato per ULTIMO: le route /api/* definite sopra hanno precedenza.
    app.mount("/", StaticFiles(directory=_WEB_DIST, html=True), name="static")
