# setup.ps1 — avvia l'intero stack in un comando (Windows PowerShell)

Write-Host "[1/5] Avvio LocalStack..."
docker-compose up -d

Write-Host "[2/5] Attendo che LocalStack sia pronto..."
$pronti = $false
$tentativi = 0
while (-not $pronti -and $tentativi -lt 30) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:4566/_localstack/health" -TimeoutSec 2 -ErrorAction Stop
        $pronti = $true
    } catch {
        Start-Sleep -Seconds 2
        $tentativi++
    }
}
if (-not $pronti) {
    Write-Host "ERRORE: LocalStack non risponde dopo 60 secondi. Controlla Docker." -ForegroundColor Red
    exit 1
}
Write-Host "  LocalStack pronto." -ForegroundColor Green

Write-Host "[3/5] Configuro auditing S3..."
python setup_auditing.py

Write-Host "[4/5] Configuro topic SNS..."
python setup_sns.py

Write-Host "[5/5] Genero Honeyfile e File Reale..."
python src/generator.py

Write-Host ""
Write-Host "Stack pronto!" -ForegroundColor Green
Write-Host "  Apri src/index.html nel browser per il portale esca."
Write-Host "  Avvia il Radar:      python start_radar.py"
Write-Host "  Avvia la Dashboard:  streamlit run dashboard.py"
