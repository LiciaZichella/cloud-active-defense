#!/bin/bash
echo "Inizio configurazione infrastruttura S3 sicura (Active Defense)..."

# Nome del nostro bucket
BUCKET_NAME="company-secure-documents"

# 1. Creazione del bucket S3
awslocal s3api create-bucket --bucket $BUCKET_NAME --region eu-central-1 \
    --create-bucket-configuration LocationConstraint=eu-central-1
echo "Bucket '$BUCKET_NAME' creato con successo."

# 2. Attivazione del Bucket Versioning
awslocal s3api put-bucket-versioning --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled
echo "Versioning abilitato sul bucket '$BUCKET_NAME'."

# 3. Attivazione Crittografia AES-256 
awslocal s3api put-bucket-encryption --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
echo "Crittografia SSE-AES256 abilitata sul bucket '$BUCKET_NAME'."

echo "Configurazione S3 completata!"