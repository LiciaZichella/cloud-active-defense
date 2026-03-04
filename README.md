# Cloud Active Defense: Honeyfiles & Digital Watermarking

Descrizione del Progetto
Questo repository contiene l'implementazione di un'architettura Cloud-Native di **Active Defense** per contrastare la *Data Exfiltration* e le minacce interne (*Insider Threat*). 
Il progetto sfrutta Honeyfiles e Active Digital Watermarking (Web Beacons) per rilevare in tempo reale il furto di documenti e tracciare l'identità dell'attaccante.

Moduli dell'Architettura
1. Sicurezza Passiva (Data at Rest): Simulazione AWS via LocalStack/Docker. Amazon S3 con crittografia `SSE-AES256` e `Bucket Versioning`. Controllo accessi IAM (Least Privilege).
2. Active Defense (Data in Motion): Script Python per iniezione dinamica di Web Beacons nei PDF. AWS Lambda per la detection del "Phone Home" fuori dal perimetro.
3. Auditing & Forensics: AWS CloudTrail per il logging, CloudWatch e SNS per l'alerting. Dashboard Streamlit per mappatura attacchi e reportistica NIS 2.