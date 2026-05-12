import streamlit as st
import plotly.express as px
import pandas as pd
from dashboard.utils.data import ottieni_dati_hr
from dashboard.utils.pdf import crea_pdf_statistiche


def render(df, tema):
    if df.empty:
        st.markdown(
            f"<div style='background-color:{tema['box_hr_bg']};padding:15px;border-radius:8px;"
            f"color:{tema['muted']};text-align:center;'>Dati insufficienti per generare telemetria.</div>",
            unsafe_allow_html=True
        )
        return

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"<div style='font-weight:600;color:{tema['text']};text-align:center;margin-bottom:15px;'>Opzioni Minacce</div>", unsafe_allow_html=True)
        df_minacce = df[df['status'] != 'Download Regolare']
        fig1 = px.pie(
            df_minacce, names='status', hole=0.5, color='status',
            color_discrete_map={'Esfiltrazione': '#dc3545', 'Honey-Hit': '#ffc107'}
        )
        fig1.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color=tema['text'])
        st.plotly_chart(fig1, width='stretch')

    with col2:
        st.markdown(f"<div style='font-weight:600;color:{tema['text']};text-align:center;margin-bottom:10px;'>Reparti a Rischio</div>", unsafe_allow_html=True)
        reparti = [ottieni_dati_hr(u)['reparto'] for u in df['utente']]
        df_reparti = pd.DataFrame({'Reparto': reparti}).value_counts().reset_index(name='Violazioni')
        fig2 = px.bar(
            df_reparti, x='Reparto', y='Violazioni', color='Reparto',
            color_discrete_sequence=[tema['accent'], '#8B5CF6', '#3B82F6']
        )
        fig2.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)',
            font_color=tema['text'], margin=dict(t=0, b=0, l=0, r=0)
        )
        st.plotly_chart(fig2, use_container_width=True)

    st.markdown('<br><br>', unsafe_allow_html=True)
    pdf_bytes = crea_pdf_statistiche(df)
    st.download_button(
        label='ESPORTA REPORT MENSILE (PDF)',
        data=pdf_bytes,
        file_name='Report_Mensile_Radar.pdf',
        mime='application/pdf'
    )