import boto3
from fpdf import FPDF
import uuid # <-- NUOVA LIBRERIA: Serve a generare il codice univoco della trappola!

print("Inizio la creazione dell'Honeyfile...")

# ==========================================
# FASE A: GENERAZIONE DELLA TRAPPOLA (BEACON)
# ==========================================
# Creiamo il "numero di telaio" univoco di questa esca
beacon_id = str(uuid.uuid4())
url_trappola = f"https://api.finta-azienda.com/allarme?id={beacon_id}"

print(f"⚠️ Generato Web Beacon Univoco: {beacon_id}")
print(f"🔗 URL Trappola nascosto nel file: {url_trappola}")

# ==========================================
# FASE B: CREAZIONE DEL DOCUMENTO PDF
# ==========================================
pdf = FPDF()
pdf.add_page()

# NASCONDIAMO LA TRAPPOLA NEI METADATI (Invisibile all'occhio umano)
pdf.set_title(f"Bilancio_Riservato - TrackingID:{beacon_id}")
pdf.set_author("Amministrazione")
pdf.set_subject(url_trappola)

# Testo visibile
pdf.set_font("helvetica", "B", 16)
pdf.cell(40, 10, "DOCUMENTO RISERVATO - BILANCIO 2026")
pdf.ln(20)
pdf.set_font("helvetica", "", 12)
pdf.multi_cell(0, 10, "ATTENZIONE: Questo documento contiene dati finanziari strettamente confidenziali. La divulgazione non autorizzata è severamente punita dalle policy aziendali.\n\nFatturato Q1: 4.5M Euro\nAcquisizioni previste: Progetto Alpha.")

nome_file = "bilancio_riservato_2026.pdf"
pdf.output(nome_file)
print(f"SI - 1. PDF 'Avvelenato' creato fisicamente sul tuo PC: {nome_file}")

# ==========================================
# FASE C: CARICAMENTO NEL CAVEAU CLOUD (S3)
# ==========================================
s3 = boto3.client(
    's3', 
    endpoint_url='http://localhost:4566', 
    aws_access_key_id='test', 
    aws_secret_access_key='test', 
    region_name='us-east-1'
)

nome_bucket = "company-secure-documents"

try:
    s3.upload_file(nome_file, nome_bucket, nome_file)
    print(f"SI - 2. Honeyfile caricato con successo nel caveau S3: {nome_bucket}")
except Exception as e:
    print(f"NO - Errore durante il caricamento: {e}")