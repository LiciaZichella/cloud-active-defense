import boto3
import zipfile
import os
import json
import base64
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from config import CONFIG
import geoip2.database

print("FASE 3: INIZIALIZZAZIONE SISTEMA DI DIFESA ATTIVA")

endpoint   = CONFIG['localstack']['endpoint']
region     = CONFIG['localstack']['region']
access_key = CONFIG['localstack']['access_key']
secret_key = CONFIG['localstack']['secret_key']
radar_port = CONFIG['radar']['port']

# Variabili d'ambiente da iniettare nella Lambda (radar.py non può accedere a config.yaml)
lambda_env = {
    'LOCALSTACK_ENDPOINT': CONFIG['localstack']['endpoint_lambda'],
    'BUCKET_AUDIT_LOGS':   CONFIG['buckets']['audit_logs'],
    'SNS_TOPIC_ARN':       CONFIG['sns']['topic_arn'],
    'APP_REGION':          region,
    'INTERNAL_IPS':        ','.join(CONFIG['network']['internal_ips'])
}

print("\n[*] 1. Impacchettamento funzione Lambda (radar.zip)...")
with zipfile.ZipFile("radar.zip", "w") as z:
    z.write(os.path.join("src", "radar.py"), arcname="radar.py")

print("[*] 2. Connessione al Cloud (LocalStack)...")
lambda_client = boto3.client(
    'lambda', endpoint_url=endpoint,
    aws_access_key_id=access_key, aws_secret_access_key=secret_key, region_name=region
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
        Code=dict(ZipFile=zipped_code),
        Environment={'Variables': lambda_env}
    )
    print(" Lambda 'RadarFunction' installata e pronta!")
except Exception as e:
    if "ResourceConflictException" in str(e):
        lambda_client.update_function_code(FunctionName='RadarFunction', ZipFile=zipped_code)
        lambda_client.update_function_configuration(
            FunctionName='RadarFunction',
            Environment={'Variables': lambda_env}
        )
        print(" Lambda 'RadarFunction' aggiornata!")
    else:
        print(f" Errore: {e}")


class APIGatewayProxy(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # sopprime i log HTTP di sistema per far risaltare solo gli allarmi

    def do_GET(self):
        if self.path.startswith('/radar'):
            parsed_url = urlparse(self.path)
            query_params = {k: v[0] for k, v in parse_qs(parsed_url.query).items()}

            # Fix C3: IP reale del client invece del valore hardcoded precedente
            client_ip = self.client_address[0]
            geo_lat, geo_lon = _geo_lookup(client_ip)

            event = {
                "queryStringParameters": query_params,
                "headers": dict(self.headers),
                "requestContext": {
                    "identity": {"sourceIp": client_ip}
                },
                "geoLat": geo_lat,
                "geoLon": geo_lon
            }

            response = lambda_client.invoke(
                FunctionName='RadarFunction',
                InvocationType='RequestResponse',
                LogType='Tail',
                Payload=json.dumps(event)
            )

            if 'LogResult' in response:
                logs = base64.b64decode(response['LogResult']).decode('utf-8')
                for line in logs.split('\n'):
                    if not line.startswith('START') and not line.startswith('END') and not line.startswith('REPORT'):
                        print(line.strip())

            result = json.loads(response['Payload'].read().decode('utf-8'))
            self.send_response(result.get('statusCode', 200))
            self.send_header('Content-Type', result.get('headers', {}).get('Content-Type', 'image/gif'))
            self.end_headers()

            body = result.get('body', '')
            if result.get('isBase64Encoded'):
                self.wfile.write(base64.b64decode(body))
            else:
                self.wfile.write(body.encode())


print(f"\n[*] 4. Avvio API Gateway sulla porta {radar_port}...")
print(" IL RADAR E' ARMATO E IN ASCOLTO PER LE ESFILTRAZIONI! (Premi Ctrl+C per spegnerlo)")
print("TEST LIVE: Apri il PDF 'Progetto_Infrastruttura_Rete.pdf' per simulare l'apertura fuori dalla rete aziendale!")

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


server = HTTPServer(('localhost', radar_port), APIGatewayProxy)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\n Radar spento.")
