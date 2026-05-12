import boto3
import json
from datetime import datetime
import uuid
from config import CONFIG

s3 = boto3.client(
    's3',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region']
)

BUCKET_LOGS = CONFIG['buckets']['audit_logs']


def registra_download(utente, ip_aziendale, nome_file):
    print(f"\nIl dipendente '{utente}' sta scaricando il file '{nome_file}'...")
    log_evento = {
        "eventVersion": "1.0",
        "userIdentity": {"userName": utente},
        "eventTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "eventName": "DownloadDocumento",
        "sourceIPAddress": ip_aziendale,
        "requestParameters": {"documento": nome_file}
    }
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    id_univoco = uuid.uuid4().hex[:6]
    nome_log = f"cloudtrail_logs/log_{timestamp}_{id_univoco}.json"
    try:
        s3.put_object(Bucket=BUCKET_LOGS, Key=nome_log, Body=json.dumps(log_evento), ContentType='application/json')
        print(f" [CLOUDTRAIL SIMULATO] Azione registrata con successo!")
    except Exception as e:
        print(f" Errore nel salvataggio: {e}")


def registra_esfiltrazione_esterna(ip_esterno, nome_file, lat, lon):
    print(f"\n ALLARME: Simulazione esfiltrazione del file '{nome_file}' dall'IP {ip_esterno}...")
    log_evento = {
        "eventVersion": "1.08",
        "userIdentity": {"userName": "Sconosciuto (Esterno)"},
        "eventTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "eventName": "Exfiltration",
        "sourceIPAddress": ip_esterno,
        "requestParameters": {"bucketName": BUCKET_LOGS, "documento": nome_file},
        # TODO Step 1.3: sostituire con lookup GeoIP reale (MaxMind GeoLite2)
        "geo": {"lat": lat, "lon": lon}
    }
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    id_univoco = uuid.uuid4().hex[:6]
    nome_log = f"esfiltrazione_{timestamp}_{id_univoco}.json"
    try:
        s3.put_object(Bucket=BUCKET_LOGS, Key=nome_log, Body=json.dumps(log_evento), ContentType='application/json')
        print(f" [ESFILTRAZIONE SIMULATA] Log salvato su S3 per la Mappa Geografica!")
    except Exception as e:
        print(f" Errore nel salvataggio: {e}")


if __name__ == "__main__":
    print("--- AVVIO SIMULAZIONE GLOBALE (Traffico Interno + Attacco Esterno) ---")

    registra_download(utente="mario.rossi", ip_aziendale="192.168.1.50", nome_file="Bilancio_Riservato_2026.pdf")
    registra_download(utente="luigi.verdi", ip_aziendale="10.0.0.15", nome_file="Stipendi_Dirigenza_HONEYFILE.pdf")

    # TODO Step 1.3: coordinate calcolate da GeoIP reale
    registra_esfiltrazione_esterna(ip_esterno="203.0.113.88", nome_file="Progetto_Infrastruttura_Rete.pdf", lat=55.7558, lon=37.6173)

    print("\n Tutti i log sono stati archiviati in modo immutabile su S3. Apri la Dashboard!")
