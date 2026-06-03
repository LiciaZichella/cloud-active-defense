import { useState } from 'react'
import './Documenti.css'

const BRAND = { mark: 'AC', name: 'Aurea Capital', fullName: 'Aurea Capital S.p.A.' }

interface Doc {
  id: string
  name: string
  format: 'pdf' | 'docx' | 'xlsx' | 'txt'
  category: string
  classification: 'PUBBLICO' | 'INTERNO' | 'RISERVATO' | 'CONFIDENZIALE'
  kind: 'real' | 'honey' | 'token'
  size: string
  modified: string
  group: 'documenti' | 'risorse_umane' | 'devops'
}

const docs: Doc[] = [
  { id: 'd1', name: 'Bilancio_Riservato_2026.pdf', format: 'pdf', category: 'Bilancio', classification: 'CONFIDENZIALE', kind: 'honey', size: '128 KB', modified: '14/05/2026', group: 'documenti' },
  { id: 'd2', name: 'Progetto_Atlas_Specifiche.pdf', format: 'pdf', category: 'Progetto IT', classification: 'RISERVATO', kind: 'real', size: '256 KB', modified: '12/05/2026', group: 'documenti' },
  { id: 'd3', name: 'Contratto_Fornitura_Apex_2026.docx', format: 'docx', category: 'Contratto', classification: 'RISERVATO', kind: 'real', size: '96 KB', modified: '10/05/2026', group: 'documenti' },
  { id: 'd4', name: 'Bilancio_Q1_2026.xlsx', format: 'xlsx', category: 'Bilancio', classification: 'INTERNO', kind: 'real', size: '184 KB', modified: '14/05/2026', group: 'documenti' },
  { id: 'd5', name: 'Manuale_Procedure_Interne.pdf', format: 'pdf', category: 'Procedure', classification: 'INTERNO', kind: 'real', size: '512 KB', modified: '03/03/2026', group: 'documenti' },
  { id: 'd6', name: 'Catalogo_Servizi_2026.pdf', format: 'pdf', category: 'Comunicazione', classification: 'PUBBLICO', kind: 'real', size: '348 KB', modified: '08/02/2026', group: 'documenti' },
  { id: 'h1', name: 'Valutazione_Personale_Q1.docx', format: 'docx', category: 'Valutazioni', classification: 'RISERVATO', kind: 'honey', size: '72 KB', modified: '08/05/2026', group: 'risorse_umane' },
  { id: 'h2', name: 'Stipendi_Dirigenza_HONEY.xlsx', format: 'xlsx', category: 'Stipendi', classification: 'CONFIDENZIALE', kind: 'honey', size: '64 KB', modified: '14/05/2026', group: 'risorse_umane' },
  { id: 'h3', name: 'Regolamento_aziendale_v3.pdf', format: 'pdf', category: 'Regolamenti', classification: 'INTERNO', kind: 'real', size: '224 KB', modified: '15/01/2026', group: 'risorse_umane' },
  { id: 'h4', name: 'Calendario_ferie_2026.xlsx', format: 'xlsx', category: 'Ferie', classification: 'INTERNO', kind: 'real', size: '32 KB', modified: '02/01/2026', group: 'risorse_umane' },
  { id: 't1', name: 'aws_credentials.txt', format: 'txt', category: 'Credenziali AWS', classification: 'CONFIDENZIALE', kind: 'token', size: '4 KB', modified: '01/05/2026', group: 'devops' },
  { id: 't2', name: '.env.production', format: 'txt', category: 'Config produzione', classification: 'CONFIDENZIALE', kind: 'token', size: '6 KB', modified: '01/05/2026', group: 'devops' },
  { id: 't3', name: 'devops_secrets.yaml', format: 'txt', category: 'Vault & K8s', classification: 'CONFIDENZIALE', kind: 'token', size: '5 KB', modified: '03/05/2026', group: 'devops' },
  { id: 't4', name: 'id_rsa_backup', format: 'txt', category: 'SSH key', classification: 'CONFIDENZIALE', kind: 'token', size: '3 KB', modified: '03/05/2026', group: 'devops' },
]

const groups = [
  { id: 'documenti' as const, label: 'Documenti aziendali', desc: 'PDF / DOCX / XLSX · uso interno e riservato' },
  { id: 'risorse_umane' as const, label: 'Risorse Umane', desc: 'Valutazioni · regolamenti · ferie' },
  { id: 'devops' as const, label: 'Honeytoken DevOps', desc: 'Credenziali esca · secrets · chiavi SSH' },
]

const DownloadIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

function Documenti() {
  const [selected, setSelected] = useState('d1')
  const [toast, setToast] = useState<string | null>(null)
  const doc = docs.find(d => d.id === selected)!

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }

  return (
    <div className="catalog-app">
      <aside className="catalog-sidebar">
        <div className="catalog-brand">
          <div className="catalog-brand-mark">{BRAND.mark}</div>
          <div>
            <div className="catalog-brand-name">{BRAND.name}</div>
            <div className="catalog-brand-sub">Catalogo Documenti</div>
          </div>
        </div>

        <div className="catalog-intro">
          <InfoIcon />
          <div>Vista di riferimento dei file generati dal modulo <code>generator.py</code>. Ogni documento mostra il layout finale del download nel sistema reale.</div>
        </div>

        {groups.map(g => (
          <div key={g.id} className="catalog-group">
            <div className="catalog-group-h">
              <div className="catalog-group-label">{g.label}</div>
              <div className="catalog-group-desc">{g.desc}</div>
            </div>
            {docs.filter(d => d.group === g.id).map(d => (
              <div key={d.id} className={`catalog-item ${selected === d.id ? 'active' : ''}`} onClick={() => setSelected(d.id)}>
                <FmtBadge format={d.format} />
                <div className="catalog-item-info">
                  <div className="catalog-item-name mono">{d.name}</div>
                  <div className="catalog-item-meta">
                    <ClassBadge value={d.classification} />
                    <span>{d.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </aside>

      <main className="catalog-main">
        <header className="catalog-header">
          <div className="catalog-header-left">
            <FmtBadge format={doc.format} large />
            <div>
              <div className="catalog-header-name mono">{doc.name}</div>
              <div className="catalog-header-meta">
                <ClassBadge value={doc.classification} />
                <span>{doc.category}</span>
                <span>·</span>
                <span>{doc.size}</span>
                <span>·</span>
                <span>Modificato {doc.modified}</span>
                {doc.kind === 'honey' && <span className="catalog-kind-pill honey">HONEYFILE</span>}
                {doc.kind === 'token' && <span className="catalog-kind-pill token">HONEYTOKEN</span>}
              </div>
            </div>
          </div>
          <button className="catalog-download-btn" onClick={() => showToast(`File "${doc.name}" scaricato (demo)`)}>
            <DownloadIcon />Scarica file
          </button>
        </header>

        <div className="catalog-stage">
          <DocumentRouter doc={doc} />
        </div>
      </main>

      {toast && <div className="catalog-toast">{toast}</div>}
    </div>
  )
}

function FmtBadge({ format, large }: { format: string; large?: boolean }) {
  return <div className={`fmt-badge ${format} ${large ? 'lg' : ''}`}>{format.toUpperCase()}</div>
}

function ClassBadge({ value }: { value: string }) {
  const map: Record<string, string> = { PUBBLICO: 'pub', INTERNO: 'int', RISERVATO: 'ris', CONFIDENZIALE: 'conf' }
  return <span className={`cl-badge cl-${map[value]}`}>{value}</span>
}

function DocumentRouter({ doc }: { doc: Doc }) {
  switch (doc.id) {
    case 'd1': return <DocBilancioRiservato />
    case 'd2': return <DocProgettoAtlas />
    case 'd3': return <DocContrattoApex />
    case 'd4': return <DocBilancioQ1 />
    case 'd5': return <DocManualeProcedure />
    case 'd6': return <DocCatalogoServizi />
    case 'h1': return <DocValutazionePersonale />
    case 'h2': return <DocStipendiDirigenza />
    case 'h3': return <DocRegolamento />
    case 'h4': return <DocCalendarioFerie />
    case 't1': case 't2': case 't3': case 't4': return <DocPreviewTxt id={doc.id} name={doc.name} size={doc.size} />
  }
  return null
}

// ============ d1 — Bilancio Riservato (PDF, 2 pagine) ============
function DocBilancioRiservato() {
  return (
    <>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">RISERVATO</div>
        <div className="doc-bank-header">
          <div className="doc-bank-logo">
            <div className="doc-bank-mark">{BRAND.mark}</div>
            <div>
              <div className="doc-bank-name">{BRAND.fullName.toUpperCase()}</div>
              <div className="doc-bank-sub">Sede Legale: Via del Corso 412, 00186 Roma · C.F./P.IVA: 12345670019</div>
            </div>
          </div>
          <div className="doc-bank-class">RISERVATO · LIVELLO 3</div>
        </div>
        <h1 className="doc-title-l">Bilancio Trimestrale Riservato</h1>
        <div className="doc-subtitle">Quarto trimestre 2025 · Documento per uso esclusivo della Direzione Generale</div>
        <div className="doc-h2">1. Sintesi finanziaria</div>
        <div className="doc-p">Nel quarto trimestre 2025 {BRAND.name} ha registrato risultati significativamente superiori alle previsioni di budget, con un margine operativo lordo in crescita del <strong>+12.4%</strong> rispetto al trimestre precedente. Le politiche di contenimento del rischio adottate dal CdA hanno consentito di mantenere il rapporto NPL sotto la soglia del 3.8%, in miglioramento rispetto al 4.1% del Q3.</div>
        <div className="doc-h2">2. Conto economico (in € mila)</div>
        <table className="doc-table">
          <thead><tr><th>Voce</th><th>Q4 2025</th><th>Q3 2025</th><th>Δ %</th></tr></thead>
          <tbody>
            <tr><td>Margine d'interesse</td><td className="num">187.420</td><td className="num">172.890</td><td className="num pos">+8.4%</td></tr>
            <tr><td>Commissioni nette</td><td className="num">94.250</td><td className="num">88.140</td><td className="num pos">+6.9%</td></tr>
            <tr><td>Risultato dell'attività di negoziazione</td><td className="num">12.380</td><td className="num">14.220</td><td className="num neg">−12.9%</td></tr>
            <tr><td><strong>Margine d'intermediazione</strong></td><td className="num"><strong>294.050</strong></td><td className="num"><strong>275.250</strong></td><td className="num pos"><strong>+6.8%</strong></td></tr>
            <tr><td>Costi operativi</td><td className="num">−142.870</td><td className="num">−138.450</td><td className="num neg">+3.2%</td></tr>
            <tr><td>Rettifiche su crediti</td><td className="num">−28.420</td><td className="num">−32.180</td><td className="num pos">−11.7%</td></tr>
            <tr><td><strong>Utile lordo</strong></td><td className="num"><strong>122.760</strong></td><td className="num"><strong>104.620</strong></td><td className="num pos"><strong>+17.3%</strong></td></tr>
            <tr><td>Imposte sul reddito</td><td className="num">−38.060</td><td className="num">−32.430</td><td className="num neg">+17.4%</td></tr>
            <tr className="doc-table-total"><td><strong>Utile netto del periodo</strong></td><td className="num"><strong>84.700</strong></td><td className="num"><strong>72.190</strong></td><td className="num pos"><strong>+17.3%</strong></td></tr>
          </tbody>
        </table>
        <div className="doc-h2">3. Indicatori di rischio</div>
        <div className="doc-mini-stats">
          <div className="doc-mini-stat"><span>NPL ratio</span><strong>3.8%</strong></div>
          <div className="doc-mini-stat"><span>CET1 ratio</span><strong>14.2%</strong></div>
          <div className="doc-mini-stat"><span>ROE</span><strong>9.1%</strong></div>
          <div className="doc-mini-stat"><span>Cost/Income</span><strong>48.6%</strong></div>
        </div>
        <div className="pdf-page-footer doc-footer"><span>Pagina 1 di 2 · Bilancio Q4 2025 · RISERVATO</span><span>{BRAND.fullName} · ad uso esclusivo Direzione Generale</span></div>
      </div>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">RISERVATO</div>
        <div className="doc-h2">4. Note esplicative</div>
        <div className="doc-p">Il margine d'interesse beneficia della crescita degli impieghi a clientela retail (+5.2%) e del miglioramento del mark-up. Le commissioni nette mostrano un trend positivo grazie all'incremento dei servizi di consulenza patrimoniale.</div>
        <div className="doc-p">Il risultato dell'attività di negoziazione subisce un fisiologico arretramento per effetto della normalizzazione dei tassi di mercato. Le rettifiche su crediti sono in calo grazie alle nuove politiche di scoring adottate nel Q2 2025.</div>
        <div className="doc-h2">5. Operazioni straordinarie del periodo</div>
        <ul className="doc-list">
          <li>Acquisizione del 15% di Banca Regionale Sud (closing 15/11/2025) — investimento € 42.5M</li>
          <li>Apertura nuova sede di rappresentanza a Francoforte (operativa da 01/12/2025)</li>
          <li>Cessione partecipazione minoritaria in Tech Insurance Italia (plusvalenza € 8.2M)</li>
          <li>Operazione di covered bond emessa il 28/10/2025 — nominale € 500M, rating Moody's Aa3</li>
        </ul>
        <div className="doc-h2">6. Prospettive Q1 2026</div>
        <div className="doc-p">La Direzione conferma le previsioni di crescita per il primo trimestre 2026. Si prevede un margine d'intermediazione in linea con il Q4 2025, con possibili upside derivanti dall'effetto a regime delle acquisizioni recenti.</div>
        <div className="doc-h2">7. Approvazioni</div>
        <div className="doc-sig-box">
          <div className="doc-sig-col"><div className="doc-sig-line"></div><div className="doc-sig-name">Dott. Antonio Pacillo</div><div className="doc-sig-role">Amministratore Delegato</div></div>
          <div className="doc-sig-col"><div className="doc-sig-line"></div><div className="doc-sig-name">Dott.ssa Maria Conti</div><div className="doc-sig-role">CFO</div></div>
          <div className="doc-sig-col"><div className="doc-sig-line"></div><div className="doc-sig-name">Dott. Luca Bianchi</div><div className="doc-sig-role">Presidente CdA</div></div>
        </div>
        <div className="doc-disclaimer">Il presente documento contiene informazioni riservate. La diffusione non autorizzata costituisce violazione del Regolamento Interno {BRAND.mark} art. 14 e del D.Lgs. 196/2003 sul trattamento dei dati personali. Classificazione: <strong>RISERVATO LIVELLO 3</strong>.</div>
        <div className="pdf-page-footer doc-footer"><span>Pagina 2 di 2 · Bilancio Q4 2025 · RISERVATO</span><span>Documento approvato dal CdA il 18/01/2026</span></div>
      </div>
    </>
  )
}

// ============ d2 — Progetto Atlas (PDF, 2 pagine) ============
function DocProgettoAtlas() {
  return (
    <>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">CONFIDENZIALE</div>
        <div className="doc-tech-header">
          <div className="doc-tech-meta"><div className="doc-tech-code">PRJ-ATLAS-2026-001</div><div className="doc-tech-status">v 2.3 · Bozza tecnica</div></div>
          <div className="doc-tech-class">CONFIDENZIALE</div>
        </div>
        <h1 className="doc-title-l">Progetto Atlas — Specifiche tecniche</h1>
        <div className="doc-subtitle">Migrazione del sistema core banking su architettura cloud-native ibrida</div>
        <div className="doc-h2">1. Executive summary</div>
        <div className="doc-p">Il Progetto Atlas costituisce la roadmap di trasformazione tecnologica triennale di {BRAND.name}. L'obiettivo strategico è migrare l'attuale sistema core banking on-premise verso un'architettura ibrida cloud (AWS EU-West-1 + datacenter Milano), riducendo il TCO del 28% e dimezzando i tempi di recovery in caso di disastro.</div>
        <div className="doc-h2">2. Architettura proposta</div>
        <div className="doc-arch">
          <div className="doc-arch-row"><div className="doc-arch-box edge">Edge Layer</div><div className="doc-arch-desc">CloudFront + WAF · Latenza target &lt; 50ms</div></div>
          <div className="doc-arch-row"><div className="doc-arch-box api">API Gateway</div><div className="doc-arch-desc">Kong Enterprise · Rate limiting + OAuth2/OIDC</div></div>
          <div className="doc-arch-row"><div className="doc-arch-box svc">Microservizi</div><div className="doc-arch-desc">EKS Kubernetes · 32 servizi · Java 21 + Python 3.12</div></div>
          <div className="doc-arch-row"><div className="doc-arch-box db">Persistenza</div><div className="doc-arch-desc">Aurora PostgreSQL Multi-AZ + ElastiCache Redis</div></div>
          <div className="doc-arch-row"><div className="doc-arch-box mq">Eventi</div><div className="doc-arch-desc">MSK Kafka 3.6 · 12 topic · retention 7gg</div></div>
        </div>
        <div className="doc-h2">3. Requisiti non funzionali</div>
        <table className="doc-table">
          <thead><tr><th>KPI</th><th>Target</th><th>Soglia critica</th></tr></thead>
          <tbody>
            <tr><td>Disponibilità del servizio</td><td className="num">99.95%</td><td className="num">99.5%</td></tr>
            <tr><td>RTO (Recovery Time Objective)</td><td className="num">15 min</td><td className="num">2h</td></tr>
            <tr><td>RPO (Recovery Point Objective)</td><td className="num">1 min</td><td className="num">15 min</td></tr>
            <tr><td>Throughput transazioni / sec</td><td className="num">5.000</td><td className="num">1.500</td></tr>
            <tr><td>Latenza P95 API call</td><td className="num">200 ms</td><td className="num">800 ms</td></tr>
          </tbody>
        </table>
        <div className="pdf-page-footer doc-footer"><span>Pagina 1 di 2 · PRJ-ATLAS-2026-001</span><span>{BRAND.fullName} · CONFIDENZIALE</span></div>
      </div>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">CONFIDENZIALE</div>
        <div className="doc-h2">4. Roadmap di implementazione</div>
        <div className="doc-timeline-h">
          <div className="doc-tl-item"><div className="doc-tl-q">Q1<br/>2026</div><div><strong>Fase Foundation</strong><br/><span className="doc-tl-detail">Setup ambienti AWS, IAM, networking. Definizione standard sicurezza.</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q2<br/>2026</div><div><strong>Fase Discovery</strong><br/><span className="doc-tl-detail">Inventario sistemi as-is. Mappatura dipendenze. Pilot di migrazione.</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q3<br/>2026</div><div><strong>Fase Migration</strong><br/><span className="doc-tl-detail">Migrazione progressiva dei microservizi non-core.</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q4<br/>2026</div><div><strong>Fase Cutover core</strong><br/><span className="doc-tl-detail">Migrazione del core banking. Run parallelo con sistema legacy per 90 giorni.</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q1<br/>2027</div><div><strong>Fase Decommissioning</strong><br/><span className="doc-tl-detail">Spegnimento sistema legacy. Audit finale di conformità NIS2 e DORA.</span></div></div>
        </div>
        <div className="doc-h2">5. Budget e risorse</div>
        <table className="doc-table">
          <thead><tr><th>Voce di spesa</th><th>Anno 1</th><th>Anno 2</th><th>Anno 3</th></tr></thead>
          <tbody>
            <tr><td>Licenze software AWS + Kong + Aurora</td><td className="num">€ 1.250.000</td><td className="num">€ 1.420.000</td><td className="num">€ 1.580.000</td></tr>
            <tr><td>Consulenza esterna (system integrator)</td><td className="num">€ 850.000</td><td className="num">€ 620.000</td><td className="num">€ 280.000</td></tr>
            <tr><td>Personale interno (12 FTE dedicati)</td><td className="num">€ 980.000</td><td className="num">€ 1.020.000</td><td className="num">€ 1.060.000</td></tr>
            <tr><td>Training e certificazioni</td><td className="num">€ 120.000</td><td className="num">€ 80.000</td><td className="num">€ 40.000</td></tr>
            <tr className="doc-table-total"><td><strong>Totale annuo</strong></td><td className="num"><strong>€ 3.200.000</strong></td><td className="num"><strong>€ 3.140.000</strong></td><td className="num"><strong>€ 2.960.000</strong></td></tr>
          </tbody>
        </table>
        <div className="doc-h2">6. Rischi identificati</div>
        <ul className="doc-list">
          <li><strong>Tecnologici</strong>: vendor lock-in AWS. Mitigazione: design multi-cloud-compatible.</li>
          <li><strong>Regolatori</strong>: conformità NIS2 e DORA. Mitigazione: audit conformità in fase Foundation.</li>
          <li><strong>Operativi</strong>: turnover personale tecnico. Mitigazione: piano formazione + retention bonus.</li>
          <li><strong>Sicurezza</strong>: superficie d'attacco estesa. Mitigazione: Cloud Active Defense.</li>
        </ul>
        <div className="doc-sig-box">
          <div className="doc-sig-col"><div className="doc-sig-line"></div><div className="doc-sig-name">Dott. Massimo Pacillo</div><div className="doc-sig-role">CIO · Project Sponsor</div></div>
          <div className="doc-sig-col"><div className="doc-sig-line"></div><div className="doc-sig-name">Dott.ssa Sara Romano</div><div className="doc-sig-role">Architect Lead</div></div>
        </div>
        <div className="pdf-page-footer doc-footer"><span>Pagina 2 di 2 · PRJ-ATLAS-2026-001</span><span>Approvato dal Comitato Strategico il 12/05/2026</span></div>
      </div>
    </>
  )
}

// ============ d3 — Contratto Apex (DOCX, 2 pagine) ============
function DocContrattoApex() {
  return (
    <>
      <div className="pdf-page doc-docx">
        <div className="docx-ribbon"><div className="docx-ribbon-app">Microsoft Word — Contratto_Fornitura_Apex_2026.docx</div></div>
        <div className="docx-content">
          <h1 className="docx-title">CONTRATTO DI FORNITURA DI SERVIZI</h1>
          <div className="docx-subtitle">Rif. CTR-APX-2026-04217 · stipulato in data 10 maggio 2026</div>
          <div className="docx-section">
            <div className="docx-h">TRA</div>
            <p><strong>{BRAND.fullName.toUpperCase()}</strong>, con sede legale in Roma, Via del Corso 412 — 00186, P. IVA 12345670019, in persona del legale rappresentante <em>pro tempore</em> Dott. Antonio Pacillo, di seguito denominata "<strong>{BRAND.mark}</strong>" o "<strong>Committente</strong>",</p>
            <div className="docx-h">E</div>
            <p><strong>APEX SOLUTIONS S.r.l.</strong>, con sede legale in Milano, Via della Spiga 32 — 20121, P. IVA 09876543210, in persona del legale rappresentante <em>pro tempore</em> Ing. Roberto Apicella, di seguito denominata "<strong>APEX</strong>" o "<strong>Fornitore</strong>",</p>
            <p style={{textAlign:'center',fontStyle:'italic',marginTop:14}}>congiuntamente le "Parti"</p>
          </div>
          <div className="docx-section">
            <div className="docx-h">PREMESSO CHE</div>
            <ul className="docx-bullets">
              <li>{BRAND.mark} intende avvalersi di servizi specialistici di system integration per il proprio Progetto Atlas (Rif. PRJ-ATLAS-2026-001);</li>
              <li>APEX dichiara di possedere le competenze e le certificazioni richieste (AWS Premier Partner, ISO 27001, ISO 9001);</li>
              <li>Le Parti hanno definito termini e condizioni della fornitura come da art. seguenti.</li>
            </ul>
          </div>
          <div className="docx-section"><div className="docx-art">Articolo 1 — Oggetto del contratto</div><p>Il Fornitore si impegna a erogare al Committente servizi professionali di consulenza, sviluppo e integrazione di sistemi informatici, secondo le specifiche tecniche di cui all'<em>Allegato A</em>, per un periodo di 36 (trentasei) mesi a decorrere dal 1° giugno 2026.</p></div>
          <div className="docx-section"><div className="docx-art">Articolo 2 — Corrispettivo</div><p>Il corrispettivo per la fornitura è stabilito in € 2.450.000 (duemilioniquattrocentocinquantamila/00), oltre IVA, da corrispondersi in 12 rate trimestrali anticipate di € 204.167 ciascuna.</p></div>
          <div className="docx-section">
            <div className="docx-art">Articolo 3 — Livelli di servizio (SLA)</div>
            <table className="docx-table">
              <thead><tr><th>Indicatore</th><th>Soglia</th><th>Penale</th></tr></thead>
              <tbody><tr><td>Tempo di risposta intervento P1</td><td>1 ora</td><td>2% canone mensile</td></tr><tr><td>Tempo di risposta P2</td><td>4 ore</td><td>1% canone mensile</td></tr><tr><td>Disponibilità servizi gestiti</td><td>99.9%</td><td>5% canone mensile</td></tr></tbody>
            </table>
          </div>
          <div className="pdf-page-footer doc-footer"><span>Pagina 1 di 2 · CTR-APX-2026-04217</span><span>{BRAND.fullName} — APEX SOLUTIONS S.r.l.</span></div>
        </div>
      </div>
      <div className="pdf-page doc-docx">
        <div className="docx-ribbon"><div className="docx-ribbon-app">Microsoft Word — Contratto_Fornitura_Apex_2026.docx</div></div>
        <div className="docx-content">
          <div className="docx-section"><div className="docx-art">Articolo 4 — Riservatezza e protezione dei dati</div><p>Le Parti si obbligano reciprocamente alla più stretta riservatezza. L'obbligo permane anche dopo la cessazione del contratto per un periodo non inferiore a 5 anni. Si applicano altresì le disposizioni del GDPR (Reg. UE 2016/679) e del D.Lgs. 196/2003.</p></div>
          <div className="docx-section"><div className="docx-art">Articolo 5 — Sicurezza informatica e Direttiva NIS2</div><p>Il Fornitore dichiara di adottare misure tecniche e organizzative conformi alla Direttiva (UE) 2022/2555 (NIS2) e al D.Lgs. 138/2024.</p></div>
          <div className="docx-section"><div className="docx-art">Articolo 6 — Recesso e risoluzione</div><p>Il Committente potrà recedere unilateralmente con preavviso di 90 giorni in qualsiasi momento.</p></div>
          <div className="docx-section"><div className="docx-art">Articolo 7 — Foro competente</div><p>Per qualsiasi controversia è competente in via esclusiva il Foro di Roma.</p></div>
          <div className="docx-section"><p>Letto, confermato e sottoscritto in Roma, in data <strong>10 maggio 2026</strong>.</p></div>
          <div className="docx-sig">
            <div className="docx-sig-col"><div className="docx-sig-label">Per {BRAND.fullName}</div><div className="docx-sig-stamp"><div className="docx-sig-line"></div><div className="docx-sig-name">Dott. Antonio Pacillo</div><div className="docx-sig-role">Amministratore Delegato</div><div className="docx-stamp">{BRAND.mark}<br/>TIMBRO</div></div></div>
            <div className="docx-sig-col"><div className="docx-sig-label">Per APEX Solutions S.r.l.</div><div className="docx-sig-stamp"><div className="docx-sig-line"></div><div className="docx-sig-name">Ing. Roberto Apicella</div><div className="docx-sig-role">Legale rappresentante</div><div className="docx-stamp apex">APEX<br/>S.r.l.</div></div></div>
          </div>
          <div className="pdf-page-footer doc-footer"><span>Pagina 2 di 2 · CTR-APX-2026-04217</span><span>Sottoscritto digitalmente ai sensi del DPR 445/2000</span></div>
        </div>
      </div>
    </>
  )
}

// ============ d4 — Bilancio Q1 (XLSX) ============
function DocBilancioQ1() {
  return (
    <div className="xlsx-page">
      <div className="xlsx-ribbon">
        <div className="xlsx-ribbon-app">Microsoft Excel — Bilancio_Q1_2026.xlsx</div>
        <div className="xlsx-ribbon-tabs">
          <span className="xlsx-tab active">Conto Economico</span>
          <span className="xlsx-tab">Stato Patrimoniale</span>
          <span className="xlsx-tab">Cash Flow</span>
          <span className="xlsx-tab">Note</span>
        </div>
      </div>
      <div className="xlsx-formula-bar">
        <div className="xlsx-cell-ref">B16</div>
        <div className="xlsx-cell-eq">=</div>
        <div className="xlsx-cell-formula mono">=SOMMA(B5:B15)</div>
      </div>
      <div className="xlsx-sheet">
        <table className="xlsx-table">
          <thead><tr><th className="xlsx-col-h"></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr></thead>
          <tbody>
            <tr><td className="xlsx-row-h">1</td><td colSpan={5} className="xlsx-title-cell"><strong>{BRAND.fullName.toUpperCase()} — Bilancio Q1 2026 (in € migliaia)</strong></td></tr>
            <tr><td className="xlsx-row-h">2</td><td colSpan={5} className="xlsx-subtitle-cell">Conto Economico · gennaio – marzo 2026</td></tr>
            <tr><td className="xlsx-row-h">3</td><td className="xlsx-header-cell"><strong>Voce</strong></td><td className="xlsx-header-cell"><strong>Q1 2026</strong></td><td className="xlsx-header-cell"><strong>Q4 2025</strong></td><td className="xlsx-header-cell"><strong>Δ assoluto</strong></td><td className="xlsx-header-cell"><strong>Δ %</strong></td></tr>
            <tr><td className="xlsx-row-h">4</td><td colSpan={5} className="xlsx-section-cell">RICAVI</td></tr>
            <tr><td className="xlsx-row-h">5</td><td>Interessi attivi</td><td className="num">192.450</td><td className="num">187.420</td><td className="num pos">+5.030</td><td className="num pos">+2.7%</td></tr>
            <tr><td className="xlsx-row-h">6</td><td>Commissioni attive</td><td className="num">98.720</td><td className="num">94.250</td><td className="num pos">+4.470</td><td className="num pos">+4.7%</td></tr>
            <tr><td className="xlsx-row-h">7</td><td>Trading</td><td className="num">14.890</td><td className="num">12.380</td><td className="num pos">+2.510</td><td className="num pos">+20.3%</td></tr>
            <tr><td className="xlsx-row-h">8</td><td>Altri ricavi operativi</td><td className="num">6.420</td><td className="num">5.870</td><td className="num pos">+550</td><td className="num pos">+9.4%</td></tr>
            <tr><td className="xlsx-row-h">9</td><td colSpan={5} className="xlsx-section-cell">COSTI</td></tr>
            <tr><td className="xlsx-row-h">10</td><td>Interessi passivi</td><td className="num">−42.180</td><td className="num">−40.120</td><td className="num neg">−2.060</td><td className="num neg">+5.1%</td></tr>
            <tr><td className="xlsx-row-h">11</td><td>Personale</td><td className="num">−72.340</td><td className="num">−70.890</td><td className="num neg">−1.450</td><td className="num neg">+2.0%</td></tr>
            <tr><td className="xlsx-row-h">12</td><td>Spese amministrative</td><td className="num">−48.920</td><td className="num">−47.580</td><td className="num neg">−1.340</td><td className="num neg">+2.8%</td></tr>
            <tr><td className="xlsx-row-h">13</td><td>Ammortamenti</td><td className="num">−12.450</td><td className="num">−12.380</td><td className="num neg">−70</td><td className="num neg">+0.6%</td></tr>
            <tr><td className="xlsx-row-h">14</td><td>Rettifiche su crediti</td><td className="num">−24.580</td><td className="num">−28.420</td><td className="num pos">+3.840</td><td className="num pos">−13.5%</td></tr>
            <tr><td className="xlsx-row-h">15</td><td>Imposte</td><td className="num">−34.520</td><td className="num">−38.060</td><td className="num pos">+3.540</td><td className="num pos">−9.3%</td></tr>
            <tr className="xlsx-total-row"><td className="xlsx-row-h">16</td><td><strong>UTILE NETTO</strong></td><td className="num"><strong>77.490</strong></td><td className="num"><strong>62.470</strong></td><td className="num pos"><strong>+15.020</strong></td><td className="num pos"><strong>+24.0%</strong></td></tr>
            <tr><td className="xlsx-row-h">17</td><td colSpan={5}></td></tr>
            <tr><td className="xlsx-row-h">18</td><td colSpan={5} className="xlsx-section-cell">INDICATORI</td></tr>
            <tr><td className="xlsx-row-h">19</td><td>CET1 ratio</td><td className="num">14.5%</td><td className="num">14.2%</td><td className="num pos">+0.3 pp</td><td></td></tr>
            <tr><td className="xlsx-row-h">20</td><td>NPL ratio</td><td className="num">3.6%</td><td className="num">3.8%</td><td className="num pos">−0.2 pp</td><td></td></tr>
            <tr><td className="xlsx-row-h">21</td><td>Cost/Income</td><td className="num">47.2%</td><td className="num">48.6%</td><td className="num pos">−1.4 pp</td><td></td></tr>
            <tr><td className="xlsx-row-h">22</td><td>ROE annualizzato</td><td className="num">9.8%</td><td className="num">9.1%</td><td className="num pos">+0.7 pp</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <div className="xlsx-status-bar"><span>Pronto</span><span>Foglio 1 di 4</span><span>Somma colonna B: 156.420</span></div>
    </div>
  )
}

// ============ d5 — Manuale Procedure (PDF, 1 pagina) ============
function DocManualeProcedure() {
  return (
    <div className="pdf-page doc-pdf">
      <div className="doc-bank-header">
        <div className="doc-bank-logo">
          <div className="doc-bank-mark">{BRAND.mark}</div>
          <div><div className="doc-bank-name">{BRAND.fullName.toUpperCase()}</div><div className="doc-bank-sub">Compliance Office · Manuale operativo</div></div>
        </div>
        <div className="doc-bank-class" style={{ background: '#1d4ed8' }}>INTERNO</div>
      </div>
      <h1 className="doc-title-l">Manuale delle Procedure Interne</h1>
      <div className="doc-subtitle">Revisione 4.2 · in vigore dal 01/03/2026</div>
      <div className="doc-h2">Indice generale</div>
      <table className="doc-table">
        <thead><tr><th>Capitolo</th><th>Sezione</th><th>Rev.</th></tr></thead>
        <tbody>
          <tr><td>Cap. 1 — Governance e ruoli</td><td>1.1 - 1.5</td><td className="num">4.0</td></tr>
          <tr><td>Cap. 2 — Onboarding clientela</td><td>2.1 - 2.8</td><td className="num">4.2</td></tr>
          <tr><td>Cap. 3 — Antiriciclaggio (AML)</td><td>3.1 - 3.6</td><td className="num">4.1</td></tr>
          <tr><td>Cap. 4 — Gestione del rischio operativo</td><td>4.1 - 4.4</td><td className="num">4.0</td></tr>
          <tr><td>Cap. 5 — Sicurezza informatica (NIS2)</td><td>5.1 - 5.7</td><td className="num">4.2</td></tr>
          <tr><td>Cap. 6 — Privacy e GDPR</td><td>6.1 - 6.5</td><td className="num">4.1</td></tr>
          <tr><td>Cap. 7 — Reclami e contenzioso</td><td>7.1 - 7.3</td><td className="num">3.9</td></tr>
          <tr><td>Cap. 8 — Audit interno</td><td>8.1 - 8.4</td><td className="num">4.0</td></tr>
        </tbody>
      </table>
      <div className="doc-h2">Capitolo 5 — Sicurezza informatica (estratto)</div>
      <div className="doc-p"><strong>5.1 Princìpi generali.</strong> Il sistema informativo di {BRAND.name} è classificato come infrastruttura critica ai sensi del D.Lgs. 138/2024 (NIS2). Tutti i dipendenti sono tenuti al rispetto delle policy in vigore e alla segnalazione tempestiva di anomalie.</div>
      <div className="doc-p"><strong>5.2 Classificazione dei dati.</strong> I documenti aziendali sono classificati in 4 livelli (Pubblico, Interno, Riservato, Confidenziale) secondo la matrice di sensibilità. La diffusione non autorizzata costituisce violazione disciplinare.</div>
      <div className="doc-p"><strong>5.3 Accesso ai sistemi.</strong> L'accesso ai sistemi informativi avviene tramite credenziali nominative protette da MFA. È vietato condividere credenziali con colleghi o soggetti esterni.</div>
      <div className="pdf-page-footer doc-footer"><span>Manuale Procedure Interne v4.2 · INTERNO</span><span>Approvato dal CdA il 18/02/2026</span></div>
    </div>
  )
}

// ============ d6 — Catalogo Servizi (PDF, 1 pagina) ============
function DocCatalogoServizi() {
  return (
    <div className="pdf-page doc-pdf">
      <div className="doc-bank-header" style={{ background: 'linear-gradient(135deg, #047857, #065f46)' }}>
        <div className="doc-bank-logo">
          <div className="doc-bank-mark" style={{ color: '#047857' }}>{BRAND.mark}</div>
          <div><div className="doc-bank-name">{BRAND.fullName.toUpperCase()}</div><div className="doc-bank-sub">Catalogo Servizi 2026 · Direzione Marketing</div></div>
        </div>
        <div className="doc-bank-class" style={{ background: '#10b981' }}>PUBBLICO</div>
      </div>
      <h1 className="doc-title-l">Catalogo Servizi 2026</h1>
      <div className="doc-subtitle">La gamma completa dei servizi bancari per privati e imprese</div>
      <div className="doc-h2">Conti correnti</div>
      <table className="doc-table">
        <thead><tr><th>Profilo</th><th>Canone mensile</th><th>Operazioni incluse</th></tr></thead>
        <tbody>
          <tr><td>{BRAND.mark} Smart</td><td className="num">€ 0,00</td><td className="num">illimitate online</td></tr>
          <tr><td>{BRAND.mark} Plus</td><td className="num">€ 4,90</td><td className="num">illimitate + carta gold</td></tr>
          <tr><td>{BRAND.mark} Business</td><td className="num">€ 12,00</td><td className="num">illimitate + POS gratuito</td></tr>
          <tr><td>{BRAND.mark} Premium</td><td className="num">€ 24,00</td><td className="num">consulente dedicato</td></tr>
        </tbody>
      </table>
      <div className="doc-h2">Finanziamenti</div>
      <div className="doc-mini-stats">
        <div className="doc-mini-stat"><span>Mutuo casa</span><strong>TAEG 3.45%</strong></div>
        <div className="doc-mini-stat"><span>Prestito personale</span><strong>TAEG 6.90%</strong></div>
        <div className="doc-mini-stat"><span>Leasing</span><strong>TAEG 4.10%</strong></div>
        <div className="doc-mini-stat"><span>Factoring</span><strong>TAEG 5.80%</strong></div>
      </div>
      <div className="doc-h2">Servizi digitali</div>
      <div className="doc-p">Online banking 24/7, app mobile {BRAND.mark}@home, bonifici istantanei SEPA, gestione carte da remoto, notifiche push transazioni. Tutti i servizi sono inclusi nel canone del conto.</div>
      <div className="doc-h2">Contatti</div>
      <div className="doc-p">Sede centrale: Via del Corso 412, Roma · Tel. 06 1234567 · Numero verde 800.123.456 · info@aureacapital.it · 187 filiali sul territorio nazionale.</div>
      <div className="pdf-page-footer doc-footer"><span>Catalogo Servizi 2026 · PUBBLICO</span><span>{BRAND.fullName} · Direzione Marketing</span></div>
    </div>
  )
}

// ============ h1 — Valutazione Personale (DOCX) ============
function DocValutazionePersonale() {
  return (
    <div className="pdf-page doc-docx">
      <div className="docx-ribbon"><div className="docx-ribbon-app">Microsoft Word — Valutazione_Personale_Q1.docx</div></div>
      <div className="docx-content">
        <div className="hr-header">
          <div><h1 className="hr-title">Scheda di Valutazione delle Prestazioni</h1><div className="hr-subtitle">Periodo: Q1 2026 (gennaio – marzo)</div></div>
          <div className="hr-meta"><div>Rif. <strong>HR-2026-Q1-0418</strong></div><div>Data: 04/04/2026</div><div>Riservato HR</div></div>
        </div>
        <div className="hr-section-title">Dati anagrafici dipendente</div>
        <table className="hr-data-table"><tbody>
          <tr><td>Nome e cognome</td><td><strong>Luigi Verdi</strong></td><td>Matricola</td><td><strong>{BRAND.mark}-04217</strong></td></tr>
          <tr><td>Reparto</td><td>Amministrazione</td><td>Sede</td><td>Centrale · Piano 2</td></tr>
          <tr><td>Ruolo</td><td>Contabile Senior</td><td>Anzianità aziendale</td><td>7 anni</td></tr>
          <tr><td>Responsabile</td><td>Dott.ssa Anna Russo</td><td>RAL lorda</td><td>€ 42.500</td></tr>
        </tbody></table>
        <div className="hr-section-title">Valutazione obiettivi trimestrali</div>
        <table className="hr-eval-table">
          <thead><tr><th>Obiettivo</th><th>Peso</th><th>Risultato</th><th>Score</th></tr></thead>
          <tbody>
            <tr><td>Chiusura bilancio Q4 2025 entro 15/02/2026</td><td>30%</td><td>Completato il 12/02</td><td className="hr-score hr-score-9">9/10</td></tr>
            <tr><td>Riduzione errori riconciliazione 5%</td><td>25%</td><td>Ridotti del 7.2%</td><td className="hr-score hr-score-9">10/10</td></tr>
            <tr><td>Formazione su nuovo software ERP</td><td>20%</td><td>Corso completato</td><td className="hr-score hr-score-7">7/10</td></tr>
            <tr><td>Supporto audit esterno KPMG</td><td>15%</td><td>Documentazione consegnata</td><td className="hr-score hr-score-8">8/10</td></tr>
            <tr><td>Mentoring 2 nuovi colleghi</td><td>10%</td><td>Avviato a febbraio</td><td className="hr-score hr-score-7">7/10</td></tr>
            <tr className="hr-eval-total"><td><strong>Score complessivo</strong></td><td><strong>100%</strong></td><td></td><td className="hr-score hr-score-9"><strong>8.5/10</strong></td></tr>
          </tbody>
        </table>
        <div className="hr-section-title">Commento del valutatore</div>
        <div className="hr-comment">Luigi ha dimostrato continuità di rendimento e affidabilità nel trimestre, con risultati particolarmente notevoli nella chiusura del bilancio. Confermato il livello di competenza Senior; valutare promozione a Lead Contabile entro Q3 2026.</div>
        <div className="hr-signature">
          <div><div className="docx-sig-line"></div><div className="docx-sig-name">Luigi Verdi</div><div className="docx-sig-role">Dipendente · per presa visione</div></div>
          <div><div className="docx-sig-line"></div><div className="docx-sig-name">Dott.ssa Anna Russo</div><div className="docx-sig-role">Responsabile diretto</div></div>
          <div><div className="docx-sig-line"></div><div className="docx-sig-name">Dott.ssa Giulia Ferrari</div><div className="docx-sig-role">HR Manager</div></div>
        </div>
        <div className="pdf-page-footer doc-footer"><span>Scheda HR-2026-Q1-0418 · Riservato HR</span><span>Conservazione 5 anni · art. 13 GDPR</span></div>
      </div>
    </div>
  )
}

// ============ h2 — Stipendi Dirigenza (XLSX, HONEY) ============
function DocStipendiDirigenza() {
  return (
    <div className="xlsx-page">
      <div className="xlsx-ribbon">
        <div className="xlsx-ribbon-app">Microsoft Excel — Stipendi_Dirigenza_HONEY.xlsx <span className="xlsx-restricted">RISERVATO</span></div>
        <div className="xlsx-ribbon-tabs">
          <span className="xlsx-tab active">Compensi 2026</span>
          <span className="xlsx-tab">Bonus annuali</span>
          <span className="xlsx-tab">Benefit</span>
        </div>
      </div>
      <div className="xlsx-formula-bar"><div className="xlsx-cell-ref">F15</div><div className="xlsx-cell-eq">=</div><div className="xlsx-cell-formula mono">=SOMMA(F4:F14)</div></div>
      <div className="xlsx-sheet">
        <table className="xlsx-table">
          <thead><tr><th className="xlsx-col-h"></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr></thead>
          <tbody>
            <tr><td className="xlsx-row-h">1</td><td colSpan={6} className="xlsx-title-cell"><strong>{BRAND.mark} — Compensi Dirigenza · Anno 2026</strong></td></tr>
            <tr><td className="xlsx-row-h">2</td><td colSpan={6} className="xlsx-subtitle-cell">Documento riservato · ad uso esclusivo HR e CdA</td></tr>
            <tr><td className="xlsx-row-h">3</td><td className="xlsx-header-cell">Cognome Nome</td><td className="xlsx-header-cell">Ruolo</td><td className="xlsx-header-cell">RAL lorda</td><td className="xlsx-header-cell">MBO target</td><td className="xlsx-header-cell">Benefit (€/anno)</td><td className="xlsx-header-cell">Totale</td></tr>
            <tr><td className="xlsx-row-h">4</td><td>Pacillo Antonio</td><td>Amministratore Delegato</td><td className="num">680.000</td><td className="num">340.000</td><td className="num">85.000</td><td className="num"><strong>1.105.000</strong></td></tr>
            <tr><td className="xlsx-row-h">5</td><td>Bianchi Luca</td><td>Presidente CdA</td><td className="num">320.000</td><td className="num">120.000</td><td className="num">45.000</td><td className="num"><strong>485.000</strong></td></tr>
            <tr><td className="xlsx-row-h">6</td><td>Conti Maria</td><td>CFO</td><td className="num">410.000</td><td className="num">180.000</td><td className="num">52.000</td><td className="num"><strong>642.000</strong></td></tr>
            <tr><td className="xlsx-row-h">7</td><td>Pacillo Massimo</td><td>CIO</td><td className="num">380.000</td><td className="num">160.000</td><td className="num">48.000</td><td className="num"><strong>588.000</strong></td></tr>
            <tr><td className="xlsx-row-h">8</td><td>Ferrari Giulia</td><td>HR Manager</td><td className="num">240.000</td><td className="num">85.000</td><td className="num">32.000</td><td className="num"><strong>357.000</strong></td></tr>
            <tr><td className="xlsx-row-h">9</td><td>Romano Sara</td><td>Architect Lead</td><td className="num">195.000</td><td className="num">62.000</td><td className="num">28.000</td><td className="num"><strong>285.000</strong></td></tr>
            <tr><td className="xlsx-row-h">10</td><td>Rossi Mario</td><td>Network Senior</td><td className="num">88.000</td><td className="num">22.000</td><td className="num">12.000</td><td className="num"><strong>122.000</strong></td></tr>
            <tr><td className="xlsx-row-h">11</td><td>Verdi Luigi</td><td>Contabile Senior</td><td className="num">42.500</td><td className="num">8.500</td><td className="num">5.000</td><td className="num"><strong>56.000</strong></td></tr>
            <tr><td className="xlsx-row-h">12</td><td>Bianchi Anna</td><td>Marketing Specialist</td><td className="num">38.000</td><td className="num">6.000</td><td className="num">4.500</td><td className="num"><strong>48.500</strong></td></tr>
            <tr className="xlsx-total-row"><td className="xlsx-row-h">13</td><td><strong>TOTALE</strong></td><td></td><td className="num"><strong>2.393.500</strong></td><td className="num"><strong>983.500</strong></td><td className="num"><strong>311.500</strong></td><td className="num"><strong>3.688.500</strong></td></tr>
            <tr><td className="xlsx-row-h">14</td><td colSpan={6}></td></tr>
            <tr><td className="xlsx-row-h">15</td><td>Costo complessivo (con contributi e oneri 38%)</td><td colSpan={4}></td><td className="num"><strong>5.090.130</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div className="xlsx-status-bar"><span>Pronto</span><span>Foglio 1 di 3</span><span>Cellule selezionate: 1</span></div>
    </div>
  )
}

// ============ h3 — Regolamento aziendale (PDF) ============
function DocRegolamento() {
  return (
    <div className="pdf-page doc-pdf">
      <div className="doc-bank-header">
        <div className="doc-bank-logo">
          <div className="doc-bank-mark">{BRAND.mark}</div>
          <div><div className="doc-bank-name">{BRAND.fullName.toUpperCase()}</div><div className="doc-bank-sub">HR Department · Regolamento dei dipendenti</div></div>
        </div>
        <div className="doc-bank-class" style={{ background: '#1d4ed8' }}>INTERNO</div>
      </div>
      <h1 className="doc-title-l">Regolamento Aziendale v3.0</h1>
      <div className="doc-subtitle">Edizione gennaio 2026 · supera e annulla ogni precedente versione</div>
      <div className="doc-h2">Articolo 1 — Orario di lavoro</div>
      <div className="doc-p">L'orario standard è dal lunedì al venerdì, dalle 09:00 alle 18:00, con 1 ora di pausa pranzo. È previsto smart working fino a 8 giorni/mese previa autorizzazione del responsabile diretto.</div>
      <div className="doc-h2">Articolo 2 — Ferie e permessi</div>
      <div className="doc-p">Ogni dipendente matura 26 giorni di ferie l'anno (32 dopo il 5° anno di anzianità). I permessi vanno richiesti tramite portale HR con almeno 5 giorni di preavviso, salvo urgenze. I permessi per visita medica non incidono sul monte ferie.</div>
      <div className="doc-h2">Articolo 3 — Codice di condotta</div>
      <ul className="doc-list">
        <li>Riservatezza assoluta sulle informazioni aziendali (cfr. art. 14)</li>
        <li>Divieto di accesso a dati non pertinenti alle proprie mansioni</li>
        <li>Obbligo di segnalazione di violazioni alla casella whistleblowing@aureacapital.it</li>
        <li>Rispetto del codice etico e delle linee guida anticorruzione (L. 190/2012)</li>
      </ul>
      <div className="doc-h2">Articolo 14 — Riservatezza e diffusione non autorizzata</div>
      <div className="doc-p">La diffusione non autorizzata di documenti classificati <strong>RISERVATO</strong> o <strong>CONFIDENZIALE</strong> costituisce grave inadempimento contrattuale, sanzionato secondo l'art. 2105 c.c. e gli artt. 7 e 8 della Legge 300/1970. Si applicano altresì le disposizioni del D.Lgs. 196/2003 e del Reg. UE 2016/679 (GDPR).</div>
      <div className="doc-h2">Articolo 15 — Sicurezza informatica</div>
      <div className="doc-p">Ogni dipendente è tenuto a custodire le proprie credenziali, non condividerle e segnalare immediatamente eventuali accessi sospetti. Il monitoraggio dei sistemi avviene in conformità alla Direttiva NIS2 (D.Lgs. 138/2024).</div>
      <div className="pdf-page-footer doc-footer"><span>Regolamento Aziendale v3.0 · INTERNO</span><span>Approvato dal CdA il 12/01/2026</span></div>
    </div>
  )
}

// ============ h4 — Calendario ferie (XLSX) ============
function DocCalendarioFerie() {
  const mesi = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC']
  const dipendenti = [
    { nome: 'Verdi Luigi', ferie: [0,0,0,0,5,0,15,0,0,0,0,5] },
    { nome: 'Russo Anna', ferie: [0,0,0,3,0,0,10,10,0,0,0,3] },
    { nome: 'Bianchi Marco', ferie: [3,0,0,0,5,0,15,0,0,0,0,3] },
    { nome: 'Rossi Giulia', ferie: [0,0,4,0,0,5,15,0,0,0,0,0] },
    { nome: 'Romano Sara', ferie: [0,0,0,5,0,0,0,15,5,0,0,0] },
    { nome: 'Conti Maria', ferie: [0,0,0,0,0,0,10,15,0,0,0,5] },
  ]
  return (
    <div className="xlsx-page">
      <div className="xlsx-ribbon">
        <div className="xlsx-ribbon-app">Microsoft Excel — Calendario_ferie_2026.xlsx</div>
        <div className="xlsx-ribbon-tabs">
          <span className="xlsx-tab active">Pianificazione</span>
          <span className="xlsx-tab">Riepilogo</span>
        </div>
      </div>
      <div className="xlsx-formula-bar"><div className="xlsx-cell-ref">A1</div><div className="xlsx-cell-eq">=</div><div className="xlsx-cell-formula mono">Calendario ferie · {BRAND.name} · 2026</div></div>
      <div className="xlsx-sheet">
        <table className="xlsx-table">
          <thead>
            <tr><th className="xlsx-col-h"></th><th>A</th>{mesi.map((m,i) => <th key={i}>{String.fromCharCode(66+i)}</th>)}<th>N</th></tr>
          </thead>
          <tbody>
            <tr><td className="xlsx-row-h">1</td><td colSpan={14} className="xlsx-title-cell"><strong>Pianificazione ferie 2026 — giorni richiesti per mese</strong></td></tr>
            <tr><td className="xlsx-row-h">2</td><td className="xlsx-header-cell">Dipendente</td>{mesi.map((m,i) => <td key={i} className="xlsx-header-cell">{m}</td>)}<td className="xlsx-header-cell">Totale</td></tr>
            {dipendenti.map((d, idx) => {
              const totale = d.ferie.reduce((a,b) => a+b, 0)
              return (
                <tr key={idx}>
                  <td className="xlsx-row-h">{idx+3}</td>
                  <td>{d.nome}</td>
                  {d.ferie.map((g, i) => <td key={i} className={`num ${g > 0 ? 'pos' : ''}`}>{g || ''}</td>)}
                  <td className="num"><strong>{totale}</strong></td>
                </tr>
              )
            })}
            <tr className="xlsx-total-row"><td className="xlsx-row-h">{dipendenti.length+3}</td><td><strong>TOTALE MESE</strong></td>{mesi.map((m,i) => {
              const sum = dipendenti.reduce((a,d) => a + d.ferie[i], 0)
              return <td key={i} className="num"><strong>{sum || ''}</strong></td>
            })}<td className="num"><strong>{dipendenti.reduce((a,d) => a + d.ferie.reduce((x,y) => x+y, 0), 0)}</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div className="xlsx-status-bar"><span>Pronto</span><span>Foglio 1 di 2</span><span>{dipendenti.length} dipendenti</span></div>
    </div>
  )
}

// ============ t1-t4 — Honeytoken TXT ============
function DocPreviewTxt({ id, name, size }: { id: string; name: string; size: string }) {
  const contents: Record<string, { lang: string; text: string }> = {
    't1': { lang: 'aws', text: `[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
region = us-east-1
output = json

# Account: prod-finance-bank-ac
# Last rotated: 2026-04-15
# Owner: devops@aureacapital.it
# Backup credentials — keep secure

[prod-restricted]
aws_access_key_id = AKIAJOSFOXX7EXAMPLE
aws_secret_access_key = bKalrYUtnGFNHL8MDENG/aPxRfiCYBACKUPKEY
region = eu-west-1
mfa_serial = arn:aws:iam::000000000000:mfa/admin

[readonly-audit]
aws_access_key_id = AKIAREADONLYACCESS01
aws_secret_access_key = readonly-secret-for-audit-team-only-x9y8z7
region = eu-central-1` },
    't2': { lang: 'env', text: `# .env.production
# DO NOT COMMIT TO REPOSITORY
# Last updated: 2026-04-22 by devops@aureacapital.it

# Database
DATABASE_URL=postgres://admin:Pr0d_DB_2026!Strong@db-prod-ac.internal:5432/banking_core
DATABASE_POOL_MAX=50
DATABASE_TIMEOUT=30

# Redis cache
REDIS_URL=redis://:Cache_Pr0d_x42y8@redis-prod.internal:6379/0
REDIS_TTL=3600

# Auth & sessions
JWT_SECRET=8f2c6d4e1a9b7c5d3e8f0a2c4b6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d
JWT_EXPIRES_IN=86400
SESSION_SECRET=session_secret_ac_prod_v3_keep_rotating

# Third-party API keys
STRIPE_API_KEY=sk_live_esca_honeytoken_non_reale_2026
STRIPE_WEBHOOK_SECRET=whsec_esca_honeytoken_non_reale
SENDGRID_API_KEY=SG.esca_honeytoken.chiave_non_reale
TWILIO_AUTH_TOKEN=auth_twilio_ac_production_2026_v2

# Internal services
INTERNAL_API_KEY=ac_internal_a8s7d6f5g4h3j2k1l0m9n8b7v6c5x4z3
HSM_PIN=4729-5816-3094-7521` },
    't3': { lang: 'yaml', text: `# devops_secrets.yaml
# Production secrets — Aurea Capital S.p.A.
# Managed by: devops-team
# Last rotation: 2026-04-30

database:
  host: db-prod-ac.internal
  port: 5432
  username: db_admin_prod
  password: pR0d_d4t4b4s3_st70ng_!2026
  ssl_mode: require

vault:
  endpoint: https://vault-prod.aureacapital.local:8200
  token: hvs.esca_honeytoken_non_reale
  approle_id: 5a8b7c6d-3e2f-1a4b-8c9d-5e6f7a8b9c0d
  approle_secret: 4f3e2d1c-9b8a-7c6d-5e4f-3a2b1c0d9e8f

kubernetes:
  cluster: ac-prod-eu-west
  cluster_token: eyJhbGciOiJSUzI1NiIsImtpZCI6IkU0VVZUVjFUVjFTVlpYUjZSV1JGVjFFV1ZGUlhWMU5XVVZSVlRsUlZTRGM2T1RZek1qWXpOVFkwT0RVMU16VTFOakV4TXpReE1qVTFOall6T0RZeE5UWXhNeTAwTW1RM01EZGtNVE0xWlRJM01EYzRZelF6TmpkbU5UbGtOREkz
  namespace: banking-core
  service_account: prod-deployer

api_gateway:
  master_key: ak_prod_8f7c6b5a4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c
  webhook_signing_key: whk_2026_b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9
  rate_limit_token: rlt_prod_8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e

internal_certs:
  ca_root: /etc/ssl/ac-ca-root.pem
  ca_passphrase: "aur34_p4ssphr4s3_pr0d_v8_keep_rotating"` },
    't4': { lang: 'pem', text: `# id_rsa_backup
# Backup SSH key — devops production access
# Owner: devops@aureacapital.it
# Comment: id_rsa - prod-jumphost-backup

----- CHIAVE RSA DI ESEMPIO -- HONEYTOKEN, NON REALE -----
MIIEpA__esca_honeytoken__chiave_fittizia_troncata_per_sicurezza
__nessun_valore_crittografico_reale__esca_DLP_aurea_capital_2026
----- FINE CHIAVE DI ESEMPIO (HONEYTOKEN) -----` },
  }
  const c = contents[id] || { lang: 'txt', text: name }
  return (
    <div className="txt-viewer">
      <div className="txt-viewer-bar">
        <div className="txt-viewer-controls"><span></span><span></span><span></span></div>
        <div className="txt-viewer-title mono">{name}</div>
        <div className="txt-viewer-meta">{c.lang.toUpperCase()} · {size}</div>
      </div>
      <pre className="txt-viewer-body mono"><code>{c.text}</code></pre>
    </div>
  )
}

export default Documenti
