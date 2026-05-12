import streamlit as st
from dashboard.utils.data import carica_log_auditing
from dashboard.tabs import honeyfile, esfiltrazione, report

st.set_page_config(page_title="Radar | SecurityVitals Synergy", layout="wide", initial_sidebar_state="collapsed")

if 'tema_scuro' not in st.session_state:
    st.session_state.tema_scuro = False

def toggle_tema():
    st.session_state.tema_scuro = not st.session_state.tema_scuro

if st.session_state.tema_scuro:
    tema = {
        'bg': '#0B0E14', 'card': '#151A25', 'text': '#E2E8F0', 'muted': '#94A3B8',
        'accent': '#6366F1', 'danger': '#EF4444', 'success': '#10B981',
        'box_hr_bg': '#1E293B', 'box_hr_border': '#334155',
        'box_alert_bg': '#2F1616', 'box_alert_border': '#5C2020',
    }
else:
    tema = {
        'bg': '#F4F7F9', 'card': '#FFFFFF', 'text': '#1E293B', 'muted': '#64748B',
        'accent': '#4F46E5', 'danger': '#DC2626', 'success': '#059669',
        'box_hr_bg': '#F1F5F9', 'box_hr_border': '#E2E8F0',
        'box_alert_bg': '#FEF2F2', 'box_alert_border': '#FECACA',
    }

st.markdown(f"""
    <style>
    #MainMenu {{visibility: hidden;}} header {{visibility: hidden;}} footer {{visibility: hidden;}}
    .stApp {{ background-color: {tema['bg']}; color: {tema['text']}; font-family: 'Inter', -apple-system, sans-serif; }}
    [data-testid="stMetric"] {{ background-color: {tema['card']}; border: 1px solid {tema['accent']}22; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }}
    [data-testid="stMetricValue"] {{ color: {tema['accent']} !important; font-weight: 800; }}
    div[data-testid="stTabs"] > div[role="tablist"] {{ justify-content: center; margin: 0 auto 30px auto; gap: 15px; background-color: {tema['card']}; padding: 12px; border-radius: 16px; border: 1px solid {tema['accent']}11; box-shadow: 0 4px 20px rgba(0,0,0,0.04); width: max-content; max-width: 100%; }}
    .stTabs [data-baseweb="tab"] {{ border-radius: 10px !important; padding: 12px 28px !important; background-color: transparent; color: {tema['muted']}; border: none !important; font-weight: 600; letter-spacing: 0.5px; transition: all 0.3s ease; }}
    .stTabs [aria-selected="true"] {{ background: linear-gradient(135deg, {tema['accent']} 0%, #8B5CF6 100%) !important; color: white !important; box-shadow: 0 4px 15px rgba(99,102,241,0.4); }}
    div[data-baseweb="select"] > div {{ background-color: {tema['card']} !important; border-color: {tema['accent']}55 !important; color: {tema['text']} !important; }}
    div[data-baseweb="popover"], ul[role="listbox"], li[role="option"] {{ background-color: {tema['card']} !important; color: {tema['text']} !important; }}
    li[role="option"]:hover {{ background-color: {tema['accent']}22 !important; }}
    div.stButton > button {{ background: {tema['card']} !important; color: {tema['accent']} !important; border-radius: 8px; border: 1px solid {tema['accent']} !important; padding: 0.6rem 1.2rem; font-weight: 600; width: 100%; transition: all 0.3s ease; }}
    div.stButton > button:hover {{ background: {tema['accent']} !important; color: white !important; }}
    @media (max-width: 768px) {{ div[data-testid="stTabs"] > div[role="tablist"] {{ flex-wrap: wrap; width: 100%; padding: 8px; gap: 5px; }} .stTabs [data-baseweb="tab"] {{ padding: 10px 15px !important; font-size: 13px; flex: 1 1 auto; text-align: center; }} .radar-title {{ font-size: 22px !important; }} .mobile-card {{ padding: 15px !important; }} }}
    </style>
""", unsafe_allow_html=True)

col_theme, _ = st.columns([1, 15])
with col_theme:
    st.button("☀️" if st.session_state.tema_scuro else "🌙", on_click=toggle_tema)

st.markdown(f"""
<div style="text-align:center;margin-bottom:30px;">
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="{tema['accent']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
    <h1 class="radar-title" style="margin:10px 0 0 0;font-size:26px;font-weight:800;letter-spacing:1px;color:{tema['text']};">RADAR CORE</h1>
    <p style="margin:0;color:{tema['muted']};font-size:13px;text-transform:uppercase;letter-spacing:2px;">SecurityVitals Synergy</p>
</div>
""", unsafe_allow_html=True)

df = carica_log_auditing()
df_honey = df[df['status'] == 'Honey-Hit'] if not df.empty else df

vitals_score = max(0, 100 - len(df_honey) * 5)
col1, col2, col3, col4 = st.columns(4)
col1.metric("Vitals Score", f"{vitals_score}/100", "Attenzione" if vitals_score < 90 else "Stabile")
col2.metric("Minacce Rilevate", str(len(df_honey)), "Honey-Hits")
col3.metric("Asset Monitorati", "2", "Canary Tokens")
col4.metric("Stato del Nucleo", "LIVE", "LocalStack S3")
st.markdown('<br>', unsafe_allow_html=True)

tab_honey, tab_real, tab_stats = st.tabs(["HONEYFILE", "ESFILTRAZIONE", "REPORT"])
with tab_honey:
    honeyfile.render(df_honey, tema)
with tab_real:
    esfiltrazione.render(df, tema)
with tab_stats:
    report.render(df, tema)