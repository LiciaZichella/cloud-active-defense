#!/bin/bash
echo "Inizio configurazione identita' IAM (Least Privilege)..."

# 1. Creazione del ruolo 'Employee'
awslocal iam create-role \
    --role-name EmployeeRole \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
echo "Ruolo 'EmployeeRole' creato con successo."

# 2. Creazione del ruolo 'SecurityAdmin'
awslocal iam create-role \
    --role-name SecurityAdminRole \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
echo "Ruolo 'SecurityAdminRole' creato con successo."

# 3. Policy Least Privilege per Employee (solo GetObject su prefisso public/)
awslocal iam create-policy \
    --policy-name EmployeeS3Policy \
    --description "Dipendente: s3:GetObject solo su company-secure-documents/public/" \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"ReadPublicDocuments","Effect":"Allow","Action":"s3:GetObject","Resource":"arn:aws:s3:::company-secure-documents/public/*"}]}'

EMPLOYEE_POLICY_ARN=$(awslocal iam list-policies \
    --query "Policies[?PolicyName=='EmployeeS3Policy'].Arn" --output text)
awslocal iam attach-role-policy \
    --role-name EmployeeRole \
    --policy-arn "$EMPLOYEE_POLICY_ARN"
echo "Policy 'EmployeeS3Policy' creata e assegnata a EmployeeRole."

# 4. Policy per SecurityAdmin (accesso completo S3 sui bucket del progetto)
awslocal iam create-policy \
    --policy-name SecurityAdminS3Policy \
    --description "Admin sicurezza: s3:* su company-secure-documents e portale-sicurezza-logs" \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"FullAccessDocuments","Effect":"Allow","Action":"s3:*","Resource":["arn:aws:s3:::company-secure-documents","arn:aws:s3:::company-secure-documents/*"]},{"Sid":"FullAccessAuditLogs","Effect":"Allow","Action":"s3:*","Resource":["arn:aws:s3:::portale-sicurezza-logs","arn:aws:s3:::portale-sicurezza-logs/*"]}]}'

ADMIN_POLICY_ARN=$(awslocal iam list-policies \
    --query "Policies[?PolicyName=='SecurityAdminS3Policy'].Arn" --output text)
awslocal iam attach-role-policy \
    --role-name SecurityAdminRole \
    --policy-arn "$ADMIN_POLICY_ARN"
echo "Policy 'SecurityAdminS3Policy' creata e assegnata a SecurityAdminRole."

echo "Configurazione IAM completata!"
