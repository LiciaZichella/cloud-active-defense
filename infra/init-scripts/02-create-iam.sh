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

echo "Configurazione IAM completata!"