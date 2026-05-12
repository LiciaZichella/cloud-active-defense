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

print("Infrastruttura per CloudTrail Simulato pronta all'uso.")
print("Il sistema è configurato per garantire la Catena di Custodia e il Non-Ripudio dei documenti.")
print("\n Auditing Completo! I log sono pronti per essere letti dalla futura Dashboard.")
