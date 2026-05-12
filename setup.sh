#!/bin/bash
# setup.sh — avvia l'intero stack in un comando (Linux / macOS)
set -e

echo "[1/5] Avvio LocalStack..."
docker-compose up -d

echo "[2/5] Attendo che LocalStack sia pronto..."
until curl -sf http://localhost:4566/_localstack/health > /dev/null; do
    echo "  In attesa..."
    sleep 2
done
echo "  LocalStack pronto."

echo "[3/5] Configuro auditing S3..."
python setup_auditing.py

echo "[4/5] Configuro topic SNS..."
python setup_sns.py

echo "[5/5] Genero Honeyfile e File Reale..."
python src/generator.py

echo ""
echo "Stack pronto!"
echo "  Apri src/index.html nel browser per il portale esca."
echo "  Avvia il Radar:      python start_radar.py"
echo "  Avvia la Dashboard:  streamlit run dashboard.py"
