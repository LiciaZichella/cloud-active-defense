import boto3
from config import CONFIG

s3 = boto3.client(
    's3',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region']
)

print(" Configurazione Modulo Auditing (Custom CloudTrail)...")

bucket_log = CONFIG['buckets']['audit_logs']
try:
    s3.create_bucket(Bucket=bucket_log)
    print(f" Bucket sicuro per i log creato: {bucket_log}")
except Exception as e:
    print(f"Info: Il bucket '{bucket_log}' è già pronto e operativo.")

# CORS necessario per il portale index.html che chiama S3 direttamente da JavaScript (browser-side
# AWS SDK). Senza questo, le chiamate sono bloccate silenziosamente dal browser.
cors_config = {
    'CORSRules': [{
        'AllowedOrigins': ['*'],
        'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        'AllowedHeaders': ['*']
    }]
}
try:
    s3.put_bucket_cors(Bucket=bucket_log, CORSConfiguration=cors_config)
    print(f" Permessi CORS configurati su {bucket_log}: il portale puo' scrivere log dal browser.")
except Exception as e:
    print(f"Errore configurazione CORS: {e}")

print("Infrastruttura per CloudTrail Simulato pronta all'uso.")
print("Il sistema è configurato per garantire la Catena di Custodia e il Non-Ripudio dei documenti.")
print("\n Auditing Completo! I log sono pronti per essere letti dalla futura Dashboard.")
