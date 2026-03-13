import streamlit as st
import pandas as pd
import plotly.express as px
from streamlit_folium import st_folium
import folium
from fpdf import FPDF
import json
import os

# CONFIGURAZIONE PAGINA
st.set_page_config(page_title="Radar Dashboard", layout="wide")

# GESTIONE TEMA (DARK/LIGHT)
if 'tema_scuro' not in st.session_state:
    st.session_state.tema_scuro = True

def toggle_tema():
    st.session_state.tema_scuro = not st.session_state.tema_scuro

# COLORI TEMA
if st.session_state.tema_scuro:
    bg_color = "#0D0D0D"
    card_color = "#1A1A1A"
    text_color = "#FFFFFF"
    accent_color = "#7B61FF"
else:
    bg_color = "#F8F9FA"
    card_color = "#FFFFFF"
    text_color = "#212529"
    accent_color = "#624BFF"

# CSS
st.markdown(f"""
    <style>
    /* Sfondo e testo principale */
    .stApp {{
        background-color: {bg_color};
        color: {text_color};
    }}
    /* Forza il colore del testo nella Sidebar */
    section[data-testid="stSidebar"] {{
        background-color: {card_color} !important;
    }}
    section[data-testid="stSidebar"] .stMarkdown p, 
    section[data-testid="stSidebar"] h1, 
    section[data-testid="stSidebar"] h3,
    section[data-testid="stSidebar"] span {{
        color: {text_color} !important;
    }}
    /* Colore dei valori delle metriche */
    [data-testid="stMetricValue"] {{
        color: {accent_color} !important;
    }}
    /* Stile Bottone Generale (Report) */
    div.stButton > button {{
        width: 100% !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        background-color: {accent_color} !important;
        color: white !important;
        border-radius: 8px;
        border: none;
        padding: 0.5rem;
    }}
    /* Stile Bottone Tema in alto a sinistra */
    .stSidebar .stButton > button {{
        width: 40px !important;
        height: 40px !important;
        border-radius: 50% !important;
        background-color: transparent !important;
        border: 1px solid {text_color}44 !important;
        color: {text_color} !important;
    }}
    </style>
    """, unsafe_allow_html=True)

# SIDEBAR
with st.sidebar:
    # Bottone cambio tema piccolo e in alto
    label_tema = "🌙" if st.session_state.tema_scuro else "☀️"
    st.button(label_tema, on_click=toggle_tema, help="Cambia modalità colore")
    
    st.divider()

    # Logo Scudo
    st.image("https://cdn-icons-png.flaticon.com/512/10613/10613674.png", width=80)
    
    # Titoli
    st.title("RADAR CORE")
    st.subheader("Modulo Auditing")
    
    st.divider()
    st.caption("Active Defense System v1.0")

# FUNZIONE RECUPERO DATI
def carica_log_auditing():
    # Qui simuleremo la lettura dal Bucket S3
    log_finti = [
        {"utente": "mario.rossi", "file": "Bilancio_2026.pdf", "ip": "192.168.1.50", "ora": "2026-03-12 15:00", "status": "Download"},
        {"utente": "luigi.verdi", "file": "Stipendi_HONEY.pdf", "ip": "10.0.0.15", "ora": "2026-03-12 16:30", "status": "Honey-Hit"},
        {"utente": "Unknown", "file": "Bilancio_2026.pdf", "ip": "203.0.113.42", "ora": "2026-03-12 22:15", "status": "Esfiltrazione"}
    ]
    return pd.DataFrame(log_finti)

df = carica_log_auditing()

# HEADER DASHBOARD
st.title("Centro Controllo Auditing & Detection")
col1, col2, col3, col4 = st.columns(4)
col1.metric("Integrità Sistema", "100%", "Safe")
col2.metric("Allarmi Attivi", "1", "Critico")
col3.metric("Documenti Protetti", "12", "S3 Protected")
col4.metric("Cloud Status", "LocalStack", "Active")
st.divider()

# MAPPA E GRAFICI 
c1, c2 = st.columns([2, 1])

with c1:
    st.subheader("🌐 Geolocalizzazione Accessi")
    
    mappa_stile = "CartoDB dark_matter" if st.session_state.tema_scuro else "CartoDB positron"
    
    # Creiamo la mappa 
    m = folium.Map(
        location=[55.75, 37.61], 
        zoom_start=3, 
        tiles=mappa_stile,
        control_scale=False,
        attr=' ' 
    )
    
    folium.Marker([55.75, 37.61], popup="Attacco Rilevato!", icon=folium.Icon(color='red', icon='info-sign')).add_to(m)
    folium.Marker([41.90, 12.49], popup="Sede Aziendale", icon=folium.Icon(color='blue', icon='home')).add_to(m)
    
    st_folium(m, use_container_width=True, height=400)

with c2:
    st.subheader("📊 Tipologia Eventi")
    fig = px.pie(df, names='status', color_discrete_sequence=[accent_color, "#FF4B4B", "#00CC96"])
    fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color=text_color, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

# TABELLA DETTAGLIATA
st.subheader("Registro Auditing Immutabile")
st.dataframe(df, use_container_width=True)

# GENERAZIONE REPORT
st.divider()
st.subheader("Esporta Report Forense")

if st.button("Genera Report PDF dell'Incidente"):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, "REPORT FORENSE - MODULO RADAR", ln=True, align='C')
    pdf.set_font("Arial", '', 12)
    pdf.ln(10)
    pdf.cell(200, 10, f"Data Report: 2026-03-13", ln=True)
    pdf.cell(200, 10, f"Minaccia Rilevata: Violazione Integrità Documento", ln=True)
    pdf.cell(200, 10, f"Analisi: L'IP 203.0.113.42 ha tentato l'esfiltrazione.", ln=True)
    
    pdf_output = pdf.output(dest='S').encode('latin-1')
    st.download_button(label="Scarica PDF", data=pdf_output, file_name="report_forense.pdf", mime="application/pdf")

st.success("Tutti i dati sono sincronizzati con l'architettura AWS LocalStack.")