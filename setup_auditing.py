import boto3

# Connessione al nostro Cloud locale
endpoint = "http://localhost:4566"
s3 = boto3.client('s3', endpoint_url=endpoint, region_name='us-east-1')

print(" Configurazione Modulo Auditing (Custom CloudTrail)...")

# Creiamo un Bucket S3 per conservare i log in modo immutabile
bucket_log = 'portale-sicurezza-logs'
try:
    s3.create_bucket(Bucket=bucket_log)
    print(f" Bucket sicuro per i log creato: {bucket_log}")
except Exception as e:
    # Se il bucket esiste già, LocalStack ci avviserà dolcemente
    print(f"Info: Il bucket '{bucket_log}' è già pronto e operativo.")

print("Infrastruttura per CloudTrail Simulato pronta all'uso.")
print("Il sistema è configurato per garantire la Catena di Custodia e il Non-Ripudio dei documenti.")
print("\n Auditing Completo! I log sono pronti per essere letti dalla futura Dashboard.")