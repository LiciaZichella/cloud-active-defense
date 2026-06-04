"""Generazione dei PDF forensi/report del SOC Aurea Capital (reportlab).

Produce PDF reali e scaricabili con i dati passati dal backend. Layout pulito e
coerente col brand (header Aurea Capital, footer di classificazione). Non e' una
replica pixel-perfect delle anteprime del mockup, ma un documento professionale.
"""
import io
import zipfile
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)

# Palette coerente col brand
_NAVY = colors.HexColor('#1c2541')
_ACCENT = colors.HexColor('#a78bfa')
_CRITICAL = colors.HexColor('#e11d48')
_MUTED = colors.HexColor('#6b7280')
_BORDER = colors.HexColor('#d8d3c8')
_BG_ROW = colors.HexColor('#f4f1ea')

_styles = getSampleStyleSheet()
_H1 = ParagraphStyle('AcH1', parent=_styles['Title'], fontSize=18, textColor=_NAVY, spaceAfter=2)
_SUB = ParagraphStyle('AcSub', parent=_styles['Normal'], fontSize=10, textColor=_MUTED, spaceAfter=10)
_H2 = ParagraphStyle('AcH2', parent=_styles['Heading2'], fontSize=12, textColor=_NAVY, spaceBefore=12, spaceAfter=6)
_BODY = ParagraphStyle('AcBody', parent=_styles['Normal'], fontSize=10, leading=15, textColor=colors.HexColor('#1c1916'))
_LABEL = ParagraphStyle('AcLabel', parent=_styles['Normal'], fontSize=9, textColor=_MUTED)
_VALUE = ParagraphStyle('AcValue', parent=_styles['Normal'], fontSize=10, textColor=colors.HexColor('#1c1916'))


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(_BORDER)
    canvas.line(20 * mm, 15 * mm, 190 * mm, 15 * mm)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(_MUTED)
    canvas.drawString(20 * mm, 10 * mm, 'AUREA CAPITAL S.p.A. — Documento CONFIDENZIALE · uso interno SOC')
    canvas.drawRightString(190 * mm, 10 * mm, f"Pag. {doc.page} · generato {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    canvas.restoreState()


def _intestazione(titolo, sottotitolo):
    flow = [
        Paragraph('<b>AUREA CAPITAL S.p.A.</b> · Security Operations Center', _LABEL),
        Spacer(1, 4),
        Paragraph(titolo, _H1),
        Paragraph(sottotitolo, _SUB),
        HRFlowable(width='100%', thickness=1, color=_ACCENT, spaceAfter=8),
    ]
    return flow


def _tabella(coppie):
    data = [[Paragraph(str(k), _LABEL), Paragraph(str(v), _VALUE)] for k, v in coppie]
    t = Table(data, colWidths=[55 * mm, 115 * mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 0.4, _BORDER),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, _BG_ROW]),
    ]))
    return t


def _build(titolo, sottotitolo, flow_body):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm,
                            leftMargin=20 * mm, rightMargin=20 * mm, title=titolo)
    flow = _intestazione(titolo, sottotitolo) + flow_body
    doc.build(flow, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Generatori specifici
# ---------------------------------------------------------------------------
def pdf_forense(d):
    body = [
        Paragraph('Dossier forense — Honey-Hit (Scenario A)', _H2),
        _tabella([
            ('Dipendente', d.get('user', 'n/d')),
            ('Reparto / Ruolo', f"{d.get('reparto', 'n/d')} · {d.get('ruolo', 'n/d')}"),
            ('Livello di rischio', d.get('rischio', 'n/d')),
            ('File esca toccato', d.get('file', 'n/d')),
            ('Orario', d.get('time', 'n/d')),
            ('IP sorgente', d.get('ip', 'n/d')),
            ('Sede', d.get('sede', 'n/d')),
            ('Firma documento', 'VALIDA' if d.get('signatureValid', True) else 'NON VALIDA'),
        ]),
        Spacer(1, 10),
        Paragraph('Valutazione', _H2),
        Paragraph('L\'accesso a un Honeyfile costituisce di per sé un segnale di compromissione '
                  '(Zero Trust): nessun utente legittimo dovrebbe interagire con i file esca. '
                  'L\'evento richiede triage e correlazione con l\'attività recente dell\'utente.', _BODY),
    ]
    return _build('Dossier Forense', f"{d.get('user', '')} · {d.get('file', '')}", body)


def pdf_esfiltrazione(d):
    body = [
        Paragraph('Report incidente DLP — Esfiltrazione (Scenario B)', _H2),
        _tabella([
            ('Beacon ID', d.get('file', 'n/d')),
            ('Tipo minaccia', d.get('threatLabel', 'n/d')),
            ('Posizione', f"{d.get('city', 'n/d')} ({d.get('country', '')})"),
            ('IP attaccante', d.get('ip', 'n/d')),
            ('Downloader originario', d.get('user', 'n/d')),
            ('Dwell time', d.get('dwellTime', 'n/d')),
            ('Auto-Remediation', 'IAM revocato' if d.get('remediated') else 'Pendente'),
        ]),
        Spacer(1, 10),
        Paragraph('Catena dell\'incidente', _H2),
        Paragraph('Download del documento reale &rarr; attivazione del beacon all\'apertura fuori '
                  'perimetro &rarr; classificazione della minaccia (GeoIP / Tor) &rarr; risposta '
                  'automatica con revoca dei permessi IAM del downloader.', _BODY),
    ]
    return _build('Report Incidente DLP', f"{d.get('file', '')} · {d.get('city', '')}", body)


def pdf_honeytoken(d):
    leaked = d.get('status') == 'leaked'
    coppie = [
        ('Token', d.get('name', 'n/d')),
        ('Tipo', d.get('tone', 'n/d').upper()),
        ('Stato', 'COMPROMESSO' if leaked else 'ARMED (operativo)'),
        ('Creato il', d.get('created', 'n/d')),
    ]
    if leaked:
        coppie += [
            ('Compromesso da', d.get('leakedBy', 'n/d')),
            ('Orario leak', d.get('leakedAt', 'n/d')),
            ('IP sorgente', d.get('leakedIp', 'n/d')),
        ]
    body = [
        Paragraph('Dossier Honeytoken', _H2),
        _tabella(coppie),
        Spacer(1, 8),
        Paragraph('Credenziali esposte (esca)', _H2),
        Paragraph('<br/>'.join('· ' + e for e in d.get('exposes', [])) or '—', _BODY),
    ]
    if d.get('reveals'):
        body += [Spacer(1, 8), Paragraph('Cosa rivela', _H2), Paragraph(d['reveals'], _BODY)]
    if d.get('recommendation'):
        body += [Spacer(1, 8), Paragraph('Raccomandazione SOC', _H2), Paragraph(d['recommendation'], _BODY)]
    return _build('Dossier Leak Credenziali', d.get('name', ''), body)


def pdf_behavioral(d):
    rules = d.get('rules', [])
    body = [
        Paragraph('Report Behavioral Analytics', _H2),
        _tabella([(r['name'], f"{r['count']} alert · {'attiva' if r['fired'] else 'nessun alert'}") for r in rules]
                 or [('—', '—')]),
        Spacer(1, 10),
        Paragraph('Top dipendenti anomali', _H2),
        _tabella([(u['user'], f"{u['reparto']} · {u['rule']} · score {u['score']}") for u in d.get('ranking', [])]
                 or [('Nessuna anomalia', '—')]),
    ]
    return _build('Report Behavioral Analytics', 'Analisi comportamentale su CloudTrail', body)


def pdf_nis2(report, overview):
    body = [
        Paragraph('Rapporto di conformità NIS2 / GDPR', _H2),
        Paragraph('Documento istituzionale di sintesi per gli obblighi di notifica e tracciabilità '
                  '(NIS2 art. 21, GDPR art. 33-34).', _BODY),
        Spacer(1, 8),
        _tabella([
            ('Vitals Score', f"{overview.get('vitalsScore', 'n/d')}/100"),
            ('Allarmi attivi', overview.get('allarmiAttivi', 'n/d')),
            ('Compliance score', f"{report.get('complianceScore', 'n/d')}%"),
            ('Eventi critici', report.get('eventiPerTipo', {}).get('critical', 0)),
            ('Esfiltrazioni (Tor/VPN)', report.get('eventiPerTipo', {}).get('tor', 0)),
            ('Honeytoken compromessi', report.get('eventiPerTipo', {}).get('honeytoken', 0)),
        ]),
        Spacer(1, 10),
        Paragraph('Reparti più esposti', _H2),
        _tabella([(r['reparto'], str(r['count'])) for r in report.get('repartiEsposti', [])] or [('—', '—')]),
    ]
    return _build('Rapporto Conformità NIS2', f"Aurea Capital S.p.A. · {datetime.now().strftime('%B %Y')}", body)


def bundle_zip(dashboard):
    """ZIP con tutti i PDF principali + i dati grezzi JSON."""
    import json
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        ov = dashboard.get('overview', {})
        rep = dashboard.get('report', {})
        z.writestr('00_rapporto_nis2.pdf', pdf_nis2(rep, ov))
        z.writestr('01_behavioral.pdf', pdf_behavioral(dashboard.get('behavioral', {})))
        for i, h in enumerate(dashboard.get('honeyfile', {}).get('alerts', [])):
            z.writestr(f'honeyfile/dossier_{i + 1}_{h.get("user", "n")}.pdf', pdf_forense(h))
        for i, e in enumerate(dashboard.get('esfiltrazione', {}).get('events', [])):
            z.writestr(f'esfiltrazione/incidente_{i + 1}.pdf', pdf_esfiltrazione(e))
        for t in dashboard.get('honeytoken', {}).get('tokens', []):
            z.writestr(f'honeytoken/{t.get("name", "token")}.pdf', pdf_honeytoken(t))
        z.writestr('dati_grezzi.json', json.dumps(dashboard, ensure_ascii=False, indent=2))
    return buf.getvalue()
