import streamlit as st
import pandas as pd
import plotly.express as px
from streamlit_folium import st_folium
import folium
import json
import boto3
from datetime import datetime
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

# CONFIGURAZIONE PAGINA E TEMA
st.set_page_config(page_title="Radar | SecurityVitals Synergy", layout="wide", initial_sidebar_state="collapsed")

# Predefinito: Tema Chiaro
if 'tema_scuro' not in st.session_state:
    st.session_state.tema_scuro = False

def toggle_tema():
    st.session_state.tema_scuro = not st.session_state.tema_scuro

# Palette Colori
if st.session_state.tema_scuro:
    bg_color = "#0B0E14"
    card_color = "#151A25"
    text_color = "#E2E8F0"
    text_muted = "#94A3B8"
    accent_color = "#6366F1"
    danger_color = "#EF4444"
    success_color = "#10B981"
    box_hr_bg = "#1E293B"
    box_hr_border = "#334155"
    box_alert_bg = "#2F1616"
    box_alert_border = "#5C2020"
else:
    bg_color = "#F4F7F9"
    card_color = "#FFFFFF"
    text_color = "#1E293B"
    text_muted = "#64748B"
    accent_color = "#4F46E5"
    danger_color = "#DC2626"
    success_color = "#059669"
    box_hr_bg = "#F1F5F9"
    box_hr_border = "#E2E8F0"
    box_alert_bg = "#FEF2F2"
    box_alert_border = "#FECACA"

# Iniezione CSS
st.markdown(f"""
    <style>
    #MainMenu {{visibility: hidden;}}
    header {{visibility: hidden;}}
    footer {{visibility: hidden;}}
    
    .stApp {{ background-color: {bg_color}; color: {text_color}; font-family: 'Inter', -apple-system, sans-serif; }}
    
    [data-testid="stMetric"] {{
        background-color: {card_color};
        border: 1px solid {accent_color}22;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.03);
    }}
    [data-testid="stMetricValue"] {{ color: {accent_color} !important; font-weight: 800; }}
    
    div[data-testid="stTabs"] > div[role="tablist"] {{
        justify-content: center;
        margin: 0 auto 30px auto;
        gap: 15px;
        background-color: {card_color};
        padding: 12px;
        border-radius: 16px;
        border: 1px solid {accent_color}11;
        box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        width: max-content;
        max-width: 100%;
    }}
    .stTabs [data-baseweb="tab"] {{
        border-radius: 10px !important;
        padding: 12px 28px !important;
        background-color: transparent;
        color: {text_muted};
        border: none !important;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
    }}
    .stTabs [aria-selected="true"] {{
        background: linear-gradient(135deg, {accent_color} 0%, #8B5CF6 100%) !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }}
    
    div[data-baseweb="select"] > div {{
        background-color: {card_color} !important;
        border-color: {accent_color}55 !important;
        color: {text_color} !important;
    }}
    
    div[data-baseweb="popover"], ul[role="listbox"], li[role="option"] {{
        background-color: {card_color} !important;
        color: {text_color} !important;
    }}
    li[role="option"]:hover {{ background-color: {accent_color}22 !important; }}
    
    div.stButton > button {{
        background: {card_color} !important;
        color: {accent_color} !important;
        border-radius: 8px;
        border: 1px solid {accent_color} !important;
        padding: 0.6rem 1.2rem;
        font-weight: 600;
        width: 100%;
        transition: all 0.3s ease;
    }}
    div.stButton > button:hover {{ background: {accent_color} !important; color: white !important; }}

    @media (max-width: 768px) {{
        div[data-testid="stTabs"] > div[role="tablist"] {{ flex-wrap: wrap; width: 100%; padding: 8px; gap: 5px; }}
        .stTabs [data-baseweb="tab"] {{ padding: 10px 15px !important; font-size: 13px; flex: 1 1 auto; text-align: center; }}
        .radar-title {{ font-size: 22px !important; }}
        .mobile-card {{ padding: 15px !important; }}
    }}
    </style>
""", unsafe_allow_html=True)

# Switch Tema
col_theme, col_space = st.columns([1, 15])
with col_theme:
    st.button("☀️" if st.session_state.tema_scuro else "🌙", on_click=toggle_tema)

# FUNZIONI DATI E AWS
def ottieni_dati_hr(username):
    db_hr = {
        "luigi.verdi": {"reparto": "Amministrazione", "ruolo": "Contabile Senior", "rischio": "ALTO (Livello 3)", "sede": "Sede Centrale - Piano 2"},
        "mario.rossi": {"reparto": "IT & Sistemi", "ruolo": "Amministratore di Rete", "rischio": "MEDIO (Livello 2)", "sede": "Data Center - Milano"}
    }
    return db_hr.get(username.lower(), {"reparto": "Sconosciuto", "ruolo": "Non assegnato", "rischio": "Non calcolato", "sede": "Remoto"})

@st.cache_data(ttl=2)
def carica_log_auditing():
    try:
        s3 = boto3.client('s3', endpoint_url='http://localhost:4566', region_name='us-east-1', aws_access_key_id='test', aws_secret_access_key='test')
        bucket_name = 'portale-sicurezza-logs'
        response = s3.list_objects_v2(Bucket=bucket_name)
        logs = []
        if 'Contents' in response:
            for item in response['Contents']:
                if not item['Key'].endswith('.json'): continue
                try:
                    obj = s3.get_object(Bucket=bucket_name, Key=item['Key'])
                    log_data = json.loads(obj['Body'].read().decode('utf-8'))
                    user_identity = log_data.get("userIdentity", {})
                    req_params = log_data.get("requestParameters", {})
                    nome_documento = req_params.get("documento", "Sconosciuto")
                    logs.append({
                        "utente": user_identity.get("userName", "Sconosciuto"),
                        "file": nome_documento,
                        "ip": log_data.get("sourceIPAddress", "0.0.0.0"),
                        "ora": log_data.get("eventTime", "N/A"),
                        "status": "Honey-Hit" if "HONEY" in nome_documento else "Download Regolare"
                    })
                except: pass
        df = pd.DataFrame(logs) if logs else pd.DataFrame(columns=["utente", "file", "ip", "ora", "status"])
        if not df.empty:
            df = df.sort_values(by="ora", ascending=False).reset_index(drop=True)
        return df
    except Exception:
        return pd.DataFrame(columns=["utente", "file", "ip", "ora", "status"])

df = carica_log_auditing()

# GENERATORI PDF

def crea_pdf_forense(dati_incidente, dati_hr):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    pdf_accent = colors.HexColor("#4F46E5")
    pdf_hr_bg = colors.HexColor("#F0F4F8")
    pdf_alert_bg = colors.HexColor("#FEF2F2")
    pdf_text = colors.HexColor("#1E293B")
    
    c.setFillColor(pdf_accent)
    c.roundRect(40, height - 90, width - 80, 50, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(60, height - 68, "DOSSIER INDAGINE FORENSE")
    c.setFont("Helvetica", 10)
    c.drawString(60, height - 82, f"Rif. Evento: {dati_incidente['ora'].replace(':', '')} | Tipo: INSIDER THREAT")
    
    c.setFillColor(pdf_hr_bg)
    c.setStrokeColor(colors.HexColor("#CBD5E1"))
    c.roundRect(40, height - 230, width - 80, 110, 8, fill=1, stroke=1)
    c.setFillColor(pdf_text)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, height - 145, "PROFILO DIPENDENTE (HR)")
    c.setFont("Helvetica", 11)
    c.drawString(60, height - 170, f"Account Utente: {dati_incidente['utente']}")
    c.drawString(60, height - 190, f"Reparto: {dati_hr['reparto']}")
    c.drawString(60, height - 210, f"Ruolo / Sede: {dati_hr['ruolo']} | {dati_hr['sede']}")
    
    c.setFillColor(pdf_alert_bg)
    c.setStrokeColor(colors.HexColor("#FECACA"))
    c.roundRect(40, height - 390, width - 80, 130, 8, fill=1, stroke=1)
    c.setFillColor(colors.HexColor("#991B1B"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(60, height - 285, "DETTAGLI VIOLAZIONE HONEYFILE")
    c.setFillColor(pdf_text)
    c.setFont("Helvetica", 11)
    c.drawString(60, height - 310, f"File Tracciato: {dati_incidente['file']}")
    c.drawString(60, height - 330, f"Data e Ora: {dati_incidente['ora']}")
    c.drawString(60, height - 350, f"Indirizzo IP: {dati_incidente['ip']}")
    c.setFillColor(colors.HexColor("#DC2626"))
    c.setFont("Helvetica-Bold", 11)
    c.drawString(60, height - 370, f"RISCHIO: {dati_hr['rischio']}")
    
    c.save()
    return buffer.getvalue()

def crea_pdf_statistiche(df):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    c.setFillColor(colors.HexColor("#1E293B"))
    c.roundRect(40, height - 90, width - 80, 50, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(60, height - 68, "REPORT MENSILE TELEMETRIA")
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont("Helvetica", 12)
    totali = len(df)
    honey = len(df[df['status'] == 'Honey-Hit'])
    c.drawString(60, height - 150, f"Eventi Registrati: {totali}")
    c.drawString(60, height - 180, f"Violazioni Honeyfile Rilevate: {honey}")
    c.drawString(60, height - 210, f"Download Regolari: {totali - honey}")
    c.save()
    return buffer.getvalue()

# DASHBOARD E MODULI
st.markdown(f"""
<div style="text-align: center; margin-bottom: 30px;">
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="{accent_color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
    <h1 class="radar-title" style="margin: 10px 0 0 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; color: {text_color};">RADAR CORE</h1>
    <p style="margin: 0; color: {text_muted}; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">SecurityVitals Synergy</p>
</div>
""", unsafe_allow_html=True)

col1, col2, col3, col4 = st.columns(4)
vitals_score = 100 - (len(df[df['status'] == 'Honey-Hit']) * 5)
col1.metric("Vitals Score", f"{max(0, vitals_score)}/100", "Attenzione" if vitals_score < 90 else "Stabile")
col2.metric("Minacce Rilevate", str(len(df[df['status'] == 'Honey-Hit'])), "Honey-Hits")
col3.metric("Asset Monitorati", "2", "Canary Tokens")
col4.metric("Stato del Nucleo", "LIVE", "LocalStack S3")
st.markdown("<br>", unsafe_allow_html=True)

tab_honey, tab_real, tab_stats = st.tabs(["HONEYFILE", "ESFILTRAZIONE", "REPORT"])

# MODULO HONEYFILE E AZIONI
with tab_honey:
    df_honey = df[df['status'] == 'Honey-Hit']
    
    if not df_honey.empty:
        ultimo_attacco = df_honey.iloc[0]
        
        # NOTIFICHE PUSH A COMPARSA
        # Appariranno nell'angolo in basso a destra dello schermo
        st.toast(f"🚨 ALLARME: Rilevata violazione da {ultimo_attacco['utente']}!", icon="🚨")

        st.markdown(f"""
        <div style="background-color: {box_alert_bg}; border: 1px solid {box_alert_border}; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
            <span style="color: {danger_color}; font-weight: bold; font-size: 15px; letter-spacing: 1px;">ALLARME ATTIVO:</span>
            <span style="color: {text_color}; margin-left: 10px;">Violazione da <b>{ultimo_attacco['utente']}</b> alle {ultimo_attacco['ora']} (IP: {ultimo_attacco['ip']})</span>
        </div>
        """, unsafe_allow_html=True)
        
        # Blocco
        col_btn1, col_btn2 = st.columns(2)
        with col_btn1:
            if st.button("🔴 Esegui Blocco Istantaneo e Revoca Permessi"):
                st.toast(f"Protocollo attivato: Permessi revocati per l'IP {ultimo_attacco['ip']}", icon="✅")
        
        st.markdown("<br>", unsafe_allow_html=True)

        styled_df_honey = df_honey.style.set_properties(**{
            'background-color': card_color,
            'color': text_color,
            'border-color': f"{accent_color}33"
        })
        st.dataframe(styled_df_honey, use_container_width=True)
        
        st.markdown("<br><h4 style='color: " + text_color + "; font-weight: 700;'>Indagine Forense</h4>", unsafe_allow_html=True)
        
        opzioni_incidente = [f"{row['ora']} - {row['utente']} ({row['file']})" for index, row in df_honey.iterrows()]
        selezione = st.selectbox("Seleziona incidente dal registro:", opzioni_incidente, label_visibility="collapsed")
        
        if selezione:
            indice_selezionato = opzioni_incidente.index(selezione)
            dati_incidente = df_honey.iloc[indice_selezionato]
            dati_hr = ottieni_dati_hr(dati_incidente['utente'])
            
            c1, c2 = st.columns(2)
            with c1:
                st.markdown(f"""
                <div class="mobile-card" style="background-color: {box_hr_bg}; border: 1px solid {box_hr_border}; padding: 25px; border-radius: 12px; height: 100%;">
                    <div style="font-size: 12px; font-weight: bold; color: {accent_color}; margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase;">Profilo Risorse Umane</div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">ACCOUNT</span><br><span style="color: {text_color}; font-size: 15px; font-weight: 600;">{dati_incidente['utente']}</span></div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">REPARTO</span><br><span style="color: {text_color}; font-size: 15px;">{dati_hr['reparto']}</span></div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">RUOLO</span><br><span style="color: {text_color}; font-size: 15px;">{dati_hr['ruolo']}</span></div>
                    <div><span style="color: {text_muted}; font-size: 13px;">SEDE</span><br><span style="color: {text_color}; font-size: 15px;">{dati_hr['sede']}</span></div>
                </div>
                """, unsafe_allow_html=True)
            with c2:
                st.markdown(f"""
                <div class="mobile-card" style="background-color: {box_alert_bg}; border: 1px solid {box_alert_border}; padding: 25px; border-radius: 12px; height: 100%;">
                    <div style="font-size: 12px; font-weight: bold; color: {danger_color}; margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase;">Dettagli Violazione</div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">FILE TRACCIATO</span><br><span style="color: {text_color}; font-size: 15px; font-weight: 600;">{dati_incidente['file']}</span></div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">DATA E ORA</span><br><span style="color: {text_color}; font-size: 15px;">{dati_incidente['ora']}</span></div>
                    <div style="margin-bottom: 10px;"><span style="color: {text_muted}; font-size: 13px;">IP SORGENTE</span><br><span style="color: {text_color}; font-size: 15px;">{dati_incidente['ip']}</span></div>
                    <div><span style="color: {text_muted}; font-size: 13px;">LIVELLO RISCHIO</span><br><span style="color: {danger_color}; font-size: 15px; font-weight: bold;">{dati_hr['rischio']}</span></div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("<br>", unsafe_allow_html=True)
            pdf_bytes = crea_pdf_forense(dati_incidente, dati_hr)
            st.download_button(label="ESPORTA DOSSIER FORENSE (PDF)", data=pdf_bytes, file_name=f"Dossier_{dati_incidente['utente']}.pdf", mime="application/pdf")
    else:
        st.markdown(f"<div style='background-color: {box_hr_bg}; padding: 15px; border-radius: 8px; color: {text_muted}; text-align: center;'>Nessuna minaccia interna rilevata.</div>", unsafe_allow_html=True)

#MODULO ESFILTRAZIONE
with tab_real:
    st.markdown(f"<h4 style='color: {text_color}; font-weight: 700; margin-top:0;'>Radar Geografico</h4>", unsafe_allow_html=True)
    m = folium.Map(location=[45.4642, 9.1900], zoom_start=4, tiles="CartoDB dark_matter" if st.session_state.tema_scuro else "CartoDB positron", control_scale=False)
    folium.Marker([41.90, 12.49], popup="Sede HQ - Roma", icon=folium.Icon(color='blue', icon='home')).add_to(m)
    st_folium(m, use_container_width=True, height=350)
    
    st.markdown(f"<h4 style='color: {text_color}; font-weight: 700; margin-top:30px;'>Tracciamento Canary Tokens</h4>", unsafe_allow_html=True)
    df_reali = df[df['status'] != 'Honey-Hit']
    styled_df_reali = df_reali.style.set_properties(**{ 'background-color': card_color, 'color': text_color, 'border-color': f"{accent_color}33" })
    st.dataframe(styled_df_reali, use_container_width=True)

#MODULO REPORT
with tab_stats:
    if not df.empty:
        col_grafici1, col_grafici2 = st.columns(2)
        with col_grafici1:
            st.markdown(f"<div style='font-weight:600; color:{text_color}; text-align:center; margin-bottom:10px;'>Tipologia Minacce</div>", unsafe_allow_html=True)
            fig1 = px.pie(df, names='status', hole=0.5, color_discrete_sequence=[danger_color, success_color])
            fig1.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color=text_color, margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig1, use_container_width=True)
            
        with col_grafici2:
            st.markdown(f"<div style='font-weight:600; color:{text_color}; text-align:center; margin-bottom:10px;'>Reparti a Rischio</div>", unsafe_allow_html=True)
            reparti = [ottieni_dati_hr(user)['reparto'] for user in df['utente']]
            df_reparti = pd.DataFrame({'Reparto': reparti}).value_counts().reset_index(name='Violazioni')
            fig2 = px.bar(df_reparti, x='Reparto', y='Violazioni', color='Reparto', color_discrete_sequence=[accent_color, '#8B5CF6', '#3B82F6'])
            fig2.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color=text_color, margin=dict(t=0, b=0, l=0, r=0))
            st.plotly_chart(fig2, use_container_width=True)
        
        st.markdown("<br><br>", unsafe_allow_html=True)
        pdf_stats_bytes = crea_pdf_statistiche(df)
        st.download_button(label="ESPORTA REPORT MENSILE (PDF)", data=pdf_stats_bytes, file_name="Report_Mensile_Radar.pdf", mime="application/pdf")
    else:
        st.markdown(f"<div style='background-color: {box_hr_bg}; padding: 15px; border-radius: 8px; color: {text_muted}; text-align: center;'>Dati insufficienti per generare telemetria.</div>", unsafe_allow_html=True)