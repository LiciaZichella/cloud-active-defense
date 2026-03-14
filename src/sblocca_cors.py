import boto3

# Ci colleghiamo al nostro Cloud locale
s3 = boto3.client(
    's3', 
    endpoint_url='http://localhost:4566', 
    aws_access_key_id='test', 
    aws_secret_access_key='test', 
    region_name='us-east-1'
)

nome_bucket = 'portale-sicurezza-logs'

# 1. Ci assicuriamo che il "cassetto" esista
try:
    s3.create_bucket(Bucket=nome_bucket)
    print(f"[*] Bucket '{nome_bucket}' verificato/creato.")
except Exception as e:
    pass

# 2. Sblocchiamo le porte (CORS) per far entrare i log dal browser
cors_config = {
    'CORSRules': [{
        'AllowedOrigins': ['*'],
        'AllowedMethods': ['GET', 'PUT', 'POST'],
        'AllowedHeaders': ['*']
    }]
}

try:
    s3.put_bucket_cors(Bucket=nome_bucket, CORSConfiguration=cors_config)
    print("SUCCESSO! Permessi CORS sbloccati. Il Portale ora puo' comunicare con la Dashboard!")
except Exception as e:
    print(f"Errore nello sblocco CORS: {e}")