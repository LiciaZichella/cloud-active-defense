# Mappatura MITRE ATT&CK — Cloud Active Defense

## 1. Premessa

**MITRE ATT&CK** (Adversarial Tactics, Techniques, and Common Knowledge) è un framework di conoscenza globalmente adottato che cataloga le tattiche e le tecniche utilizzate dagli attaccanti reali, organizzate per fasi dell'attacco (initial access, execution, persistence, ecc.). È mantenuto dalla MITRE Corporation e aggiornato continuamente sulla base di incidenti documentati; rappresenta lo standard de facto per la comunicazione tra team di sicurezza, vendor e ricercatori.

A esso si affianca **MITRE D3FEND**, il framework complementare orientato alle tecniche di **difesa**: mentre ATT&CK cataloga cosa fanno gli attaccanti, D3FEND cataloga cosa fanno i difensori per contrastarli. La mappatura congiunta ATT&CK ↔ D3FEND permette di argomentare in modo strutturato la copertura difensiva di un sistema.

Il presente documento mappa le capacità del sistema Cloud Active Defense sulle tecniche ATT&CK rilevanti (sezione 2) e sulle contromosse D3FEND corrispondenti (sezione 3), con una stima della copertura tattica aggregata (sezione 4) e un aggancio alle normative di riferimento citate nella proposta di tesi (sezione 5).

---

## 2. Tabella di mappatura — Detection (MITRE ATT&CK)

| Tactic | Technique ID | Nome | Componente del sistema | Copertura | Note |
|---|---|---|---|---|---|
| TA0009 Collection | T1530 | Data from Cloud Storage Object | Portale S3 + Honeyfile + `dashboard/utils/data.py` | Completa | Qualsiasi accesso a file in S3 genera un log CloudTrail; i Honeyfile scattano allarme immediato al download |
| TA0010 Exfiltration | T1567.002 | Exfiltration to Cloud Storage | Lambda radar (Scenario B) | Parziale | Rileva l'apertura del documento fuori perimetro tramite beacon HTTP; non copre upload diretto verso storage esterno |
| TA0010 Exfiltration | T1041 | Exfiltration Over C2 Channel | Web beacon HTTP GET verso radar | Compensativa | Il beacon stesso usa HTTP come C2 "invertito": la richiesta del documento verso il radar è il segnale di esfiltrazione |
| TA0005 Defense Evasion | T1090.003 | Multi-hop Proxy (Tor) | `threat_intel.classifica_ip` | Completa | Confronto con lista aggiornata nodi di uscita Tor in `data/tor_exit_nodes.txt`; allarme con tipo `tor` |
| TA0005 Defense Evasion | T1090.002 | External Proxy (VPN) | `threat_intel.classifica_ip` | Parziale | Copertura limitata ai CIDR dei principali provider VPN commerciali; VPN self-hosted non coperte |
| TA0001 Initial Access | T1078 | Valid Accounts | Behavioral `regola_off_hours` | Compensativa | Non rileva il furto di credenziali, ma segnala il loro uso anomalo fuori orario (indicatore di compromissione) |
| TA0007 Discovery | T1083 | File and Directory Discovery | Behavioral `regola_mass_access` + `regola_recon_pattern` | Parziale | Rileva accessi massivi da stesso reparto e sequenze REAL→HONEY come indicatori di ricognizione |
| TA0006 Credential Access | T1552 | Unsecured Credentials | Honeytoken (`aws_credentials.txt`, `.env.production`, `devops_secrets.yaml`, `id_rsa_backup`) | Completa | Qualsiasi download di un Honeytoken è classificato come `Honeytoken-Leak` con allarme immediato |
| TA0043 Reconnaissance | T1592 | Gather Victim Host Information | Behavioral `regola_recon_pattern` | Parziale | Rileva la sequenza REAL seguito da HONEY (indicatore di mappatura del repository); non copre tecniche di recon esterne al sistema |

**Note sulla copertura:**

- **Completa** — il sistema rileva la tecnica in modo diretto e affidabile nel perimetro del PoC.
- **Parziale** — il sistema rileva la tecnica in alcuni scenari ma non in tutti (es. limitazioni di lista IP, connettività beacon).
- **Compensativa** — il sistema non rileva la tecnica direttamente, ma produce un segnale correlato che consente al SOC di inferire la tecnica applicata.

---

## 3. Tabella di mappatura — Difesa (MITRE D3FEND)

| Defensive Technique | ID D3FEND | Componente | Descrizione |
|---|---|---|---|
| File Hashing | D3-FH | `src/pdf_signer.py` | La firma RSA-2048 incorpora un hash crittografico del contenuto PDF; qualsiasi alterazione del file produce una firma non verificabile |
| Document Integrity Enforcement | D3-DIE | `src/pdf_verifier.py` | Prima di associare un documento a un evento di esfiltrazione, il radar verifica la firma digitale; lo stato (`VALID`/`INVALID`/`MISSING`) è incluso nel log e nel webhook |
| Identity-based Authentication Action | D3-IAA | `src/radar.py:revoca_permessi_iam` | In risposta a un'esfiltrazione confermata, il sistema revoca dinamicamente le policy IAM dell'utente identificato come downloader |
| Account Locking | D3-AL | `src/radar.py:revoca_permessi_iam` | Il detach di tutte le policy IAM equivale a un blocco funzionale dell'account per l'accesso alle risorse S3 aziendali |
| Decoy Session Token | D3-DST | `src/honeytoken.py` + `src/generator.py` | I file Honeytoken (credenziali fake) fungono da token-esca: la loro presentazione in un sistema esterno rivela la compromissione |
| Network Traffic Filtering | D3-NTF | `src/threat_intel.py` | Classificazione dell'IP sorgente come Tor/VPN/normale prima della registrazione del log; usata per prioritizzare la severità dell'allarme |
| Decoy File | D3-DF | Honeyfile + `src/generator.py` | I Honeyfile sono esche documentali indistinguibili visivamente dai file reali (stesso formato, firma digitale applicata a entrambi) |

---

## 4. Heatmap di copertura tattica

La tabella seguente stima la percentuale di tecniche MITRE ATT&CK coperte dal sistema per ciascuna tattica, calcolata sul sottoinsieme di tecniche tipicamente osservate in scenari di insider threat ed esfiltrazione cloud (non sull'intero catalogo ATT&CK, che conterebbe migliaia di tecniche).

| Tattica | ID | Tecniche tipiche considerate | Coperte | Stima copertura |
|---|---|---|---|---|
| Initial Access | TA0001 | Valid Accounts, Phishing, Supply Chain | 1 (compensativa) | 25% |
| Execution | TA0002 | User Execution, Scripting | 0 | 0% |
| Persistence | TA0003 | Account Manipulation, Scheduled Task | 0 | 0% |
| Privilege Escalation | TA0004 | Abuse Elevation Control, Valid Accounts | 0 | 0% |
| Defense Evasion | TA0005 | Proxy (Tor, VPN), Obfuscation, Timestomping | 2 | 50% |
| Credential Access | TA0006 | Unsecured Credentials, Brute Force | 1 | 50% |
| Discovery | TA0007 | File Discovery, Cloud Infrastructure Discovery | 1 (parziale) | 33% |
| Lateral Movement | TA0008 | Internal Spearphishing, Use Alternate Auth | 0 | 0% |
| Collection | TA0009 | Data from Cloud Storage, Screen Capture | 1 | 100% (per S3) |
| Exfiltration | TA0010 | Exfiltration to Cloud, Exfiltration over C2 | 2 | 75% |
| Command and Control | TA0011 | Web Service, Encrypted Channel | 0 | 0% |
| Impact | TA0040 | Data Destruction, Account Access Removal | 0 | 0% |
| Resource Development | TA0042 | Acquire Infrastructure, Compromise Accounts | 0 | 0% |
| Reconnaissance | TA0043 | Gather Victim Host Info, Active Scanning | 1 (parziale) | 33% |

Il sistema mostra un **bias intenzionale** verso le tattiche **TA0009 (Collection)** e **TA0010 (Exfiltration)**, coerente con la sua funzione di sistema di deception per la protezione della proprietà intellettuale aziendale. Le tattiche di Initial Access, Persistence e Lateral Movement non sono coperte perché fuori scope della tesi: il sistema non è un endpoint security o un SIEM completo, ma un PoC specializzato su deception e detection post-accesso.

---

## 5. Confronto con framework di compliance

### NIS2 — Art. 21 (Misure di gestione del rischio di sicurezza)

La Direttiva NIS2 impone alle organizzazioni di adottare misure tecniche e organizzative proporzionate per gestire i rischi per la sicurezza dei sistemi informativi, includendo esplicitamente il monitoraggio degli incidenti, la gestione degli accessi e la continuità operativa. Il sistema contribuisce su tre fronti:

- **Monitoraggio**: l'audit trail su S3 (`cloudtrail_logs/`) costituisce una catena di custodia continua per tutti gli eventi di accesso ai documenti.
- **Gestione accessi**: le policy IAM per ruolo (`EmployeeRole`, `SecurityAdminRole`) implementano il principio del minimo privilegio; la revoca automatica garantisce una risposta proporzionata e tempestiva.
- **Rilevamento anomalie**: le regole behavioral (burst, off-hours, mass access, recon pattern) consentono di identificare comportamenti anomali prima che si traducano in una violazione confermata.

### GDPR — Notifica violazioni di dati personali (Art. 33-34)

Il GDPR impone di notificare le violazioni di dati personali all'autorità di controllo entro 72 ore dal momento in cui se ne viene a conoscenza. Il sistema accelera questa catena in due modi:

- Il webhook Discord/Slack invia una notifica in tempo reale nel momento in cui il beacon HTTP viene attivato, riducendo il tempo di rilevamento (TTD) potenzialmente a pochi secondi.
- Il log di esfiltrazione salvato su S3 include timestamp, IP sorgente, tipo di minaccia (Tor/VPN/normale) e stato della firma digitale: informazioni sufficienti per avviare immediatamente la valutazione dell'impatto e la notifica all'autorità.

### NIST CSF 2.0 — Funzioni Detect e Respond

Il NIST Cybersecurity Framework 2.0 organizza le capacità di sicurezza in sei funzioni: Govern, Identify, Protect, Detect, Respond, Recover. Il sistema Cloud Active Defense si posiziona principalmente sulle funzioni **Detect** e **Respond**:

- **Detect (DE)**: il portale di auditing, il radar Lambda, le regole behavioral e il modulo di verifica firma implementano capability di rilevamento continuo coerenti con la sottofunzione DE.CM (Continuous Monitoring) e DE.AE (Adverse Event Analysis).
- **Respond (RS)**: la revoca automatica IAM, i webhook e il log di remediation implementano capability di risposta automatizzata coerenti con RS.MA (Incident Management) e RS.MI (Incident Mitigation).

Le funzioni Govern, Identify, Protect e Recover non sono implementate nel PoC, ma sono citate nella proposta di tesi come ambito fuori scope.

---

## 6. Conclusione

Il sistema Cloud Active Defense copre un sottoinsieme significativo e coerente delle tecniche MITRE ATT&CK rilevanti per lo scenario di **insider threat ed esfiltrazione da storage cloud**, con una copertura sostanziale per le tattiche TA0009 (Collection) e TA0010 (Exfiltration) e una copertura compensativa per TA0005 (Defense Evasion) tramite la classificazione degli IP Tor/VPN.

Il bias della copertura è **intenzionale e dichiarato**: il sistema non è un SIEM né una soluzione di endpoint security, ma un PoC di deception architecture focalizzato sulla protezione della proprietà intellettuale documentale in ambienti cloud. Le tecniche di Initial Access, Persistence e Lateral Movement non rientrano nel perimetro del sistema non per negligenza progettuale, ma perché l'architettura assume che l'attaccante abbia già ottenuto accesso legittimo — il che è il presupposto operativo di un insider threat — e si concentra sulla detection di quello che accade dopo, non prima.

La mappatura su D3FEND evidenzia come ogni componente del sistema corrisponda a una tecnica difensiva riconosciuta: il sistema non è un insieme di euristica ad hoc, ma una composizione strutturata di pattern di difesa documentati, applicati a un caso d'uso specifico e verificabile in laboratorio tramite LocalStack.
