# Cloud Active Defense: Honeyfiles & Digital Watermarking

## Descrizione del Progetto
Questo repository contiene l'implementazione di un'architettura Cloud-Native di **Active Defense** sviluppata per contrastare la *Data Exfiltration* e le minacce interne (*Insider Threat*). 
Il progetto supera i limiti della sicurezza perimetrale tradizionale sfruttando la **Deception Technology** (Honeyfiles) e l'**Active Digital Watermarking** (Web Beacons) per rilevare in tempo reale il furto di documenti aziendali e mappare geograficamente l'identità e la posizione dell'attaccante.

## Stack Tecnologico e Linguaggi Utilizzati
* **Infrastruttura Cloud:** Docker, LocalStack (Emulatore AWS in locale)
* **Servizi AWS Simulati:** S3, IAM, Lambda, API Gateway (SNS predisposto)
* **Linguaggi di Programmazione:** Python 3.9+, Bash, HTML5, JavaScript, CSS3
* **Librerie Principali (Python):** `boto3` (AWS SDK), `streamlit` (Dashboard), `reportlab` & `fpdf2` (Generazione PDF forensi), `folium` & `plotly` (Mappatura geografica e grafici)

## Architettura dei Moduli

1. **Sicurezza Passiva (Data at Rest):** Creazione dell'infrastruttura via script (*Infrastructure as Code*). I bucket S3 sono protetti con crittografia `SSE-AES256` e `Bucket Versioning` per prevenire alterazioni o ransomware. Gli accessi sono gestiti simulando policy IAM basate sul *Least Privilege*.

2. **Active Defense e Detection (Data in Motion):** Script Python automatizzati che iniettano dinamicamente Web Beacons (Canary Tokens) nei documenti PDF e li caricano nel cloud. Un motore di rilevamento *Serverless* (AWS Lambda) rimane in ascolto:
   * **Scenario A (Honeyfile):** Se l'esca viene scaricata o aperta, scatta un allarme immediato (*Zero Trust*).
   * **Scenario B (Data Exfiltration):** Se un documento reale viene aperto fuori dal perimetro IP autorizzato, viene tracciata la violazione geografica.

3. **Auditing Custom & Dashboard:** Poiché AWS CloudTrail nativo non è disponibile gratuitamente su LocalStack, è stato sviluppato un *Custom Audit Logger* che salva file JSON immutabili su S3. Una Dashboard in Streamlit trasforma questi log in "Situational Awareness", mappando gli attacchi geograficamente ed esportando report di conformità forense (NIS 2).

## Prerequisiti: Webhook di notifica (opzionale)

Il sistema invia allarmi in tempo reale su **Discord** o **Slack** quando rileva un'esfiltrazione.

**Discord** (consigliato per i test):
1. In un server Discord, vai su *Impostazioni canale* -> *Integrazioni* -> *Crea Webhook*
2. Copia l'URL del webhook
3. Incollalo in `config.yaml` sotto `alerts.webhook_url`

**Slack**: crea un webhook su app.slack.com e incolla l'URL allo stesso modo.

Se `webhook_url` e' vuoto, le notifiche vengono silenziate senza errori.

---

## Prerequisiti: Database GeoIP (MaxMind GeoLite2)

Il sistema usa il database **MaxMind GeoLite2-City** per la geolocalizzazione degli IP.
Il file `.mmdb` è escluso da git (è ~70 MB). Per scaricarlo:

1. Crea un account gratuito su [maxmind.com](https://www.maxmind.com/en/geolite2/signup)
2. Vai su *Download Files* → **GeoLite2 City** → scarica il file `.tar.gz`
3. Estrai `GeoLite2-City.mmdb` e copialo in `data/geoip/GeoLite2-City.mmdb`

Senza il database, la geolocalizzazione restituisce coordinate `(0.0, 0.0)` con un avviso a console.

---

## Stato dello Sviluppo e Next Steps
Attualmente il sistema è ottimizzato per l'esecuzione locale tramite un approccio **"Mock Data"**, evitando colli di bottiglia hardware. Le notifiche email via Amazon SNS sono implementate nel codice ma bypassate in favore di chiamate Webhook più leggere.
* **Prossimo sviluppo:** Integrazione API-First (Webhook) con la piattaforma di Posture Management **LicIA / SecurityVitals** per innescare azioni di *Auto-Remediation* (blocco utente istantaneo).