import boto3
import uuid
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors

print("Inizio la creazione dei documenti di sicurezza...")

# Indirizzo Radar
RADAR_URL = "http://localhost:8080/radar"
NOME_BUCKET = "company-secure-documents"

# Connessione al Cloud S3 
s3 = boto3.client(
    's3', 
    endpoint_url='http://localhost:4566', 
    aws_access_key_id='test', 
    aws_secret_access_key='test', 
    region_name='us-east-1'
)

# Creiamo il bucket sul Cloud 
try:
    s3.create_bucket(Bucket=NOME_BUCKET)
    print(f"[*] Caveau S3 '{NOME_BUCKET}' creato e pronto!")
except Exception as e:
    pass

def crea_e_carica_documento(nome_file, titolo, contenuto, prefisso_id):
    beacon_id = f"{prefisso_id}_{uuid.uuid4().hex[:8]}"
    url_trappola = f"{RADAR_URL}?file_id={beacon_id}"
    
    print(f"\nGenerazione: {nome_file}")
    
    # 1. CREAZIONE FISICA DEL PDF
    percorso_completo = os.path.join(os.getcwd(), "src", nome_file)
    c = canvas.Canvas(percorso_completo, pagesize=A4)
    larghezza, altezza = A4

    # Inserimento nei metadati
    c.setTitle(f"{titolo} - TrackingID:{beacon_id}")
    c.setAuthor("Amministrazione")
    c.setSubject(url_trappola)

    # Filigrana visiva diagonale
    c.saveState()
    c.translate(larghezza / 2, altezza / 2)
    c.rotate(45)
    c.setFont("Helvetica-Bold", 60)
    c.setFillColorRGB(0.85, 0.85, 0.85)
    c.drawCentredString(0, 0, "RISERVATO - NON DIVULGARE")
    c.restoreState()

    # Testo del documento
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

    # --- LOGICA DEL CANARY TOKEN ---
    # Inseriamo il Web Beacon (il link su tutto il foglio) SOLO se è un file REALE.
    # L'Honeyfile non ne ha bisogno: il suo allarme scatta istantaneamente al momento del download!
    if "REAL" in prefisso_id:
        c.linkURL(url_trappola, (0, 0, larghezza, altezza), relative=1)
        print("[*] Inserito Canary Token (Web Beacon). Allarme attivo per apertura fuori sede.")
    else:
        print("[*] Honeyfile generato. Nessun Web Beacon interno (Allarme configurato sul Download).")
    # ---------------------------------

    c.save()
    print(f"PDF creato fisicamente: {nome_file}")

    # 2. CARICAMENTO NEL CLOUD
    try:
        s3.upload_file(percorso_completo, NOME_BUCKET, nome_file)
        print(f"SI - Documento caricato con successo nel caveau S3: {NOME_BUCKET}")
    except Exception as e:
        print(f"NO - Errore durante il caricamento su S3: {e}")

if __name__ == "__main__":
    # SCENARIO 1: L'Esca (Honeyfile) - Senza Token
    crea_e_carica_documento(
        nome_file="Bilancio_Riservato_2026.pdf",
        titolo="DOCUMENTO RISERVATO - BILANCIO 2026",
        contenuto="ATTENZIONE: Questo documento contiene dati finanziari strettamente confidenziali.\nLa divulgazione non autorizzata è severamente punita dalle policy aziendali.\n\nFatturato Q1: 4.5M Euro\nAcquisizioni previste: Progetto Alpha.",
        prefisso_id="HONEY"
    )
    
    # SCENARIO 2: Il File Reale (DLP) - Con Token
    crea_e_carica_documento(
        nome_file="Progetto_Infrastruttura_Rete.pdf",
        titolo="PROGETTO TECNICO INFRASTRUTTURA IT",
        contenuto="Dettagli di configurazione dei server interni.\nConsultabile SOLO in sede aziendale.",
        prefisso_id="REAL"
    )
    
    print("\nOperazione completata.")