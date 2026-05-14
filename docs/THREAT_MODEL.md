# Threat Model — Cloud Active Defense

## 1. Premessa

Un **threat model** è un processo strutturato che consente di identificare, classificare e prioritizzare le minacce a cui un sistema è esposto, prima che queste si concretizzino in incidenti. In ambito accademico e industriale si fa riferimento a framework standardizzati: **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege), sviluppato da Microsoft, è il più diffuso per la modellazione di sistemi software; **PASTA** (Process for Attack Simulation and Threat Analysis) è invece orientato al rischio di business e alla simulazione degli attacchi in sette fasi. Il presente documento adotta una prospettiva STRIDE-like: per ciascun asset critico si individuano le minacce applicabili e si descrive se e come il sistema le copre. L'obiettivo non è dimostrare un sistema invulnerabile, ma documentare esplicitamente sia le coperture sia i limiti, garantendo trasparenza accademica e riproducibilità del PoC.

---

## 2. Asset protetti

| Asset | Descrizione | Criticità |
|---|---|---|
| Documenti aziendali reali (.pdf, .docx, .xlsx) | Bilanci, contratti, progetti riservati caricati in S3 | ALTA |
| Honeyfile (esche) | File-trappola che non dovrebbero mai essere aperti da utenti non autorizzati | MEDIA (sono l'inganno) |
| Honeytoken (credenziali fake) | File di credenziali esca (aws_credentials.txt, .env.production, ecc.) | MEDIA |
| Log di audit su S3 (cloudtrail_logs, esfiltrazione, remediation) | Catena di custodia per forensics e indagini post-incidente | ALTA |
| Chiave privata di firma (data/keys/) | Strumento fondante della chain of trust; la sua compromissione invalida tutte le garanzie di integrità | CRITICA |

---

## 3. Threat actors considerati

| Attore | Profilo | Motivazione |
|---|---|---|
| Insider opportunistico | Dipendente con accesso legittimo che agisce per curiosità o distrazione | Curiosità, frustrazione, accesso accidentale a documenti riservati |
| Insider malevolo | Dipendente che pianifica l'esfiltrazione di dati | Tornaconto economico, vendetta, accordo con terze parti |
| Attaccante esterno post-compromissione | Ha già violato un endpoint o ottenuto credenziali valide | Reconnaissance, esfiltrazione massiva, rivendita dati |
| State-sponsored (APT) | Attore con risorse elevate e target mirato, capace di operare a lungo nel tempo | Spionaggio industriale, sabotaggio, raccolta intelligence |

---

## 4. Attack surface e detection coverage

### 4.1 Cosa il sistema RILEVA

| # | Minaccia | Componente del sistema | Evidenza nel codice |
|---|---|---|---|
| 1 | Download di un Honeyfile dal portale web | JS `registraDownload()` + classificazione dashboard | `src/index.html`, `dashboard/utils/data.py` |
| 2 | Apertura di un PDF reale da IP esterno (Adobe/Foxit) | Lambda radar + `threat_intel` | `src/radar.py:lambda_handler` |
| 3 | Apertura PDF da nodo Tor | `threat_intel.classifica_ip` | `src/threat_intel.py` + `data/tor_exit_nodes.txt` |
| 4 | Apertura PDF da VPN nota (provider commerciali) | `threat_intel.classifica_ip` | `src/threat_intel.py` + `data/vpn_cidr_ranges.txt` |
| 5 | Download di un Honeytoken (credenziali fake) | Classificazione `Honeytoken-Leak` nel data layer | `dashboard/utils/data.py` |
| 6 | Download burst (>10 file in 5 minuti, stesso utente) | Behavioral `regola_download_burst` | `src/behavioral.py` |
| 7 | Download off-hours (fuori orario lavorativo configurato) | Behavioral `regola_off_hours` | `src/behavioral.py` |
| 8 | Download massivo coordinato da stesso reparto | Behavioral `regola_mass_access` | `src/behavioral.py` |
| 9 | Pattern di ricognizione: accesso a HONEY dopo accesso a REAL | Behavioral `regola_recon_pattern` | `src/behavioral.py` |
| 10 | Documento alterato dopo la firma (integrità compromessa) | `pdf_verifier` → stato INVALID | `src/pdf_verifier.py` |
| 11 | Documento sostituito senza firma digitale | `pdf_verifier` → stato MISSING | `src/pdf_verifier.py` |
| 12 | Esfiltrazione confermata → revoca automatica IAM dell'utente | Auto-Remediation nel radar | `src/radar.py:revoca_permessi_iam` |

### 4.2 Cosa il sistema NON RILEVA (limiti onesti)

| # | Minaccia | Perché non è rilevata | Mitigazione possibile |
|---|---|---|---|
| 1 | Apertura PDF reale in browser viewer (Edge, Chrome) | I browser bloccano richieste a localhost per anti-phishing policy | Deployment con URL pubblica + reader desktop |
| 2 | Apertura DOCX in Word 365 | Office 365 blocca `INCLUDEPICTURE` come misura post-Follina (CVE-2022-30190) | Tecniche alternative (future work) |
| 3 | Apertura PDF offline (senza connessione internet) | Il beacon HTTP non raggiunge il radar | Impossibile da rilevare a runtime; richiede DLP endpoint |
| 4 | Attaccante con VPN self-hosted (WireGuard su VPS personale) | Il CIDR non compare nelle liste di provider VPN commerciali | API di intelligence commerciale (es. Spur.us) |
| 5 | Insider che apre file in ufficio senza scaricarlo | Nessun evento di download viene generato su CloudTrail | DLP a livello di endpoint (agente sul client) |
| 6 | Manomissione di documenti DOCX/XLSX | La firma digitale è implementata solo su PDF | Future work: XML Digital Signatures per Office |
| 7 | Replay attack di un beacon precedente | Nessun nonce o timestamp validation nel beacon URL | Future work: nonce monouso nel query string |
| 8 | Attaccante che rinomina il file dopo il download | La correlazione dwell time è basata su `file_name` | Future work: hash del contenuto come chiave di correlazione |
| 9 | Saturazione del bucket logs (denial of observation) | Nessun rate limiting sulle `put_object` in S3 | Future work: rate limiting a livello Lambda/API Gateway |
| 10 | Compromissione del filesystem del server (chiave privata) | La chiave privata è salvata in chiaro in `data/keys/` | Migrazione a AWS KMS o HSM hardware |

### 4.3 Bypass noti

I seguenti bypass sono documentati in letteratura e applicabili a sistemi di canary token e web beacon:

1. **Disabilitare JavaScript in Adobe Reader** (Preferenze → Sicurezza → Disabilita JavaScript) — elimina il trigger `OpenAction JS` ma non il `linkURL` che rimane attivo al click.
2. **Aprire il PDF in una sandbox isolata** senza connessione di rete (es. Tails OS, Dangerzone) — il beacon non raggiunge il radar in nessuna modalità.
3. **Rimuovere il beacon dal PDF** tramite editor PDF (`pdftk`, `qpdf`, `mutool`) prima dell'analisi — viene rilevato da `pdf_verifier` che segnala stato `INVALID` poiché la firma crittografica non corrisponde.
4. **Spoofing dell'IP via header `X-Forwarded-For`** — non applicabile in questo sistema: il radar usa `client_address[0]` della connessione TCP HTTP e ignora i header di forwarding, che potrebbero essere manipolati dall'attaccante.
5. **Bruteforcing del `beacon_id`** per inquinare i log con falsi positivi — parzialmente mitigato dall'entropia UUID (hex[:8] = ~4 miliardi di combinazioni); rate limiting è indicato come future work.

---

## 5. Mitigazioni applicate vs future

| Mitigazione | Stato | Implementazione |
|---|---|---|
| IAM Least Privilege | ✅ Applicata | `data/policies/policy-employee.json`, `data/policies/policy-admin.json` |
| Audit trail su S3 | ✅ Applicata | Tutti i log salvati in `cloudtrail_logs/` (S3 locale via LocalStack) |
| Auto-revoca permessi compromessi | ✅ Applicata | `src/radar.py:revoca_permessi_iam` |
| Firma crittografica documenti PDF | ✅ Applicata | `src/pdf_signer.py` + `src/pdf_verifier.py` |
| Notifiche in tempo reale (webhook) | ✅ Applicata | `src/radar.py:invia_webhook` (Discord/Slack) |
| Classificazione IP (Tor/VPN) | ✅ Applicata | `src/threat_intel.py` + file `data/` |
| Behavioral analytics (sliding window) | ✅ Applicata | `src/behavioral.py` + `behavioral_scan.py` |
| Dwell Time come KPI SOC | ✅ Applicata | `src/dwell_time.py` + `dashboard/utils/data.py` |
| Rate limiting | ❌ Future work | (citato come limite) |
| HSM / AWS KMS per chiavi private | ❌ Future work | (citato come limite) |
| Time-stamping firma (RFC 3161) | ❌ Future work | (citato come limite) |
| XML Digital Signatures (DOCX/XLSX) | ❌ Future work | (citato come limite) |
| Nonce nel beacon URL (anti-replay) | ❌ Future work | (citato come limite) |

---

## 6. Conclusione

Il sistema Cloud Active Defense offre una copertura di detection robusta per i profili di minaccia più probabili in contesti aziendali: l'**insider opportunistico** che accede a file riservati o honeydocument viene rilevato tramite il portale di auditing e le regole comportamentali; l'**attaccante esterno post-compromissione** che esfiltra documenti PDF al di fuori del perimetro aziendale viene intercettato dal radar Lambda, con classificazione dell'IP (Tor/VPN), notifica immediata e revoca automatica dei permessi IAM.

I limiti più significativi riguardano gli **attaccanti sofisticati** dotati di tooling avanzato: sandbox isolate, VPN self-hosted non in lista, o analisi offline sono scenari in cui il sistema non produce alcun segnale. Questi limiti non sono difetti di implementazione, ma vincoli architetturali intrinseci ai sistemi di deception basati su beacon di rete. La scelta di documentarli esplicitamente — invece di minimizzarli — è coerente con il principio di onestà accademica e con la metodologia STRIDE: un threat model che non nomina i propri limiti non è un threat model, è marketing.

Le direzioni di miglioramento più impattanti per un deployment produttivo sarebbero la migrazione delle chiavi private su AWS KMS, l'adozione di nonce nel beacon URL per prevenire replay attack, e l'integrazione con API di threat intelligence commerciale per la classificazione degli IP.
