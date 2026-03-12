import boto3
import json
from datetime import datetime
import uuid

# Connettiamo il nostro script a LocalStack
endpoint = "http://localhost:4566"
s3 = boto3.client('s3', endpoint_url=endpoint, region_name='us-east-1')

def registra_download(utente, ip_aziendale, nome_file):
    print(f"\n Il dipendente '{utente}' sta scaricando il file '{nome_file}'...")
    
    # 1. Creiamo il log di Auditing esattamente come farebbe AWS CloudTrail
    log_evento = {
        "eventVersion": "1.0",
        "userIdentity": {"userName": utente},
        "eventTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "eventName": "DownloadDocumento", 
        "sourceIPAddress": ip_aziendale,
        "requestParameters": {"documento": nome_file}
    }
    
    # 2. Diamo un nome univoco al file di log
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    id_univoco = uuid.uuid4().hex[:6]
    nome_log = f"cloudtrail_logs/log_{timestamp}_{id_univoco}.json"
    
    # 3. Salviamo il log nel nostro "Cassetto Sicuro" (Bucket S3) creato prima
    try:
        s3.put_object(
            Bucket='portale-sicurezza-logs',
            Key=nome_log,
            Body=json.dumps(log_evento),
            ContentType='application/json'
        )
        print("[CLOUDTRAIL SIMULATO] Azione registrata con successo nel bucket S3!")
        print(f"Catena di Custodia: '{utente}' ha scaricato '{nome_file}' dall'IP {ip_aziendale}")
    except Exception as e:
        print(f"Errore nel salvataggio del log: {e}")

# AREA DI TEST 
if __name__ == "__main__":
    print("SIMULAZIONE TRAFFICO SUL PORTALE INTRANET")
    
    # Simuliamo il dipendente Mario Rossi che fa il suo lavoro e scarica il file reale
    registra_download(
        utente="mario.rossi",
        ip_aziendale="192.168.1.50", # IP interno autorizzato
        nome_file="Bilancio_Riservato_2026.pdf"
    )
    
    # Simuliamo un altro dipendente, Luigi Verdi, che è curioso e scarica l'esca
    registra_download(
        utente="luigi.verdi",
        ip_aziendale="10.0.0.15", # IP interno autorizzato
        nome_file="Stipendi_Dirigenza_HONEYFILE.pdf"
    )
    
    print("\n Tutti i log di download sono stati archiviati in modo immutabile su S3.")