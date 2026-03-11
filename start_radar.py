import boto3
import zipfile
import os
import json
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

print("🚀 FASE 3: INIZIALIZZAZIONE SISTEMA DI DIFESA ATTIVA")

# CARICARE LAMBDA SU LOCALSTACK
print("\n[*] 1. Impacchettamento funzione Lambda (radar.zip)...")
with zipfile.ZipFile("radar.zip", "w") as z:
    z.write(os.path.join("src", "radar.py"), arcname="radar.py")

print("[*] 2. Connessione al Cloud (LocalStack)...")
lambda_client = boto3.client(
    'lambda', endpoint_url='http://localhost:4566',
    aws_access_key_id='test', aws_secret_access_key='test', region_name='us-east-1'
)

print("[*] 3. Caricamento della Lambda nel Cloud...")
with open("radar.zip", "rb") as f:
    zipped_code = f.read()

try:
    lambda_client.create_function(
        FunctionName='RadarFunction',
        Runtime='python3.9',
        Role='arn:aws:iam::000000000000:role/lambda-role',
        Handler='radar.lambda_handler',
        Code=dict(ZipFile=zipped_code)
    )
    print(" Lambda 'RadarFunction' installata e pronta!")
except Exception as e:
    if "ResourceConflictException" in str(e):
        lambda_client.update_function_code(FunctionName='RadarFunction', ZipFile=zipped_code)
        print(" Lambda 'RadarFunction' aggiornata!")
    else:
        print(f" Errore: {e}")

# API GATEWAY
class APIGatewayProxy(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass # Nascondiamo i log di sistema per far risaltare solo l'allarme

    def do_GET(self):
        if self.path.startswith('/radar'):
            parsed_url = urlparse(self.path)
            query_params = {k: v[0] for k, v in parse_qs(parsed_url.query).items()}
            
            # Simuliamo la richiesta dal PDF (mettiamo un IP Esterno per testare l'intrusione)
            event = {
                "queryStringParameters": query_params,
                "headers": dict(self.headers),
                "requestContext": {
                    "identity": {"sourceIp": "203.0.113.42"} 
                }
            }
            
            # Invochiamo la Lambda e catturiamo in diretta i LOG 
            response = lambda_client.invoke(
                FunctionName='RadarFunction',
                InvocationType='RequestResponse',
                LogType='Tail', 
                Payload=json.dumps(event)
            )
            
            # Stampiamo nel terminale i messaggi di allarme 
            if 'LogResult' in response:
                logs = base64.b64decode(response['LogResult']).decode('utf-8')
                for line in logs.split('\n'):
                    # Filtriamo le scritte di sistema di AWS per mostrare solo i tuoi "print"
                    if not line.startswith('START') and not line.startswith('END') and not line.startswith('REPORT'):
                        print(line.strip())
            
            # Rispediamo il pixel trasparente al PDF
            result = json.loads(response['Payload'].read().decode('utf-8'))
            self.send_response(result.get('statusCode', 200))
            self.send_header('Content-Type', result.get('headers', {}).get('Content-Type', 'image/gif'))
            self.end_headers()
            
            body = result.get('body', '')
            if result.get('isBase64Encoded'):
                self.wfile.write(base64.b64decode(body))
            else:
                self.wfile.write(body.encode())

print("\n [*] 4. Avvio API Gateway sulla porta 8080...")
print(" IL RADAR E' ARMATO E IN ASCOLTO! (Premi Ctrl+C per spegnerlo)")
print("TEST LIVE: Apri il PDF 'Bilancio_Riservato_2026.pdf' e clicca in un punto qualsiasi della pagina!")

server = HTTPServer(('localhost', 8080), APIGatewayProxy)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n Radar spento.")