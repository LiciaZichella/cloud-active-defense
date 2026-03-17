import json
import base64
import boto3
import os
import time  
from datetime import datetime

def invia_allarme_sns(file_id, ip_rilevato, scenario):
    try:
        # L'indirizzo del nostro Cloud locale dall'interno del container Lambda
        endpoint = "http://host.docker.internal:4566"
        sns_client = boto3.client('sns', endpoint_url=endpoint, region_name='us-east-1')
        
        # L'ID del megafono
        topic_arn = "arn:aws:sns:us-east-1:000000000000:Allarme-Intrusione-Radar"
        
        # testo della mail
        messaggio = f"""
        🚨 ATTENZIONE! RILEVATA POSSIBILE VIOLAZIONE DEI DATI 🚨
        
        Dettagli Evento:
        - Data e Ora: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
        - File Coinvolto: {file_id}
        - Indirizzo IP: {ip_rilevato}
        - Tipo di Allarme: {scenario}
        
        (Questo è un messaggio generato automaticamente dal Modulo Auditing & Detection).
        """
        
        # inviamo la notifica
        sns_client.publish(
            TopicArn=topic_arn,
            Subject=f"ALLARME CRITICO - {scenario}",
            Message=messaggio
        )
        print(f"📣 [AUDIT] Notifica SNS inviata con successo all'Amministratore per {file_id}!")
    except Exception as e:
        print(f"⚠️ [ERRORE SNS] Impossibile inviare la notifica: {e}")


# SALVATAGGIO LOG SU S3 
def registra_esfiltrazione_s3(file_id, ip_rilevato, timestamp):
    try:
        endpoint = "http://host.docker.internal:4566"
        s3_client = boto3.client('s3', endpoint_url=endpoint, region_name='us-east-1')
        
        # Creiamo un file di log JSON identico a quelli della Intranet, 
        # ma con l'aggiunta delle coordinate geografiche dell'attaccante
        log_data = {
            "eventVersion": "1.08",
            "userIdentity": { "userName": "Sconosciuto (Esterno)" },
            "eventTime": timestamp,
            "eventName": "Exfiltration",
            "sourceIPAddress": ip_rilevato,
            "requestParameters": { 
                "bucketName": "portale-sicurezza-logs", 
                "documento": file_id 
            },
            # Simuliamo che l'attaccante abbia aperto il file a Mosca (Russia)
            "geo": {"lat": 55.7558, "lon": 37.6173} 
        }
        
        # Creiamo un nome univoco per il file di log
        nome_log = f"esfiltrazione_{int(time.time())}.json"
        
        s3_client.put_object(
            Bucket='portale-sicurezza-logs',
            Key=nome_log,
            Body=json.dumps(log_data),
            ContentType="application/json"
        )
        print(f"💾 [S3] Log di Esfiltrazione salvato correttamente per la Dashboard: {nome_log}")
    except Exception as e:
        print(f"⚠️ [ERRORE S3] Impossibile salvare il log di esfiltrazione: {e}")


# Simuliamo la rete interna dell'azienda (IP autorizzati)
RETE_INTERNA_AZIENDALE = ["192.168.1.50", "10.0.0.15", "172.16.0.5", "127.0.0.1"]

def lambda_handler(event, context):
    """
    AWS Lambda - Fase 3: L'Intercettatore
    Questo codice si sveglia solo quando un PDF REALE viene aperto (grazie al Web Beacon).
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    headers = event.get('headers', {})
    
    # Chi sta aprendo il file? (Estraiamo l'IP dalla richiesta)
    attacker_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '203.0.113.42')
    
    # Quale file è stato aperto? (Estraiamo il Tracking ID dal Web Beacon)
    query_params = event.get('queryStringParameters') or {}
    file_id = query_params.get('file_id', 'SCONOSCIUTO')

    print(f"\n--- 📡 RADAR ATTIVATO ALLE {timestamp} ---")
    print(f"📄 File analizzato: {file_id}")
    print(f"🕵️ IP Rilevato: {attacker_ip}")
    
    # CONTROLLO ESFILTRAZIONE: L'IP è dentro o fuori l'azienda?
    if attacker_ip in RETE_INTERNA_AZIENDALE:
        print("SCENARIO A: File reale aperto dall'ufficio. Tutto regolare.")
    else:
        print("SCENARIO B: ESFILTRAZIONE! FILE REALE APERTO FUORI DALL'AZIENDA!")
        # invia_allarme_sns(file_id, attacker_ip, "DLP ALERT: File Reale fuori perimetro")
        
        #Salva il log di esfiltrazione su S3 per farlo leggere alla Dashboard 
        registra_esfiltrazione_s3(file_id, attacker_ip, timestamp)
        
        print(f"-> Allarme WARNING: L'IP {attacker_ip} non appartiene alla rete aziendale.")

    # FINTA PAGINA DI ERRORE 
    URL_HOME_INTRANET = "file:///C:/Users/New/Desktop/cloud-active-defense/src/index.html"

    html_errore = f"""
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Errore di Sistema - Accesso Negato</title>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; color: #333; text-align: center; padding-top: 100px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 5px solid #d9534f; }}
            .error-icon {{ font-size: 80px; color: #d9534f; margin-bottom: 20px; }}
            h1 {{ font-size: 24px; color: #d9534f; margin-top: 0; }}
            p {{ font-size: 16px; color: #666; line-height: 1.6; }}
            .btn-home {{ display: inline-block; margin-top: 30px; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; transition: background-color 0.2s; }}
            .btn-home:hover {{ background-color: #002244; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #999; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="error-icon">🛑</div> 
            <h1>Errore 403: Accesso Negato</h1>
            <p>Il documento che si sta tentando di consultare è protetto da policy di sicurezza avanzate.<br>
               La sessione corrente non dispone delle autorizzazioni necessarie per visualizzare i contenuti o il file è stato spostato.</p>
            <p>Se ritieni che si tratti di un errore, contatta l'IT Support aziendale.</p>
            
            <a href="{URL_HOME_INTRANET}" class="btn-home">Torna alla Home Page</a>
            
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