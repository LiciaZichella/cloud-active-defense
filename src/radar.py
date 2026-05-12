import json
import base64
import boto3
import os
import time
import urllib.request
from datetime import datetime

# Configurazione da variabili d'ambiente iniettate da start_radar.py
LOCALSTACK_ENDPOINT = os.environ.get('LOCALSTACK_ENDPOINT', 'http://host.docker.internal:4566')
BUCKET_AUDIT_LOGS = os.environ.get('BUCKET_AUDIT_LOGS', 'portale-sicurezza-logs')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', 'arn:aws:sns:us-east-1:000000000000:Allarme-Intrusione-Radar')
APP_REGION = os.environ.get('APP_REGION', 'us-east-1')
RETE_INTERNA_AZIENDALE = os.environ.get('INTERNAL_IPS', '192.168.1.50,10.0.0.15,172.16.0.5,127.0.0.1').split(',')
WEBHOOK_URL = os.environ.get('WEBHOOK_URL', '')


def invia_webhook(file_id, ip_rilevato, scenario):
    if not WEBHOOK_URL:
        return
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if 'discord' in WEBHOOK_URL:
        payload = {
            "embeds": [{
                "title": f"ALLARME CRITICO: {scenario}",
                "color": 16711680,
                "fields": [
                    {"name": "File", "value": file_id, "inline": True},
                    {"name": "IP sorgente", "value": ip_rilevato, "inline": True},
                    {"name": "Timestamp", "value": timestamp, "inline": False}
                ],
                "footer": {"text": "Cloud Active Defense — Modulo Radar"}
            }]
        }
    else:
        payload = {
            "text": f"*ALLARME CRITICO: {scenario}*\nFile: `{file_id}`\nIP: `{ip_rilevato}`\nTimestamp: {timestamp}"
        }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        WEBHOOK_URL, data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"[WEBHOOK] Notifica inviata (HTTP {resp.status})")
    except Exception as e:
        print(f"[ERRORE WEBHOOK] {e}")


def invia_allarme_sns(file_id, ip_rilevato, scenario):
    try:
        sns_client = boto3.client('sns', endpoint_url=LOCALSTACK_ENDPOINT, region_name=APP_REGION)
        messaggio = f"""
        ATTENZIONE! RILEVATA POSSIBILE VIOLAZIONE DEI DATI

        Dettagli Evento:
        - Data e Ora: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - File Coinvolto: {file_id}
        - Indirizzo IP: {ip_rilevato}
        - Tipo di Allarme: {scenario}

        (Messaggio generato automaticamente dal Modulo Auditing & Detection).
        """
        sns_client.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject=f"ALLARME CRITICO - {scenario}",
            Message=messaggio
        )
        print(f"[AUDIT] Notifica SNS inviata all'Amministratore per {file_id}!")
    except Exception as e:
        print(f"[ERRORE SNS] Impossibile inviare la notifica: {e}")


def registra_esfiltrazione_s3(file_id, ip_rilevato, timestamp, lat=0.0, lon=0.0):
    try:
        s3_client = boto3.client('s3', endpoint_url=LOCALSTACK_ENDPOINT, region_name=APP_REGION)
        log_data = {
            "eventVersion": "1.08",
            "userIdentity": {"userName": "Sconosciuto (Esterno)"},
            "eventTime": timestamp,
            "eventName": "Exfiltration",
            "sourceIPAddress": ip_rilevato,
            "requestParameters": {
                "bucketName": BUCKET_AUDIT_LOGS,
                "documento": file_id
            },
            "geo": {"lat": lat, "lon": lon}
        }
        nome_log = f"esfiltrazione_{int(time.time())}.json"
        s3_client.put_object(
            Bucket=BUCKET_AUDIT_LOGS,
            Key=nome_log,
            Body=json.dumps(log_data),
            ContentType="application/json"
        )
        print(f"[S3] Log di Esfiltrazione salvato per la Dashboard: {nome_log}")
    except Exception as e:
        print(f"[ERRORE S3] Impossibile salvare il log di esfiltrazione: {e}")


def lambda_handler(event, context):
    """
    AWS Lambda — intercetta il Web Beacon quando un PDF reale viene aperto.
    Scenario A: IP interno  -> accesso legittimo, nessun allarme.
    Scenario B: IP esterno  -> esfiltrazione, salva log su S3.
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    attacker_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
    query_params = event.get('queryStringParameters') or {}
    file_id = query_params.get('file_id', 'SCONOSCIUTO')

    print(f"\n--- RADAR ATTIVATO ALLE {timestamp} ---")
    print(f"File analizzato: {file_id}")
    print(f"IP Rilevato: {attacker_ip}")

    geo_lat = event.get('geoLat', 0.0)
    geo_lon = event.get('geoLon', 0.0)

    if attacker_ip in RETE_INTERNA_AZIENDALE:
        print("SCENARIO A: File reale aperto dall'ufficio. Tutto regolare.")
    else:
        print("SCENARIO B: ESFILTRAZIONE! FILE REALE APERTO FUORI DALL'AZIENDA!")
        registra_esfiltrazione_s3(file_id, attacker_ip, timestamp, geo_lat, geo_lon)
        invia_webhook(file_id, attacker_ip, "DLP ALERT: File Reale aperto fuori perimetro aziendale")
        # invia_allarme_sns(file_id, attacker_ip, "DLP ALERT: File Reale fuori perimetro")
        print(f"-> L'IP {attacker_ip} non appartiene alla rete aziendale.")

    # Pagina di errore inline — Fix C2: rimosso path fisso Windows
    html_errore = """
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Errore di Sistema - Accesso Negato</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; color: #333; text-align: center; padding-top: 100px; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #d9534f; }
            .error-icon { font-size: 80px; color: #d9534f; margin-bottom: 20px; }
            h1 { font-size: 24px; color: #d9534f; margin-top: 0; }
            p { font-size: 16px; color: #666; line-height: 1.6; }
            .footer { margin-top: 30px; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">&#128721;</div>
            <h1>Errore 403: Accesso Negato</h1>
            <p>Il documento che si sta tentando di consultare è protetto da policy di sicurezza avanzate.<br>
               La sessione corrente non dispone delle autorizzazioni necessarie per visualizzare i contenuti.</p>
            <p>Se ritieni che si tratti di un errore, contatta l'IT Support aziendale.</p>
            <div class="footer">ISTITUTO DI CREDITO NAZIONALE - Portale Sicurezza v.4.2</div>
        </div>
    </body>
    </html>
    """

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
        },
        "body": html_errore,
        "isBase64Encoded": False
    }
