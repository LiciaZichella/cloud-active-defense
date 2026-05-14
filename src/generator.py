import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import boto3
import uuid
import os
import json
import random
import camouflage
import multi_format
import honeytoken
import pdf_signer
from faker import Faker
from config import CONFIG
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from pypdf import PdfReader, PdfWriter
from datetime import datetime

print("Inizio la creazione dei documenti di sicurezza...")

RADAR_URL = CONFIG['radar']['url'] + "/radar"
NOME_BUCKET = CONFIG['buckets']['documents']
BUCKET_LOGS = CONFIG['buckets']['audit_logs']

NOMI_HONEYTOKEN = {
    'aws':    'aws_credentials.txt',
    'env':    '.env.production',
    'config': 'devops_secrets.yaml',
    'ssh':    'id_rsa_backup',
}

s3 = boto3.client(
    's3',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region']
)

_HR_DATA_PATH = Path(__file__).parent.parent / 'data' / 'hr_data.json'

try:
    s3.create_bucket(Bucket=NOME_BUCKET)
    print(f"[*] Caveau S3 '{NOME_BUCKET}' creato e pronto!")
except Exception as e:
    pass


def crea_e_carica_documento(nome_file, titolo, contenuto, prefisso_id, autore=None, categoria=None):
    beacon_id = f"{prefisso_id}_{uuid.uuid4().hex[:8]}"
    url_trappola = f"{RADAR_URL}?file_id={beacon_id}"

    print(f"\nGenerazione: {nome_file}")

    percorso_completo = os.path.join(os.path.dirname(__file__), nome_file)
    c = canvas.Canvas(percorso_completo, pagesize=A4)
    larghezza, altezza = A4

    c.setTitle(f"{titolo} - TrackingID:{beacon_id}")
    c.setAuthor(autore if autore else "Amministrazione")
    c.setSubject(url_trappola)

    c.saveState()
    c.translate(larghezza / 2, altezza / 2)
    c.rotate(45)
    c.setFont("Helvetica-Bold", 60)
    c.setFillColorRGB(0.85, 0.85, 0.85)
    c.drawCentredString(0, 0, "RISERVATO - NON DIVULGARE")
    c.restoreState()

    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(colors.darkblue)
    c.drawString(70, altezza - 100, titolo)

    c.setFont("Helvetica", 12)
    c.setFillColor(colors.black)

    y_text = altezza - 150
    for riga in contenuto.split('\n'):
        c.drawString(70, y_text, riga)
        y_text -= 15

    c.setFont("Courier", 9)
    c.setFillColor(colors.gray)
    c.drawString(70, 50, f"Classificazione: STRICTLY CONFIDENTIAL | Tracking ID: {beacon_id}")

    # Web Beacon iniettato SOLO nei file reali — l'Honeyfile scatta allarme al download
    if "REAL" in prefisso_id:
        c.linkURL(url_trappola, (0, 0, larghezza, altezza), relative=1)
        print("[*] Inserito Canary Token (Web Beacon). Allarme attivo per apertura fuori sede.")
    else:
        print("[*] Honeyfile generato. Nessun Web Beacon interno (Allarme configurato sul Download).")

    c.save()
    print(f"PDF creato fisicamente: {nome_file}")

    # Doppia tecnica beacon per PDF REAL:
    # 1) linkURL (reportlab): trigger al click in qualsiasi reader
    # 2) OpenAction JavaScript (pypdf): auto-trigger in Adobe/Foxit Reader
    # Edge e browser viewer bloccano entrambe — limite documentato in tesi.
    if "REAL" in prefisso_id and os.path.exists(percorso_completo):
        reader = PdfReader(percorso_completo)
        writer = PdfWriter(clone_from=reader)
        js_code = f"app.launchURL('{url_trappola}', true);"
        writer.add_js(js_code)
        with open(percorso_completo, 'wb') as f:
            writer.write(f)
        print("[*] OpenAction JavaScript beacon aggiunto (Adobe/Foxit).")

    try:
        s3.upload_file(percorso_completo, NOME_BUCKET, nome_file)
        print(f"SI - Documento caricato con successo nel caveau S3: {NOME_BUCKET}")
    except Exception as e:
        print(f"NO - Errore durante il caricamento su S3: {e}")
    try:
        mapping = {
            "beacon_id": beacon_id,
            "file_name": nome_file,
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "tipo": prefisso_id
        }
        s3.put_object(
            Bucket=BUCKET_LOGS,
            Key=f"beacon_mapping/{beacon_id}.json",
            Body=json.dumps(mapping),
            ContentType="application/json"
        )
        print(f"[*] Beacon mapping salvato: {beacon_id} -> {nome_file}")
    except Exception as e:
        print(f"NO - Errore salvataggio beacon mapping: {e}")

    # Firma digitale — si applica sia agli honey che ai file reali (camouflage)
    _key_path = Path(__file__).parent.parent / 'data' / 'keys' / 'acme_private.pem'
    _cert_path = Path(__file__).parent.parent / 'data' / 'keys' / 'acme_cert.pem'
    if _key_path.exists() and _cert_path.exists():
        esito = pdf_signer.firma_pdf(percorso_completo, str(_cert_path), str(_key_path))
        if esito['success']:
            try:
                s3.upload_file(percorso_completo, NOME_BUCKET, nome_file)
                print(f"[*] PDF firmato e re-uploadato: {nome_file}")
            except Exception as e:
                print(f"NO - Errore re-upload PDF firmato: {e}")
        else:
            print(f"[WARN] Firma fallita: {esito['reason']}")
    else:
        print("[WARN] Chiavi non trovate. Esegui genera_chiavi.py prima per attivare la firma")


def crea_e_carica_honeytoken(tipo):
    beacon_id = f"TOKEN_{uuid.uuid4().hex[:8]}"
    nome_file = NOMI_HONEYTOKEN[tipo]
    generatori = {
        'aws':    honeytoken.genera_aws_credentials,
        'env':    honeytoken.genera_env_file,
        'config': honeytoken.genera_config_devops,
        'ssh':    honeytoken.genera_ssh_key,
    }
    contenuto = generatori[tipo](beacon_id)
    percorso = os.path.join(os.path.dirname(__file__), nome_file)
    with open(percorso, 'w', encoding='utf-8') as f:
        f.write(contenuto)
    print(f"[*] Honeytoken {tipo.upper()} generato: {nome_file}")
    try:
        s3.upload_file(percorso, NOME_BUCKET, nome_file)
        print(f"SI - Honeytoken caricato: {nome_file}")
    except Exception as e:
        print(f"NO - Errore upload honeytoken: {e}")


def genera_lotto(n_honey, n_real, n_tokens=2):
    fake = Faker('it_IT')

    with open(_HR_DATA_PATH) as f:
        hr_data = json.load(f)

    nomi_usati = set()

    for prefisso, n in [('HONEY', n_honey), ('REAL', n_real)]:
        for _ in range(n):
            cat = random.choice(camouflage.CATEGORIE)
            fmt = camouflage.FORMATO_PER_CATEGORIA[cat]
            nome = camouflage.genera_nome_documento(cat)
            while nome in nomi_usati:
                nome = camouflage.genera_nome_documento(cat)
            nomi_usati.add(nome)
            contenuto = camouflage.genera_contenuto_documento(cat, fake)
            autore = camouflage.seleziona_autore(hr_data)
            titolo = nome.rsplit('.', 1)[0].replace('_', ' ')
            beacon_url = f"{RADAR_URL}?file_id={prefisso}_{uuid.uuid4().hex[:8]}"
            if fmt == 'pdf':
                crea_e_carica_documento(nome, titolo, contenuto, prefisso,
                                        autore=autore, categoria=cat)
            elif fmt == 'docx':
                multi_format.crea_documento_docx(nome, titolo, contenuto,
                                                 beacon_url, prefisso, autore)
            elif fmt == 'xlsx':
                multi_format.crea_documento_xlsx(nome, titolo, contenuto,
                                                 beacon_url, prefisso, autore)

    tipi_disponibili = list(NOMI_HONEYTOKEN.keys())
    tipi_scelti = random.sample(tipi_disponibili, min(n_tokens, len(tipi_disponibili)))
    for tipo in tipi_scelti:
        crea_e_carica_honeytoken(tipo)


if __name__ == "__main__":
    genera_lotto(n_honey=3, n_real=2, n_tokens=2)

    print("\nOperazione completata.")
