import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors


def crea_pdf_forense(dati_incidente, dati_hr):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    w, h = A4

    c.setFillColor(colors.HexColor('#4F46E5'))
    c.roundRect(40, h - 90, w - 80, 50, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(60, h - 68, 'DOSSIER INDAGINE FORENSE')
    c.setFont('Helvetica', 10)
    c.drawString(60, h - 82, f"Rif. Evento: {dati_incidente['ora'].replace(':', '')} | Tipo: INSIDER THREAT")

    testo = colors.HexColor('#1E293B')
    c.setFillColor(colors.HexColor('#F0F4F8'))
    c.setStrokeColor(colors.HexColor('#CBD5E1'))
    c.roundRect(40, h - 230, w - 80, 110, 8, fill=1, stroke=1)
    c.setFillColor(testo)
    c.setFont('Helvetica-Bold', 12)
    c.drawString(60, h - 145, 'PROFILO DIPENDENTE (HR)')
    c.setFont('Helvetica', 11)
    c.drawString(60, h - 170, f"Account Utente: {dati_incidente['utente']}")
    c.drawString(60, h - 190, f"Reparto: {dati_hr['reparto']}")
    c.drawString(60, h - 210, f"Ruolo / Sede: {dati_hr['ruolo']} | {dati_hr['sede']}")

    c.setFillColor(colors.HexColor('#FEF2F2'))
    c.setStrokeColor(colors.HexColor('#FECACA'))
    c.roundRect(40, h - 390, w - 80, 130, 8, fill=1, stroke=1)
    c.setFillColor(colors.HexColor('#991B1B'))
    c.setFont('Helvetica-Bold', 12)
    c.drawString(60, h - 285, 'DETTAGLI VIOLAZIONE HONEYFILE')
    c.setFillColor(testo)
    c.setFont('Helvetica', 11)
    c.drawString(60, h - 310, f"File Tracciato: {dati_incidente['file']}")
    c.drawString(60, h - 330, f"Data e Ora: {dati_incidente['ora']}")
    c.drawString(60, h - 350, f"Indirizzo IP: {dati_incidente['ip']}")
    c.setFillColor(colors.HexColor('#DC2626'))
    c.setFont('Helvetica-Bold', 11)
    c.drawString(60, h - 370, f"RISCHIO: {dati_hr['rischio']}")

    c.save()
    return buffer.getvalue()


def crea_pdf_esfiltrazione(df_esfiltrazioni):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    w, h = A4

    c.setFillColor(colors.HexColor('#DC2626'))
    c.roundRect(40, h - 90, w - 80, 50, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 16)
    c.drawString(60, h - 68, 'REPORT INCIDENTE DLP - ESFILTRAZIONE')

    testo = colors.HexColor('#1E293B')
    c.setFillColor(testo)
    c.setFont('Helvetica', 12)
    y = h - 130
    for _, row in df_esfiltrazioni.iterrows():
        c.setFillColor(colors.HexColor('#FEF2F2'))
        c.setStrokeColor(colors.HexColor('#FECACA'))
        c.roundRect(40, y - 70, w - 80, 80, 6, fill=1, stroke=1)
        c.setFillColor(testo)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(60, y - 15, f"File: {row['file']}")
        c.setFont('Helvetica', 11)
        c.drawString(60, y - 35, f"IP sorgente: {row['ip']}")
        c.drawString(60, y - 55, f"Data/Ora: {row['ora']}")
        y -= 100
        if y < 80:
            c.showPage()
            y = h - 80

    c.save()
    return buffer.getvalue()


def crea_pdf_statistiche(df):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    w, h = A4

    c.setFillColor(colors.HexColor('#1E293B'))
    c.roundRect(40, h - 90, w - 80, 50, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(60, h - 68, 'REPORT MENSILE TELEMETRIA')

    c.setFillColor(colors.HexColor('#1E293B'))
    c.setFont('Helvetica', 12)
    totali = len(df)
    honey = len(df[df['status'] == 'Honey-Hit'])
    esfiltrazioni = len(df[df['status'] == 'Esfiltrazione'])
    c.drawString(60, h - 150, f'Eventi Registrati: {totali}')
    c.drawString(60, h - 180, f'Violazioni Honeyfile Rilevate: {honey}')
    c.drawString(60, h - 210, f'Esfiltrazioni DLP: {esfiltrazioni}')
    c.drawString(60, h - 240, f'Download Regolari: {totali - honey - esfiltrazioni}')

    c.save()
    return buffer.getvalue()