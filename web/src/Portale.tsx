import { useState, useEffect, type JSX } from 'react'
import './Portale.css'

type Sec = 'home' | 'documenti' | 'risorse_umane' | 'devops' | 'comunicazioni' | 'profilo'

const Icon = {
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  folder: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  hr: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  cog: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4z"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21 L16.65 16.65"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>,
  shield: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  close: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
}

const BRAND = { mark: 'AC', name: 'Aurea Capital', fullName: 'Aurea Capital S.p.A.', sub: 'Portale Dipendenti · v.4.2' }

interface FileItem {
  id: string
  name: string
  format: 'pdf' | 'docx' | 'xlsx' | 'txt'
  category: string
  size: string
  modified: string
  classification: 'PUBBLICO' | 'INTERNO' | 'RISERVATO' | 'CONFIDENZIALE'
  kind: 'real' | 'honey' | 'token'
  folder: string
  author: string
  hash: string
}

const files: FileItem[] = [
  { id: 'd1', name: 'Bilancio_Riservato_2026.pdf', format: 'pdf', category: 'Bilancio', size: '128 KB', modified: '14/05/2026', classification: 'CONFIDENZIALE', kind: 'honey', folder: 'documenti', author: 'Dott.ssa Maria Conti · CFO', hash: 'a3f4e2d1b7c8e9f0a1b2c3d4e5f6a7b8' },
  { id: 'd2', name: 'Progetto_Atlas_Specifiche.pdf', format: 'pdf', category: 'Progetto IT', size: '256 KB', modified: '12/05/2026', classification: 'RISERVATO', kind: 'real', folder: 'documenti', author: 'Dott. Massimo Pacillo · CIO', hash: 'b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3' },
  { id: 'd3', name: 'Contratto_Fornitura_Apex_2026.docx', format: 'docx', category: 'Contratto', size: '96 KB', modified: '10/05/2026', classification: 'RISERVATO', kind: 'real', folder: 'documenti', author: 'Ufficio Legale · A. Pacillo', hash: 'c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6' },
  { id: 'd4', name: 'Bilancio_Q1_2026.xlsx', format: 'xlsx', category: 'Bilancio', size: '184 KB', modified: '14/05/2026', classification: 'INTERNO', kind: 'real', folder: 'documenti', author: 'Dott.ssa Maria Conti · CFO', hash: 'd4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9' },
  { id: 'd5', name: 'Manuale_Procedure_Interne.pdf', format: 'pdf', category: 'Procedure', size: '512 KB', modified: '03/03/2026', classification: 'INTERNO', kind: 'real', folder: 'documenti', author: 'Compliance Office', hash: 'e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2' },
  { id: 'd6', name: 'Catalogo_Servizi_2026.pdf', format: 'pdf', category: 'Comunicazione', size: '348 KB', modified: '08/02/2026', classification: 'PUBBLICO', kind: 'real', folder: 'documenti', author: 'Direzione Marketing', hash: 'f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5' },

  { id: 'h1', name: 'Valutazione_Personale_Q1.docx', format: 'docx', category: 'Valutazioni', size: '72 KB', modified: '08/05/2026', classification: 'RISERVATO', kind: 'honey', folder: 'risorse_umane', author: 'Dott.ssa Giulia Ferrari · HR Manager', hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' },
  { id: 'h2', name: 'Stipendi_Dirigenza_HONEY.xlsx', format: 'xlsx', category: 'Stipendi', size: '64 KB', modified: '14/05/2026', classification: 'CONFIDENZIALE', kind: 'honey', folder: 'risorse_umane', author: 'Dott.ssa Giulia Ferrari · HR Manager', hash: '7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a' },
  { id: 'h3', name: 'Regolamento_aziendale_v3.pdf', format: 'pdf', category: 'Regolamenti', size: '224 KB', modified: '15/01/2026', classification: 'INTERNO', kind: 'real', folder: 'risorse_umane', author: 'HR Department', hash: '2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d' },
  { id: 'h4', name: 'Calendario_ferie_2026.xlsx', format: 'xlsx', category: 'Ferie', size: '32 KB', modified: '02/01/2026', classification: 'INTERNO', kind: 'real', folder: 'risorse_umane', author: 'HR Department', hash: '8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f' },

  { id: 't1', name: 'aws_credentials.txt', format: 'txt', category: 'Credenziali AWS', size: '4 KB', modified: '01/05/2026', classification: 'CONFIDENZIALE', kind: 'token', folder: 'devops', author: 'devops@aureacapital.it', hash: 'f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6' },
  { id: 't2', name: '.env.production', format: 'txt', category: 'Config produzione', size: '6 KB', modified: '01/05/2026', classification: 'CONFIDENZIALE', kind: 'token', folder: 'devops', author: 'devops@aureacapital.it', hash: '0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d' },
  { id: 't3', name: 'devops_secrets.yaml', format: 'txt', category: 'Vault & K8s', size: '5 KB', modified: '03/05/2026', classification: 'CONFIDENZIALE', kind: 'token', folder: 'devops', author: 'devops@aureacapital.it', hash: '5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a' },
  { id: 't4', name: 'id_rsa_backup', format: 'txt', category: 'SSH key', size: '3 KB', modified: '03/05/2026', classification: 'CONFIDENZIALE', kind: 'token', folder: 'devops', author: 'devops@aureacapital.it', hash: '9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c' },
]

const announcements = [
  { date: '14/05', tag: 'IT', tagTone: 'info' as const, title: 'Manutenzione programmata server', body: 'Sabato 17/05 dalle 22:00 alle 02:00 — sistema indisponibile.' },
  { date: '12/05', tag: 'HR', tagTone: 'mint' as const, title: 'Aggiornamento policy ferie 2026', body: 'Pubblicato il nuovo regolamento ferie. Consultare la sezione Risorse Umane.' },
  { date: '08/05', tag: 'CdA', tagTone: 'peach' as const, title: 'Risultati Q1 2026', body: 'Il CdA ha approvato il bilancio Q1 con risultati positivi (+24% YoY).' },
]

const notifications = [
  { id: 'n1', icon: Icon.shield, tone: 'info' as const, title: 'Promemoria sicurezza', body: 'Cambia la password ogni 90 giorni · scadenza 28/05', time: '2h fa' },
  { id: 'n2', icon: Icon.mail, tone: 'mint' as const, title: 'Nuova comunicazione', body: 'Manutenzione programmata server · 17/05', time: '5h fa' },
  { id: 'n3', icon: Icon.alert, tone: 'peach' as const, title: 'Scadenza imminente', body: 'Compila la scheda valutazione Q1 entro venerdì', time: '1g fa' },
]

const searchSuggestions = [
  { label: 'Bilancio_Riservato_2026.pdf', type: 'file' as const, target: 'documenti' as Sec },
  { label: 'Contratto_Fornitura_Apex_2026.docx', type: 'file' as const, target: 'documenti' as Sec },
  { label: 'aws_credentials.txt', type: 'file' as const, target: 'devops' as Sec },
  { label: 'Dott.ssa Anna Russo', type: 'persona' as const, target: 'profilo' as Sec },
  { label: 'Manutenzione server', type: 'comunicazione' as const, target: 'comunicazioni' as Sec },
  { label: 'Policy ferie 2026', type: 'comunicazione' as const, target: 'risorse_umane' as Sec },
]

function Portale() {
  const [section, setSection] = useState<Sec>('home')
  const [toast, setToast] = useState<string | null>(null)
  const [modalFile, setModalFile] = useState<FileItem | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const close = () => { setProfileOpen(false); setBellOpen(false); setSearchOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  const confirmDownload = (f: FileItem) => {
    showToast(`File "${f.name}" scaricato`)
    setModalFile(null)
  }

  return (
    <div className="port-layout" data-theme="light">
      <PortHeader
        profileOpen={profileOpen}
        bellOpen={bellOpen}
        searchOpen={searchOpen}
        searchQ={searchQ}
        onSearchChange={(v: string) => { setSearchQ(v); setSearchOpen(true); setBellOpen(false); setProfileOpen(false) }}
        onSearchFocus={(e: React.MouseEvent) => { e.stopPropagation(); setSearchOpen(true) }}
        onSearchSelect={(target: Sec) => { setSection(target); setSearchOpen(false); setSearchQ('') }}
        onBell={(e: React.MouseEvent) => { e.stopPropagation(); setBellOpen(o => !o); setProfileOpen(false); setSearchOpen(false) }}
        onProfile={(e: React.MouseEvent) => { e.stopPropagation(); setProfileOpen(o => !o); setBellOpen(false); setSearchOpen(false) }}
        onNotifNavigate={(target: Sec) => { setSection(target); setBellOpen(false) }}
        showToast={showToast}
      />
      <PortSidebar current={section} onSelect={setSection} />
      <main className="port-main">
        {section === 'home' && <PortHome onGoTo={setSection} onPick={setModalFile} />}
        {section === 'documenti' && <PortFiles folder="documenti" title="Documenti riservati" subtitle="Documenti aziendali ufficiali · accesso secondo classificazione" onPick={setModalFile} />}
        {section === 'risorse_umane' && <PortFiles folder="risorse_umane" title="Risorse Umane" subtitle="Documenti HR · valutazioni, regolamenti, ferie" onPick={setModalFile} />}
        {section === 'devops' && <PortFiles folder="devops" title="DevOps / Backup" subtitle="Credenziali di servizio · accesso riservato al team tecnico" onPick={setModalFile} />}
        {section === 'comunicazioni' && <PortComunicazioni />}
        {section === 'profilo' && <PortProfilo onLogout={() => showToast('Sessione terminata · disconnessione in corso')} />}
      </main>
      {toast && <div className="port-toast">{toast}</div>}
      {modalFile && <DownloadConfirmModal file={modalFile} onCancel={() => setModalFile(null)} onConfirm={() => confirmDownload(modalFile)} />}
    </div>
  )
}

function PortHeader(props: any) {
  const { profileOpen, bellOpen, searchOpen, searchQ, onSearchChange, onSearchFocus, onSearchSelect, onBell, onProfile, onNotifNavigate, showToast } = props
  const filtered = searchSuggestions.filter(s => searchQ === '' || s.label.toLowerCase().includes(searchQ.toLowerCase()))
  return (
    <header className="port-header">
      <div className="port-brand">
        <div className="port-brand-mark">{BRAND.mark}</div>
        <div>
          <div className="port-brand-name">{BRAND.name}</div>
          <div className="port-brand-sub">{BRAND.sub}</div>
        </div>
      </div>

      <div className="port-search-wrap" onClick={e => e.stopPropagation()}>
        <div className="port-search">
          {Icon.search}
          <input placeholder="Cerca documenti, persone, procedure..." value={searchQ} onChange={e => onSearchChange(e.target.value)} onFocus={onSearchFocus} />
        </div>
        {searchOpen && searchQ.length > 0 && (
          <div className="port-search-dropdown">
            {filtered.length === 0 && <div className="port-search-empty">Nessun risultato per "{searchQ}"</div>}
            {filtered.slice(0, 6).map((s, i) => (
              <div key={i} className="port-search-item" onClick={() => onSearchSelect(s.target)}>
                <span>{s.label}</span>
                <span className="port-search-item-type">{s.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="port-actions">
        <div className="port-action-wrap">
          <button className="port-icon-btn" onClick={onBell}>{Icon.bell}<span className="port-bell-dot"></span></button>
          {bellOpen && (
            <div className="port-dropdown port-notif-dropdown" onClick={e => e.stopPropagation()}>
              <div className="port-dropdown-header">
                <div className="port-dropdown-title">Notifiche</div>
                <span className="port-badge-pill">3 nuove</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="port-notif-item" onClick={() => onNotifNavigate(n.id === 'n2' ? 'comunicazioni' : 'profilo')}>
                  <div className={`port-notif-icon ${n.tone}`}>{n.icon}</div>
                  <div className="port-notif-body-wrap">
                    <div className="port-notif-title">{n.title}</div>
                    <div className="port-notif-body">{n.body}</div>
                    <div className="port-notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
              <div className="port-dropdown-footer" onClick={() => { onNotifNavigate('comunicazioni'); showToast('Apertura comunicazioni') }}>Vedi tutte →</div>
            </div>
          )}
        </div>

        <div className="port-action-wrap">
          <button className="port-user" onClick={onProfile}>
            <div className="port-avatar">LV</div>
            <div className="port-user-info">
              <div className="port-user-name">Luigi Verdi</div>
              <div className="port-user-role">Contabile Senior</div>
            </div>
          </button>
          {profileOpen && (
            <div className="port-dropdown port-profile-dropdown" onClick={e => e.stopPropagation()}>
              <div className="port-profile-head">
                <div className="port-avatar port-avatar-md">LV</div>
                <div>
                  <div className="port-profile-d-name">Luigi Verdi</div>
                  <div className="port-profile-d-mail">luigi.verdi@aureacapital.it</div>
                </div>
              </div>
              <div className="port-dropdown-divider"></div>
              <div className="port-dropdown-item">{Icon.user} Il mio profilo</div>
              <div className="port-dropdown-item">{Icon.cog} Impostazioni</div>
              <div className="port-dropdown-divider"></div>
              <div className="port-dropdown-item danger">{Icon.logout} Esci</div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function PortSidebar({ current, onSelect }: { current: Sec; onSelect: (s: Sec) => void }) {
  const items: { id: Sec; label: string; icon: JSX.Element; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: Icon.home },
    { id: 'documenti', label: 'Documenti', icon: Icon.folder, badge: 6 },
    { id: 'risorse_umane', label: 'Risorse Umane', icon: Icon.hr, badge: 4 },
    { id: 'devops', label: 'DevOps / Backup', icon: Icon.cog, badge: 4 },
    { id: 'comunicazioni', label: 'Comunicazioni', icon: Icon.mail, badge: 3 },
    { id: 'profilo', label: 'Profilo', icon: Icon.user },
  ]
  return (
    <aside className="port-sidebar">
      <div className="port-side-section-title">NAVIGAZIONE</div>
      {items.map(it => (
        <div key={it.id} className={`port-nav-item ${current === it.id ? 'active' : ''}`} onClick={() => onSelect(it.id)}>
          {it.icon}
          <span>{it.label}</span>
          {it.badge && <span className="port-nav-badge">{it.badge}</span>}
        </div>
      ))}

      <div className="port-side-card">
        <div className="port-side-card-icon">{Icon.shield}</div>
        <div className="port-side-card-title">Hai bisogno di aiuto?</div>
        <div className="port-side-card-desc">Contatta IT Support per accessi o documenti.</div>
        <button className="port-side-card-btn">Apri ticket</button>
      </div>
    </aside>
  )
}

function FileIcon({ format }: { format: string }) {
  return <div className={`port-file-badge ${format}`}>{format.toUpperCase()}</div>
}

function PortHome({ onGoTo, onPick }: { onGoTo: (s: Sec) => void; onPick: (f: FileItem) => void }) {
  const recents = files.slice(0, 4)
  return (
    <>
      <div className="port-welcome">
        <div>
          <div className="port-welcome-greet">Buongiorno, Luigi 👋</div>
          <div className="port-welcome-sub">È martedì 14 maggio 2026 — hai 3 comunicazioni recenti e nessuna scadenza in programma.</div>
        </div>
        <div className="port-welcome-clock">
          <div className="port-welcome-time">10:47</div>
          <div className="port-welcome-date">Mar · 14 Mag</div>
        </div>
      </div>

      <div className="port-quick-grid">
        <div className="port-quick-card" onClick={() => onGoTo('documenti')}>
          <div className="port-quick-icon mint">{Icon.folder}</div>
          <div className="port-quick-title">Documenti</div>
          <div className="port-quick-sub">6 file · Bilanci, Contratti</div>
        </div>
        <div className="port-quick-card" onClick={() => onGoTo('risorse_umane')}>
          <div className="port-quick-icon peach">{Icon.hr}</div>
          <div className="port-quick-title">Risorse Umane</div>
          <div className="port-quick-sub">4 file · Valutazioni, Ferie</div>
        </div>
        <div className="port-quick-card" onClick={() => onGoTo('devops')}>
          <div className="port-quick-icon lavender">{Icon.cog}</div>
          <div className="port-quick-title">DevOps / Backup</div>
          <div className="port-quick-sub">4 file · Credenziali servizi</div>
        </div>
        <div className="port-quick-card" onClick={() => onGoTo('comunicazioni')}>
          <div className="port-quick-icon blue">{Icon.mail}</div>
          <div className="port-quick-title">Comunicazioni</div>
          <div className="port-quick-sub">3 nuove · Aziendali</div>
        </div>
      </div>

      <div className="port-home-grid">
        <div className="port-card">
          <div className="port-card-header">
            <div>
              <div className="port-card-title">Documenti recenti</div>
              <div className="port-card-sub">I file più consultati ultimamente</div>
            </div>
            <div className="port-card-link" onClick={() => onGoTo('documenti')}>Vedi tutti {Icon.arrow}</div>
          </div>
          {recents.map(f => (
            <div key={f.id} className="port-recent-file" onClick={() => onPick(f)}>
              <FileIcon format={f.format} />
              <div className="port-recent-file-info">
                <div className="port-file-name">{f.name}</div>
                <div className="port-file-meta">{f.category} · {f.size} · {f.modified}</div>
              </div>
              <ClassBadge value={f.classification} />
            </div>
          ))}
        </div>

        <div className="port-card">
          <div className="port-card-header">
            <div>
              <div className="port-card-title">Comunicazioni recenti</div>
              <div className="port-card-sub">Annunci aziendali</div>
            </div>
            <div className="port-card-link" onClick={() => onGoTo('comunicazioni')}>Vedi tutti {Icon.arrow}</div>
          </div>
          {announcements.map((a, i) => (
            <div key={i} className="port-ann">
              <div className="port-ann-date">
                <div className="port-ann-day">{a.date.split('/')[0]}</div>
                <div className="port-ann-month">MAG</div>
              </div>
              <div className="port-ann-content">
                <div className="port-ann-row">
                  <span className={`port-ann-tag ${a.tagTone}`}>{a.tag}</span>
                  <div className="port-ann-title">{a.title}</div>
                </div>
                <div className="port-ann-body">{a.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="port-banner">
        <div className="port-banner-icon">{Icon.shield}</div>
        <div>
          <div className="port-banner-title">Promemoria sulla sicurezza</div>
          <div className="port-banner-text">I documenti con classificazione <strong>RISERVATO</strong> o <strong>CONFIDENZIALE</strong> non vanno condivisi al di fuori della rete aziendale. Ogni accesso è tracciato secondo le policy NIS2 e il D.Lgs. 138/2024.</div>
        </div>
      </div>
    </>
  )
}

function PortFiles({ folder, title, subtitle, onPick }: { folder: string; title: string; subtitle: string; onPick: (f: FileItem) => void }) {
  const list = files.filter(f => f.folder === folder)
  return (
    <>
      <div className="port-page-header">
        <div>
          <div className="port-page-title">{title}</div>
          <div className="port-page-sub">{subtitle} · {list.length} file totali</div>
        </div>
        <div className="port-breadcrumb">
          <span>Home</span>
          <span>›</span>
          <span className="active">{title}</span>
        </div>
      </div>

      <div className="port-files-table">
        <div className="port-files-thead">
          <span>Nome</span>
          <span>Categoria</span>
          <span>Classificazione</span>
          <span>Dimensione</span>
          <span>Modificato</span>
          <span></span>
        </div>
        {list.map(f => (
          <div key={f.id} className="port-files-row" onClick={() => onPick(f)} role="button">
            <div className="port-files-cell-name">
              <FileIcon format={f.format} />
              <span className="mono">{f.name}</span>
            </div>
            <div className="port-files-cell">{f.category}</div>
            <div className="port-files-cell"><ClassBadge value={f.classification} /></div>
            <div className="port-files-cell mono">{f.size}</div>
            <div className="port-files-cell">{f.modified}</div>
            <div className="port-files-cell port-files-actions">
              <button className="port-mini-btn primary" title="Scarica file">{Icon.download}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function PortComunicazioni() {
  const all = [
    ...announcements,
    { date: '03/05', tag: 'IT', tagTone: 'info' as const, title: 'Cambio password trimestrale', body: 'Tutti i dipendenti devono aggiornare la password entro il 31/05. Procedura: Profilo > Sicurezza.' },
    { date: '28/04', tag: 'CdA', tagTone: 'peach' as const, title: 'Assunzioni Q2', body: 'Aperte le candidature interne per 4 posizioni nel reparto IT (architetti + sviluppatori).' },
    { date: '20/04', tag: 'HR', tagTone: 'mint' as const, title: 'Welfare aziendale 2026', body: 'Aggiornato il piano welfare. Disponibili nuovi benefit per fitness e formazione continua.' },
  ]
  return (
    <>
      <div className="port-page-header">
        <div>
          <div className="port-page-title">Comunicazioni</div>
          <div className="port-page-sub">{all.length} annunci aziendali</div>
        </div>
      </div>
      <div className="port-card">
        {all.map((a, i) => (
          <div key={i} className="port-ann port-ann-full">
            <div className="port-ann-date">
              <div className="port-ann-day">{a.date.split('/')[0]}</div>
              <div className="port-ann-month">{a.date.split('/')[1] === '05' ? 'MAG' : 'APR'}</div>
            </div>
            <div className="port-ann-content">
              <div className="port-ann-row">
                <span className={`port-ann-tag ${a.tagTone}`}>{a.tag}</span>
                <div className="port-ann-title">{a.title}</div>
              </div>
              <div className="port-ann-body">{a.body}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function PortProfilo({ onLogout }: { onLogout: () => void }) {
  return (
    <>
      <div className="port-page-header">
        <div>
          <div className="port-page-title">Il mio profilo</div>
          <div className="port-page-sub">Dati anagrafici e preferenze account</div>
        </div>
      </div>
      <div className="port-profile-card">
        <div className="port-avatar port-avatar-xl">LV</div>
        <div className="port-profile-name">Luigi Verdi</div>
        <div className="port-profile-role">Contabile Senior · Amministrazione</div>
        <div className="port-profile-grid">
          <div><div className="port-pf-label">Matricola</div><div className="port-pf-value mono">AC-04217</div></div>
          <div><div className="port-pf-label">Email aziendale</div><div className="port-pf-value">luigi.verdi@aureacapital.it</div></div>
          <div><div className="port-pf-label">Sede</div><div className="port-pf-value">Sede Centrale · Piano 2</div></div>
          <div><div className="port-pf-label">Responsabile</div><div className="port-pf-value">Dott.ssa Anna Russo</div></div>
          <div><div className="port-pf-label">Anzianità</div><div className="port-pf-value">7 anni</div></div>
          <div><div className="port-pf-label">Livello di accesso</div><div className="port-pf-value">Livello 3 · INTERNO+RISERVATO</div></div>
        </div>
        <div className="port-profile-actions">
          <button className="port-side-card-btn">Modifica password</button>
          <button className="port-side-card-btn danger" onClick={onLogout}>{Icon.logout} Esci dall'account</button>
        </div>
      </div>
    </>
  )
}

function ClassBadge({ value }: { value: string }) {
  const map: Record<string, string> = { PUBBLICO: 'pub', INTERNO: 'int', RISERVATO: 'ris', CONFIDENZIALE: 'conf' }
  return <span className={`port-class port-class-${map[value]}`}>{value}</span>
}

function DownloadConfirmModal({ file, onConfirm, onCancel }: { file: FileItem; onConfirm: () => void; onCancel: () => void }) {
  const isHoneyOrToken = file.kind === 'honey' || file.kind === 'token'
  return (
    <div className="dl-modal-overlay" onClick={onCancel}>
      <div className="dl-modal" onClick={e => e.stopPropagation()}>
        <button className="dl-close" onClick={onCancel} aria-label="Chiudi">{Icon.close}</button>
        <div className="dl-head">
          <FileIcon format={file.format} />
          <div className="dl-head-text">
            <div className="dl-head-title mono">{file.name}</div>
            <div className="dl-head-sub">{file.category}</div>
          </div>
        </div>
        <div className="dl-divider"></div>
        <div className="dl-meta">
          <div className="dl-meta-label">Classificazione</div>
          <div className="dl-meta-value"><ClassBadge value={file.classification} /></div>
          <div className="dl-meta-label">Dimensione</div>
          <div className="dl-meta-value mono">{file.size}</div>
          <div className="dl-meta-label">Modificato</div>
          <div className="dl-meta-value mono">{file.modified}</div>
          <div className="dl-meta-label">Autore</div>
          <div className="dl-meta-value">{file.author}</div>
          <div className="dl-meta-label">ID documento</div>
          <div className="dl-meta-value mono">AC-DOC-{file.id.toUpperCase()}-2026</div>
          <div className="dl-meta-label">Hash SHA-256</div>
          <div className="dl-meta-value mono dl-hash">{file.hash}…</div>
        </div>
        <div className="dl-warn">
          <div className="dl-warn-icon">{Icon.lock}</div>
          <div className="dl-warn-text">
            {isHoneyOrToken
              ? <><strong>Documento ad accesso controllato.</strong> Il download di questo file verrà tracciato e registrato sul sistema di audit aziendale secondo policy <strong>NIS2</strong> (D.Lgs. 138/2024) e <strong>GDPR</strong>. La distribuzione non autorizzata costituisce violazione del Regolamento Interno {BRAND.mark} art. 14.</>
              : <><strong>Anteprima non disponibile.</strong> Per consultare il contenuto è necessario scaricare il file. L'accesso sarà registrato sul sistema di audit aziendale.</>}
          </div>
        </div>
        <div className="dl-actions">
          <button className="dl-btn secondary" onClick={onCancel}>Annulla</button>
          <button className="dl-btn primary" onClick={onConfirm}>{Icon.download} Scarica file</button>
        </div>
      </div>
    </div>
  )
}

export default Portale
