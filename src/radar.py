import json
import datetime
import base64

# Simuliamo la rete interna dell'azienda (IP autorizzati)
RETE_INTERNA_AZIENDALE = ["192.168.1.50", "10.0.0.15", "172.16.0.5", "127.0.0.1"]

def lambda_handler(event, context):
    """
    AWS Lambda - Fase 3: L'Intercettatore e Il Bivio
    Questo codice si sveglia solo quando un PDF viene aperto.
    """
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    headers = event.get('headers', {})
    
    # 1. Chi sta aprendo il file? (Estraiamo l'IP dalla richiesta)
    # Nota: se l'IP non c'è, mettiamo un IP esterno finto per fare i test
    attacker_ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '203.0.113.42')
    
    # 2. Quale file è stato aperto? (Estraiamo il Tracking ID dal Web Beacon)
    query_params = event.get('queryStringParameters') or {}
    file_id = query_params.get('file_id', 'SCONOSCIUTO')

    print(f"\n--- 📡 RADAR ATTIVATO ALLE {timestamp} ---")
    print(f"📄 File analizzato: {file_id}")
    print(f"🕵️ IP Rilevato: {attacker_ip}")
    
    # REGOLA 1: È un Honeyfile? -> ALLARME IMMEDIATO
    if "HONEY" in file_id.upper():
        print("SCENARIO 1: HONEYFILE VIOLATO! (Insider Threat)")
        print("-> Generazione Alert CRITICO per esfiltrazione dati.")

    # REGOLA 2: È un File Reale? -> CONTROLLO IP (Interno o Esterno)
    elif "REAL" in file_id.upper():
        if attacker_ip in RETE_INTERNA_AZIENDALE:
            print("SCENARIO 2A: File reale aperto dall'ufficio. Tutto regolare.")
        else:
            print("SCENARIO 2B: FILE REALE APERTO FUORI DALL'AZIENDA!")
            print(f"-> Allarme WARNING: L'IP {attacker_ip} non appartiene alla rete aziendale.")
            
    else:
        print("File sconosciuto o Web Beacon compromesso.")

   # FINTA PAGINA DI ERRORE 
    URL_HOME_INTRANET = "file:///C:/Users/New/Desktop/cloud-active-defense/src/index.html" # da aggiustare

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