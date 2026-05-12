import pandas as pd
import streamlit as st
import folium
from streamlit_folium import st_folium
from config import CONFIG
from dashboard.utils.pdf import crea_pdf_esfiltrazione


def render(df, tema):
    st.markdown(f"<h4 style='color:{tema['text']};font-weight:700;margin-top:0;'>Radar Geografico - DLP</h4>", unsafe_allow_html=True)

    df_esf = df[df['status'] == 'Esfiltrazione'] if not df.empty else pd.DataFrame()

    hq_lat = CONFIG['company']['hq_lat']
    hq_lon = CONFIG['company']['hq_lon']
    m = folium.Map(location=[hq_lat, hq_lon], zoom_start=3)
    folium.Marker([hq_lat, hq_lon], popup='Sede HQ', icon=folium.Icon(color='blue', icon='home')).add_to(m)

    if not df_esf.empty:
        ultimo = df_esf.iloc[0]
        st.markdown(
            f"<div style='background-color:#FFF3CD;border:1px solid #FFEEBA;padding:15px 20px;"
            f"border-radius:8px;margin-bottom:20px;'>"
            f"<span style='color:#856404;font-weight:bold;font-size:15px;letter-spacing:1px;'>ALLARME ESFILTRAZIONE (DLP):</span>"
            f"<span style='color:#856404;margin-left:10px;'>Il file <b>{ultimo['file']}</b> "
            f"è stato aperto fuori sede (IP: {ultimo['ip']})</span></div>",
            unsafe_allow_html=True
        )
        for _, row in df_esf.iterrows():
            if pd.notnull(row['lat']) and pd.notnull(row['lon']):
                folium.Marker(
                    [row['lat'], row['lon']],
                    popup=f"IP: {row['ip']}<br>File: {row['file']}",
                    icon=folium.Icon(color='red', icon='warning', prefix='fa')
                ).add_to(m)
        st.toast("ALLARME CRITICO: Documento aperto fuori dalla rete!", icon="🚨")
    else:
        st.markdown(
            f"<div style='background-color:{tema['box_hr_bg']};padding:15px;border-radius:8px;"
            f"color:{tema['muted']};text-align:center;margin-bottom:20px;'>Nessuna esfiltrazione rilevata. Documenti al sicuro.</div>",
            unsafe_allow_html=True
        )

    st_folium(m, use_container_width=True, height=350)

    st.markdown(f"<h4 style='color:{tema['text']};font-weight:700;margin-top:30px;'>Log di Esfiltrazione (Documenti Reali)</h4>", unsafe_allow_html=True)

    if not df_esf.empty:
        st.dataframe(
            df_esf[['file', 'ip', 'ora', 'status']].style.set_properties(**{
                'background-color': tema['card'],
                'color': tema['text'],
                'border-color': f"{tema['accent']}33"
            }),
            use_container_width=True
        )
        st.markdown('<br>', unsafe_allow_html=True)
        if st.button('Genera Report PDF Esfiltrazione', key='pdf_esfiltrazione'):
            pdf_bytes = crea_pdf_esfiltrazione(df_esf)
            st.download_button(
                label='Scarica il PDF Ufficiale',
                data=pdf_bytes,
                file_name=f"Report_Esfiltrazione_{df_esf.iloc[0]['ip']}.pdf",
                mime='application/pdf',
                type='primary'
            )