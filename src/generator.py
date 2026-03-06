import boto3
from fpdf import FPDF
import os

print("Inizio la creazione dell'Honeyfile...")

# 1. Creiamo il documento PDF finto (L'Esca)
pdf = FPDF()
pdf.add_page()
pdf.set_font("helvetica", "B", 16)
pdf.cell(40, 10, "DOCUMENTO RISERVATO - BILANCIO 2026")
pdf.ln(20) # Va a capo
pdf.set_font("helvetica", "", 12)
pdf.multi_cell(0, 10, "ATTENZIONE: Questo documento contiene dati finanziari strettamente confidenziali. La divulgazione non autorizzata è severamente punita dalle policy aziendali.\n\nFatturato Q1: 4.5M Euro\nAcquisizioni previste: Progetto Alpha.")

nome_file = "bilancio_riservato_2026.pdf"
pdf.output(nome_file)
print(f"1. PDF creato fisicamente sul tuo PC: {nome_file}")

# 2. Lo carichiamo nel nostro finto Cloud (S3 su LocalStack)
# Usiamo credenziali finte ('test') perché siamo nell'ambiente simulato locale
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
    print(f"2. Honeyfile caricato con successo nel caveau S3: {nome_bucket}")
except Exception as e:
    print(f"Errore durante il caricamento: {e}")