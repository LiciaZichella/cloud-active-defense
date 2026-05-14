import boto3
import json
import os
import sys
from datetime import datetime, timedelta
import uuid
from config import CONFIG
import geoip2.database

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))
import camouflage


def _geo_lookup(ip):
    db_path = CONFIG['geoip']['database_path']
    try:
        with geoip2.database.Reader(db_path) as reader:
            r = reader.city(ip)
            return r.location.latitude or 0.0, r.location.longitude or 0.0
    except FileNotFoundError:
        print(f"[GeoIP] Database non trovato in '{db_path}'. Scaricalo da MaxMind (vedi README).")
        return 0.0, 0.0
    except Exception:
        return 0.0, 0.0

s3 = boto3.client(
    's3',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region']
)

BUCKET_LOGS = CONFIG['buckets']['audit_logs']


def registra_download(utente, ip_aziendale, nome_file, ts=None):
    print(f"\nIl dipendente '{utente}' sta scaricando il file '{nome_file}'...")
    log_evento = {
        "eventVersion": "1.0",
        "userIdentity": {"userName": utente},
        "eventTime": (ts or datetime.now()).strftime("%Y-%m-%d %H:%M:%S"),
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


def registra_esfiltrazione_esterna(ip_esterno, nome_file, lat, lon, ts=None):
    print(f"\n ALLARME: Simulazione esfiltrazione del file '{nome_file}' dall'IP {ip_esterno}...")
    log_evento = {
        "eventVersion": "1.08",
        "userIdentity": {"userName": "Sconosciuto (Esterno)"},
        "eventTime": (ts or datetime.now()).strftime("%Y-%m-%d %H:%M:%S"),
        "eventName": "Exfiltration",
        "sourceIPAddress": ip_esterno,
        "requestParameters": {"bucketName": BUCKET_LOGS, "documento": nome_file},
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

    nome_honey_1 = camouflage.genera_nome_documento('bilancio')
    nome_honey_2 = camouflage.genera_nome_documento('risorse_umane')
    nome_real    = camouflage.genera_nome_documento('progetto')

    registra_download(utente="mario.rossi", ip_aziendale="192.168.1.50", nome_file=nome_honey_1)
    registra_download(utente="luigi.verdi", ip_aziendale="10.0.0.15",    nome_file=nome_honey_2)

    # Simulazione: un dipendente curioso accede a un honeytoken
    registra_download(utente="anna.bianchi", ip_aziendale="172.16.0.5",
                      nome_file="aws_credentials.txt")

    # Simulazione behavioral: mario.rossi fa 12 download in 3 minuti (burst)
    burst_base = datetime(2026, 1, 15, 14, 0, 0)
    for i in range(12):
        ts_burst = burst_base + timedelta(seconds=i * 15)
        registra_download(utente="mario.rossi", ip_aziendale="192.168.1.50",
                          nome_file=f"report_Q{(i % 4) + 1}_2025.pdf", ts=ts_burst)

    # Simulazione behavioral: luigi.verdi scarica alle 22:30 (off-hours)
    ts_offhours = datetime(2026, 1, 15, 22, 30, 0)
    registra_download(utente="luigi.verdi", ip_aziendale="10.0.0.15",
                      nome_file="bilancio_annuale_2025.pdf", ts=ts_offhours)

    ip_ext = "203.0.113.88"
    lat, lon = _geo_lookup(ip_ext)
    registra_esfiltrazione_esterna(ip_esterno=ip_ext, nome_file=nome_real, lat=lat, lon=lon)

    # Storia demo Dwell Time: mario.rossi scarica un file reale e viene esfiltrato 75 min dopo
    ts_dl_demo = datetime(2026, 1, 15, 9, 30, 0)
    registra_download(utente="mario.rossi", ip_aziendale="192.168.1.50",
                      nome_file="Progetto_Demo_Adobe_REAL.pdf", ts=ts_dl_demo)
    ts_esf_demo = datetime(2026, 1, 15, 10, 45, 0)
    registra_esfiltrazione_esterna(ip_esterno="203.0.113.88",
                                   nome_file="Progetto_Demo_Adobe_REAL.pdf",
                                   lat=40.7128, lon=-74.0060,
                                   ts=ts_esf_demo)

    print("\n Tutti i log sono stati archiviati in modo immutabile su S3. Apri la Dashboard!")
