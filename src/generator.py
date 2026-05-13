import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import boto3
import uuid
import os
import json
import random
import camouflage
from faker import Faker
from config import CONFIG
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

print("Inizio la creazione dei documenti di sicurezza...")

RADAR_URL = CONFIG['radar']['url'] + "/radar"
NOME_BUCKET = CONFIG['buckets']['documents']

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

    try:
        s3.upload_file(percorso_completo, NOME_BUCKET, nome_file)
        print(f"SI - Documento caricato con successo nel caveau S3: {NOME_BUCKET}")
    except Exception as e:
        print(f"NO - Errore durante il caricamento su S3: {e}")


def genera_lotto(n_honey, n_real):
    fake = Faker('it_IT')

    with open(_HR_DATA_PATH) as f:
        hr_data = json.load(f)

    nomi_usati = set()

    for _ in range(n_honey):
        cat = random.choice(camouflage.CATEGORIE)
        nome = camouflage.genera_nome_documento(cat)
        while nome in nomi_usati:
            nome = camouflage.genera_nome_documento(cat)
        nomi_usati.add(nome)
        contenuto = camouflage.genera_contenuto_documento(cat, fake)
        autore = camouflage.seleziona_autore(hr_data)
        crea_e_carica_documento(nome, nome.replace('.pdf', '').replace('_', ' '),
                                contenuto, 'HONEY', autore=autore, categoria=cat)

    for _ in range(n_real):
        cat = random.choice(camouflage.CATEGORIE)
        nome = camouflage.genera_nome_documento(cat)
        while nome in nomi_usati:
            nome = camouflage.genera_nome_documento(cat)
        nomi_usati.add(nome)
        contenuto = camouflage.genera_contenuto_documento(cat, fake)
        autore = camouflage.seleziona_autore(hr_data)
        crea_e_carica_documento(nome, nome.replace('.pdf', '').replace('_', ' '),
                                contenuto, 'REAL', autore=autore, categoria=cat)


if __name__ == "__main__":
    genera_lotto(n_honey=3, n_real=2)

    print("\nOperazione completata.")
