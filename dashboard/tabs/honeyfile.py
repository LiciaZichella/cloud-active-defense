import streamlit as st
from dashboard.utils.data import ottieni_dati_hr
from dashboard.utils.pdf import crea_pdf_forense


def render(df_honey, tema):
    if df_honey.empty:
        st.markdown(
            f"<div style='background-color:{tema['box_hr_bg']};padding:15px;border-radius:8px;"
            f"color:{tema['muted']};text-align:center;'>Nessuna minaccia interna rilevata.</div>",
            unsafe_allow_html=True
        )
        return

    ultimo = df_honey.iloc[0]
    st.toast(f"ALLARME: Rilevata violazione da {ultimo['utente']}!", icon="🚨")

    st.markdown(
        f"<div style='background-color:{tema['box_alert_bg']};border:1px solid {tema['box_alert_border']};"
        f"padding:15px 20px;border-radius:8px;margin-bottom:20px;'>"
        f"<span style='color:{tema['danger']};font-weight:bold;font-size:15px;letter-spacing:1px;'>ALLARME ATTIVO:</span>"
        f"<span style='color:{tema['text']};margin-left:10px;'>Violazione da <b>{ultimo['utente']}</b> "
        f"alle {ultimo['ora']} (IP: {ultimo['ip']})</span></div>",
        unsafe_allow_html=True
    )

    col_btn1, _ = st.columns(2)
    with col_btn1:
        if st.button("Esegui Blocco Istantaneo e Revoca Permessi"):
            st.toast(f"Protocollo attivato: Permessi revocati per l'IP {ultimo['ip']}", icon="✅")

    st.markdown('<br>', unsafe_allow_html=True)
    st.dataframe(
        df_honey.style.set_properties(**{
            'background-color': tema['card'],
            'color': tema['text'],
            'border-color': f"{tema['accent']}33"
        }),
        use_container_width=True
    )

    st.markdown(f"<br><h4 style='color:{tema['text']};font-weight:700;'>Indagine Forense</h4>", unsafe_allow_html=True)
    opzioni = [f"{r['ora']} - {r['utente']} ({r['file']})" for _, r in df_honey.iterrows()]
    selezione = st.selectbox('Seleziona incidente dal registro:', opzioni, label_visibility='collapsed')

    if selezione:
        idx = opzioni.index(selezione)
        incidente = df_honey.iloc[idx]
        hr = ottieni_dati_hr(incidente['utente'])

        c1, c2 = st.columns(2)
        with c1:
            st.markdown(
                f"<div class='mobile-card' style='background-color:{tema['box_hr_bg']};border:1px solid {tema['box_hr_border']};"
                f"padding:25px;border-radius:12px;height:100%;'>"
                f"<div style='font-size:12px;font-weight:bold;color:{tema['accent']};margin-bottom:15px;letter-spacing:1px;text-transform:uppercase;'>Profilo Risorse Umane</div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>ACCOUNT</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;font-weight:600;'>{incidente['utente']}</span></div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>REPARTO</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;'>{hr['reparto']}</span></div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>RUOLO</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;'>{hr['ruolo']}</span></div>"
                f"<div><span style='color:{tema['muted']};font-size:13px;'>SEDE</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;'>{hr['sede']}</span></div></div>",
                unsafe_allow_html=True
            )
        with c2:
            st.markdown(
                f"<div class='mobile-card' style='background-color:{tema['box_alert_bg']};border:1px solid {tema['box_alert_border']};"
                f"padding:25px;border-radius:12px;height:100%;'>"
                f"<div style='font-size:12px;font-weight:bold;color:{tema['danger']};margin-bottom:15px;letter-spacing:1px;text-transform:uppercase;'>Dettagli Violazione</div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>FILE TRACCIATO</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;font-weight:600;'>{incidente['file']}</span></div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>DATA E ORA</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;'>{incidente['ora']}</span></div>"
                f"<div style='margin-bottom:10px;'><span style='color:{tema['muted']};font-size:13px;'>IP SORGENTE</span><br>"
                f"<span style='color:{tema['text']};font-size:15px;'>{incidente['ip']}</span></div>"
                f"<div><span style='color:{tema['muted']};font-size:13px;'>LIVELLO RISCHIO</span><br>"
                f"<span style='color:{tema['danger']};font-size:15px;font-weight:bold;'>{hr['rischio']}</span></div></div>",
                unsafe_allow_html=True
            )

        st.markdown('<br>', unsafe_allow_html=True)
        pdf_bytes = crea_pdf_forense(incidente, hr)
        st.download_button(
            label='ESPORTA DOSSIER FORENSE (PDF)',
            data=pdf_bytes,
            file_name=f"Dossier_{incidente['utente']}.pdf",
            mime='application/pdf'
        )