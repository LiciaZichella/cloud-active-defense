import { useState, useEffect, type JSX } from 'react'
import './App.css'

type Section = 'overview' | 'honeyfile' | 'esfiltrazione' | 'behavioral' | 'honeytoken' | 'report' | 'documenti' | 'sistema'

interface NavItem {
  id: Section
  label: string
  icon: JSX.Element
  badge?: { count: number; variant: 'critical' | 'warn' | 'info' | 'tor' }
}

const Icon = {
  grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  layers: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  key: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  file: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21 L16.65 16.65"/></svg>,
  sun: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  zap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  alert: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  eye: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4z"/></svg>,
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Icon.grid },
  { id: 'honeyfile', label: 'Honeyfile', icon: Icon.layers, badge: { count: 3, variant: 'critical' } },
  { id: 'esfiltrazione', label: 'Esfiltrazione DLP', icon: Icon.shield, badge: { count: 1, variant: 'warn' } },
  { id: 'behavioral', label: 'Behavioral', icon: Icon.trending, badge: { count: 2, variant: 'warn' } },
  { id: 'honeytoken', label: 'Honeytoken', icon: Icon.key, badge: { count: 1, variant: 'tor' } },
]
const navItems2: NavItem[] = [
  { id: 'report', label: 'Report & Dossier', icon: Icon.file },
  { id: 'sistema', label: 'Sistema & Notifiche', icon: Icon.settings },
]

// Mock data
const honeyAlerts = [
  { id: 'h1', time: '15:39:19', severity: 'critical', user: 'luigi.verdi', initials: 'LV', variant: 1 as const, file: 'Bilancio_Riservato_2026_HONEY.pdf', ip: '10.0.0.88', reparto: 'Amministrazione', ruolo: 'Contabile Senior', rischio: 'ALTO', sede: 'Sede Centrale · P2' },
  { id: 'h2', time: '14:12:03', severity: 'high', user: 'sara.romano', initials: 'SR', variant: 2 as const, file: 'Valutazione_Personale_HONEY.docx', ip: '10.0.0.42', reparto: 'IT & Sistemi', ruolo: 'Sviluppatrice Senior', rischio: 'MEDIO', sede: 'Data Center · Milano' },
  { id: 'h3', time: '11:24:01', severity: 'medium', user: 'anna.bianchi', initials: 'AB', variant: 4 as const, file: 'Contratto_Fornitura_HONEY.docx', ip: '10.0.0.15', reparto: 'Marketing', ruolo: 'Specialista', rischio: 'BASSO', sede: 'Sede Centrale · P1' },
]

const esfilEvents = [
  { id: 'e1', time: '15:39:19', city: 'Francoforte, DE', country: 'Germania', threat: 'tor', threatLabel: 'TOR', file: 'REAL_a73a4f46', user: 'luigi.verdi', ip: '185.220.100.240', dwellTime: '1h 15m', remediated: true },
  { id: 'e2', time: '14:12:03', city: 'Amsterdam, NL', country: 'Olanda', threat: 'tor', threatLabel: 'TOR', file: 'aws_credentials.txt', user: 'sara.romano', ip: '192.42.116.17', dwellTime: '8m', remediated: true },
]

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [section, setSection] = useState<Section>('overview')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [dash, setDash] = useState<any>(null)
  const attackActive = dash?.esfiltrazione ? !!dash.esfiltrazione.attackActive : false
  const [pdfPreview, setPdfPreview] = useState<{ type: 'forense' | 'esfil' | 'behavioral' | 'behavioralUser' | 'honeytoken' | 'nis2' | 'bundle' | 'doc'; data: any } | null>(null)
  const [tokenModal, setTokenModal] = useState(false)

  // CRITICAL FIX: set data-theme on html so CSS variables cascade to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const close = () => { setNotifOpen(false); setProfileOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  // Carica i dati reali dal backend FastAPI (polling ogni 5s)
  useEffect(() => {
    const load = () => fetch('/api/dashboard').then(r => r.json()).then(setDash).catch(() => {})
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div data-theme={theme} className="layout">
      <Topbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        notifOpen={notifOpen}
        onToggleNotif={(e) => { e.stopPropagation(); setNotifOpen(o => !o); setProfileOpen(false) }}
        profileOpen={profileOpen}
        onToggleProfile={(e) => { e.stopPropagation(); setProfileOpen(o => !o); setNotifOpen(false) }}
        onNavigate={(s) => { setSection(s); setNotifOpen(false) }}
      />
      <Sidebar current={section} onSelect={setSection} />
      <main className="main">
        {section === 'overview' && <OverviewSection onNav={setSection} attackActive={attackActive} data={dash?.overview} />}
        {section === 'honeyfile' && <HoneyfileSection showToast={showToast} data={dash?.honeyfile} onPreviewPdf={(data) => setPdfPreview({ type: 'forense', data })} />}
        {section === 'esfiltrazione' && <EsfiltrazioneSection showToast={showToast} attackActive={attackActive} data={dash?.esfiltrazione} onPreviewPdf={(data) => setPdfPreview({ type: 'esfil', data })} />}
        {section === 'behavioral' && <BehavioralSection showToast={showToast} data={dash?.behavioral} onPreviewPdf={() => setPdfPreview({ type: 'behavioral', data: {} })} onPreviewUser={(user) => setPdfPreview({ type: 'behavioralUser', data: user })} />}
        {section === 'honeytoken' && <HoneytokenSection showToast={showToast} onPreviewPdf={(data) => setPdfPreview({ type: 'honeytoken', data })} onGenerateToken={() => setTokenModal(true)} />}
        {section === 'documenti' && <DocumentiSection onPreview={(doc) => setPdfPreview({ type: 'doc', data: doc })} />}
        {section === 'report' && <ReportSection showToast={showToast} onPreviewPdf={(type) => setPdfPreview({ type, data: {} })} />}
        {section === 'sistema' && <SistemaSection showToast={showToast} />}
      </main>
      {toast && <div className="toast">{toast}</div>}
      {pdfPreview && pdfPreview.type === 'forense' && (
        <PdfPreviewOverlay
          title="Dossier Forense"
          subtitle={`${pdfPreview.data.user} · ${pdfPreview.data.file}`}
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast('📄 Dossier_' + pdfPreview.data.user + '.pdf scaricato') }}
        >
          <PdfForense data={pdfPreview.data} />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'esfil' && (
        <PdfPreviewOverlay
          title="Report Incidente DLP"
          subtitle={`${pdfPreview.data.file} · ${pdfPreview.data.city}`}
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast('📄 Report_INC-DLP-2026-0042.pdf scaricato') }}
        >
          <PdfEsfiltrazione data={pdfPreview.data} />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'behavioral' && (
        <PdfPreviewOverlay
          title="Report Behavioral Analytics"
          subtitle="Periodo 08-14 maggio 2026 · 4 regole attive"
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast('📄 Report_Behavioral_2026-W19.pdf scaricato') }}
        >
          <PdfBehavioral />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'behavioralUser' && (
        <PdfPreviewOverlay
          title="Dossier Comportamentale Dipendente"
          subtitle={`${pdfPreview.data.user} · ${pdfPreview.data.reparto}`}
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast(`📄 Dossier_Behavioral_${pdfPreview.data.user}.pdf scaricato`) }}
        >
          <PdfBehavioralUser user={pdfPreview.data} />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'honeytoken' && (
        <PdfPreviewOverlay
          title="Dossier Leak Credenziali"
          subtitle={`${pdfPreview.data.name} · ${pdfPreview.data.status === 'leaked' ? 'COMPROMESSO' : 'ARMED'}`}
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast(`📄 Dossier_Token_${pdfPreview.data.name}.pdf scaricato`) }}
        >
          <PdfHoneytoken token={pdfPreview.data} />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'nis2' && (
        <PdfPreviewOverlay
          title="Rapporto Conformità NIS2"
          subtitle="Maggio 2026 · Aurea Capital S.p.A."
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast('📄 Rapporto_NIS2_Maggio_2026.pdf scaricato') }}
        >
          <PdfNis2 />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'doc' && (
        <PdfPreviewOverlay
          title={`Anteprima · ${pdfPreview.data.format.toUpperCase()}`}
          subtitle={`${pdfPreview.data.name} · ${pdfPreview.data.kind === 'real' ? 'File reale' : pdfPreview.data.kind === 'honey' ? 'Honeyfile' : 'Honeytoken'}`}
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast(`📄 ${pdfPreview.data.name} scaricato`) }}
        >
          <DocPreview doc={pdfPreview.data} />
        </PdfPreviewOverlay>
      )}
      {pdfPreview && pdfPreview.type === 'bundle' && (
        <PdfPreviewOverlay
          title="Bundle Compliance Completo"
          subtitle="Archivio ZIP · Maggio 2026"
          onClose={() => setPdfPreview(null)}
          onDownload={() => { setPdfPreview(null); showToast('📦 Bundle_Compliance_Maggio_2026.zip scaricato') }}
        >
          <BundlePreview />
        </PdfPreviewOverlay>
      )}
      {tokenModal && (
        <TokenGenerateModal
          onClose={() => setTokenModal(false)}
          onGenerate={(type, name) => { setTokenModal(false); showToast(`🔑 Honeytoken "${name}" creato in data/honeytoken/`) }}
        />
      )}
    </div>
  )
}

function Topbar({ theme, onToggleTheme, notifOpen, onToggleNotif, profileOpen, onToggleProfile, onNavigate }: any) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2 L4 6 V12 C4 17 12 22 12 22 C12 22 20 17 20 12 V6 L12 2 Z"/></svg></div>
        <div><div className="brand-title">RADAR CORE</div><div className="brand-subtitle">Cloud Active Defense</div></div>
      </div>
      <div className="topbar-actions">
        <SearchBox onNavigate={onNavigate} />
        <button className="icon-btn" onClick={onToggleTheme} title="Cambia tema">{theme === 'light' ? Icon.sun : Icon.moon}</button>
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={onToggleNotif}>{Icon.bell}<span className="bell-dot"></span></button>
          {notifOpen && <NotifDropdown onNavigate={onNavigate} />}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="avatar" onClick={onToggleProfile}>LZ</button>
          {profileOpen && <ProfileDropdown />}
        </div>
      </div>
    </header>
  )
}

function SearchBox({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const suggestions: { label: string; type: string; target: Section }[] = [
    { label: 'luigi.verdi', type: 'utente', target: 'honeyfile' },
    { label: 'sara.romano', type: 'utente · honeytoken leak', target: 'honeytoken' },
    { label: 'mario.rossi', type: 'utente · behavioral', target: 'behavioral' },
    { label: 'REAL_a73a4f46', type: 'beacon_id', target: 'esfiltrazione' },
    { label: 'Bilancio_Riservato_2026', type: 'file honey', target: 'honeyfile' },
    { label: 'aws_credentials.txt', type: 'honeytoken', target: 'honeytoken' },
    { label: '185.220.100.240', type: 'IP · Tor exit node', target: 'esfiltrazione' },
    { label: 'download_burst', type: 'regola behavioral', target: 'behavioral' },
    { label: 'off_hours', type: 'regola behavioral', target: 'behavioral' },
  ]
  const filtered = suggestions.filter(s => q === '' || s.label.toLowerCase().includes(q.toLowerCase()) || s.type.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="search-wrap" onClick={(e) => e.stopPropagation()}>
      <div className="search">
        {Icon.search}
        <input
          placeholder="Cerca alert, utenti, file, IP..."
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && q.length > 0 && (
        <div className="search-dropdown">
          {filtered.length === 0 && <div className="search-empty">Nessun risultato</div>}
          {filtered.slice(0, 6).map((s, i) => (
            <div key={i} className="search-item" onClick={() => { setOpen(false); setQ(''); onNavigate(s.target) }}>
              <span>{s.label}</span>
              <span className="search-item-type">{s.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NotifDropdown({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return (
    <div className="dropdown notif-dropdown" onClick={e => e.stopPropagation()}>
      <div className="dropdown-header">
        <div className="dropdown-title">Notifiche</div>
        <span className="badge-pill">3 nuove</span>
      </div>
      <div className="notif-item urgent" onClick={() => onNavigate('esfiltrazione')}>
        <span className="severity-badge critical">CRITICO</span>
        <div>
          <div className="notif-title">Esfiltrazione via TOR</div>
          <div className="notif-meta">luigi.verdi · 15:39 · Vai a Esfiltrazione DLP →</div>
        </div>
      </div>
      <div className="notif-item" onClick={() => onNavigate('honeytoken')}>
        <span className="severity-badge tor">TOR</span>
        <div>
          <div className="notif-title">Honeytoken leaked</div>
          <div className="notif-meta">aws_credentials.txt · 14:12 · Vai a Honeytoken →</div>
        </div>
      </div>
      <div className="notif-item" onClick={() => onNavigate('behavioral')}>
        <span className="severity-badge high">ALTO</span>
        <div>
          <div className="notif-title">Behavioral: download_burst</div>
          <div className="notif-meta">mario.rossi · 13:58 · Vai a Behavioral →</div>
        </div>
      </div>
      <div className="dropdown-footer" onClick={() => onNavigate('overview')}>Vedi tutti gli alert →</div>
    </div>
  )
}

function ProfileDropdown() {
  return (
    <div className="dropdown profile-dropdown" onClick={e => e.stopPropagation()}>
      <div className="profile-head">
        <div className="avatar" style={{ width: 44, height: 44 }}>LZ</div>
        <div>
          <div className="profile-name">Licia Zichella</div>
          <div className="profile-role">SOC Analyst · Senior</div>
        </div>
      </div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-item">{Icon.user} Il mio profilo</div>
      <div className="dropdown-item">{Icon.settings} Impostazioni</div>
      <div className="dropdown-item">{Icon.shield} Audit log</div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-item danger">{Icon.logout} Esci</div>
    </div>
  )
}

function Sidebar({ current, onSelect }: { current: Section; onSelect: (s: Section) => void }) {
  const Item = (it: NavItem) => (
    <div key={it.id} className={`nav-item ${current === it.id ? 'active' : ''}`} onClick={() => onSelect(it.id)}>
      {it.icon}<span>{it.label}</span>
      {it.badge && <span className={`nav-badge ${it.badge.variant}`}>{it.badge.count}</span>}
    </div>
  )
  return (
    <aside className="sidebar">
      <div className="nav-section"><div className="nav-section-title">Monitoraggio</div>{navItems.map(Item)}</div>
      <div className="nav-section"><div className="nav-section-title">Reportistica</div>{navItems2.map(Item)}</div>
    </aside>
  )
}

function PageHeader({ title, breadcrumb, action }: { title: string; breadcrumb: string; action?: JSX.Element }) {
  return (
    <div className="page-header">
      <div><h1 className="page-title">{title}</h1><div className="page-breadcrumb">{breadcrumb}</div></div>
      {action}
    </div>
  )
}

function Kpi({ tint, label, value, unit, delta, icon }: { tint?: 'ok' | 'critical' | 'info' | 'medium'; label: string; value: string; unit?: string; delta?: string; icon?: JSX.Element }) {
  return (
    <div className={`kpi ${tint ? `tinted-${tint}` : ''}`}>
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}{unit && <span className="kpi-unit">{unit}</span>}</div>
      {delta && <div className="kpi-delta">{delta}</div>}
    </div>
  )
}

function LivePill({ attack }: { attack: boolean }) {
  if (attack) return <div className="live-pill attack"><span className="live-dot attack"></span>🚨 ATTACCO IN CORSO</div>
  return <div className="live-pill"><span className="live-dot"></span>LIVE · Sync 2s fa</div>
}

function MiniAvatar({ initials, variant }: { initials: string; variant?: 1 | 2 | 3 | 4 }) { return <div className={`mini-avatar v${variant || 1}`}>{initials}</div> }

function MiniMap({ height = 200 }: { height?: number }) {
  return (
    <div className="mini-map" style={{ height }}>
      <div className="map-line l1"></div><div className="map-line l2"></div>
      <div className="map-marker hq"></div><div className="map-marker critical"></div><div className="map-marker tor"></div>
    </div>
  )
}

function FullMap() {
  return (
    <div className="full-map">
      <div className="full-marker m1"></div><div className="full-marker m2"></div><div className="full-marker m3"></div><div className="full-marker m4"></div><div className="full-marker m5"></div>
      <div className="map-overlay">
        <div className="map-legend-floating">
          <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--ok)'}}></span>HQ Roma</div>
          <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--critical)'}}></span>Esfiltrazioni</div>
          <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--tor)'}}></span>Tor/VPN</div>
        </div>
      </div>
    </div>
  )
}

function Donut() {
  return (
    <div className="donut-section">
      <div className="donut-wrap">
        <svg className="donut-svg" width="110" height="110" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="3"/>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--critical)" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="0"/>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--high)" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-20"/>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--medium)" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="-40"/>
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--tor)" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="-80"/>
        </svg>
        <div className="donut-center"><div className="donut-num">5</div><div className="donut-label">eventi</div></div>
      </div>
      <div className="legend">
        <LegendItem color="var(--critical)" name="Critico" value="1" />
        <LegendItem color="var(--high)" name="Alto" value="1" />
        <LegendItem color="var(--medium)" name="Medio" value="2" />
        <LegendItem color="var(--tor)" name="Tor" value="1" />
      </div>
    </div>
  )
}

function LegendItem({ color, name, value }: { color: string; name: string; value: string }) {
  return <div className="legend-item"><span className="legend-name"><span className="legend-dot" style={{ background: color }}></span>{name}</span><span className="legend-value">{value}</span></div>
}

const SEV_LABEL: Record<string, string> = { critical: 'CRITICO', high: 'ALTO', medium: 'MEDIO', tor: 'TOR', ok: 'OK' }

function OverviewSection({ onNav, attackActive, data }: { onNav: (s: Section) => void; attackActive: boolean; data: any }) {
  const ov = data || {}
  const alerts: any[] = ov.alertRecenti || []
  return (
    <>
      <PageHeader title="Overview" breadcrumb="Monitoraggio · Ultime 24 ore" action={<LivePill attack={attackActive} />} />
      <div className="kpi-grid">
        <Kpi tint="ok" label="Vitals Score" value={data ? String(ov.vitalsScore) : '…'} unit="/100" delta={data ? (ov.vitalsScore >= 90 ? 'Stabile' : 'Attenzione') : ''} icon={Icon.shield} />
        <Kpi tint="critical" label="Allarmi attivi" value={data ? String(ov.allarmiAttivi) : '…'} delta={data ? 'ultime 24h' : ''} icon={Icon.alert} />
        <Kpi tint="info" label="Dwell time medio" value={data ? ov.dwellMedio : '…'} icon={Icon.clock} />
        <Kpi tint="medium" label="Tempo detection" value={data ? ov.tempoDetection : '…'} unit="s" delta="warm avg" icon={Icon.zap} />
      </div>
      <div className="content-grid-2">
        <div className="panel">
          <div className="panel-header">
            <div><div className="panel-title">Alert Recenti</div><div className="panel-sub">{alerts.length} eventi nelle ultime 24h</div></div>
            <div className="panel-action" onClick={() => onNav('honeyfile')}>Vedi tutti →</div>
          </div>
          {alerts.length === 0 && (
            <div className="info-banner">{data ? '✅ Nessun alert recente — documenti al sicuro.' : '⏳ Caricamento dati dal backend…'}</div>
          )}
          {alerts.map((a, i) => (
            <div key={i} className="alert-row" onClick={() => onNav(a.nav)}>
              <div className="alert-time mono">{a.time}</div>
              <div><span className={`severity-badge ${a.severity}`}>{SEV_LABEL[a.severity] || a.severity}</span></div>
              <div className="alert-user"><MiniAvatar initials={a.initials} variant={a.variant} />{a.user}</div>
              <div className="alert-file">{a.fileLabel}</div>
              <div className="alert-ip mono">{a.ip}</div>
              <div className="alert-action">⋯</div>
            </div>
          ))}
        </div>
        <div className="right-stack">
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Mappa Minacce</div><div className="panel-action" onClick={() => onNav('esfiltrazione')}>Espandi →</div></div>
            <MiniMap />
            <div className="map-legend">
              <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--ok)'}}></span>HQ</div>
              <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--critical)'}}></span>Esfiltrazione</div>
              <div className="map-legend-item"><span className="map-legend-dot" style={{background:'var(--tor)'}}></span>Tor/VPN</div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Severity Mix</div></div>
            <Donut />
          </div>
        </div>
      </div>
    </>
  )
}

function HoneyfileSection({ showToast, data, onPreviewPdf }: { showToast: (m: string) => void; data: any; onPreviewPdf: (data: any) => void }) {
  const alerts: any[] = data?.alerts || []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = alerts.find(h => h.id === selectedId) || alerts[0] || null
  return (
    <>
      <PageHeader title="Honeyfile · Trappole attive" breadcrumb={`${alerts.length} violazioni rilevate · Scenario A (Zero Trust)`} action={<button className="btn primary" onClick={() => showToast('Per generare un nuovo Honeyfile esegui generator.py')}>+ Nuovo Honeyfile</button>} />
      <div className="info-banner" style={{ marginBottom: 16 }}>
        💡 <strong>Scenario A — Zero Trust</strong>: un Honeyfile è un documento esca senza valore reale. L'allarme scatta nel momento del download — nessuno dovrebbe accedervi, quindi qualsiasi accesso è automaticamente sospetto. Permette di identificare gli insider durante la fase di reconnaissance, prima dell'esfiltrazione.
      </div>
      <div className="content-grid-2">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Cronologia Honey-Hit</div><div className="panel-sub">Clicca una riga per aprire il dossier</div></div>
          {alerts.length === 0 && (
            <div className="info-banner">{data ? '✅ Nessun Honey-Hit rilevato — nessuno ha toccato i file esca.' : '⏳ Caricamento dati dal backend…'}</div>
          )}
          {alerts.map(h => (
            <div key={h.id} className={`alert-row ${selected && selected.id === h.id ? 'selected' : ''}`} onClick={() => setSelectedId(h.id)}>
              <div className="alert-time mono">{h.time}</div>
              <div><span className={`severity-badge ${h.severity}`}>HONEY-HIT</span></div>
              <div className="alert-user"><MiniAvatar initials={h.initials} variant={h.variant} />{h.user}</div>
              <div className="alert-file"><span className="mono">{h.file}</span></div>
              <div className="alert-ip mono">{h.ip}</div>
              <div className="alert-action">⋯</div>
            </div>
          ))}
        </div>
        {selected && (
        <div className="dossier">
          <div className="dossier-hero">
            <div className="dossier-hero-label">DOSSIER FORENSE</div>
            <div className="dossier-hero-title">{selected.user}</div>
            <div className="dossier-hero-meta">{selected.reparto} · {selected.ruolo} · RISCHIO {selected.rischio}</div>
          </div>
          <div className="dossier-body">
            <div className="dossier-row"><span className="dossier-row-label">File toccato</span><span className="dossier-row-value mono">{selected.file}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">Orario</span><span className="dossier-row-value">{selected.time}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">IP sorgente</span><span className="dossier-row-value mono">{selected.ip}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">Sede</span><span className="dossier-row-value">{selected.sede}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">Firma documento</span><span className="dossier-row-value" style={{color: selected.signatureValid ? 'var(--ok)' : 'var(--critical)'}}>{selected.signatureValid ? '✓ VALIDA' : '✗ NON VALIDA'}</span></div>
            <div className="export-row">
              <button className="btn" onClick={() => onPreviewPdf(selected)}>{Icon.eye} Anteprima dossier</button>
              <button className="btn" onClick={() => showToast(`📄 Dossier ${selected.user}.pdf scaricato`)}>{Icon.download} Esporta PDF</button>
              <button className="btn danger" onClick={() => showToast(`🔒 Permessi IAM revocati per ${selected.user}`)}>{Icon.lock} Revoca permessi</button>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  )
}

function EsfiltrazioneSection({ showToast, attackActive, data, onPreviewPdf }: { showToast: (m: string) => void; attackActive: boolean; data: any; onPreviewPdf: (data: any) => void }) {
  const events: any[] = data?.events || []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = events.find(e => e.id === selectedId) || events[0] || null
  return (
    <>
      <PageHeader title="Esfiltrazione DLP" breadcrumb={`Scenario B · ${events.length} esfiltrazione/i rilevata/e · Auto-Remediation attiva`} action={<LivePill attack={attackActive} />} />
      <div className="info-banner" style={{ marginBottom: 16 }}>
        💡 <strong>Scenario B — File reale con Web Beacon</strong>: documenti aziendali autentici contengono un beacon crittografico nascosto. Quando il file viene aperto fuori dalla rete aziendale, il beacon "chiama casa" e il sistema classifica l'IP sorgente (normale, VPN, Tor). Se l'apertura avviene da rete esterna, scatta l'Auto-Remediation che revoca automaticamente i permessi IAM del downloader.
      </div>
      <FullMap />
      <div className="content-grid-2">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Eventi di esfiltrazione</div><div className="panel-sub">Clicca per dettaglio</div></div>
          {events.length === 0 && (
            <div className="info-banner">{data ? '✅ Nessuna esfiltrazione rilevata — documenti al sicuro.' : '⏳ Caricamento dati dal backend…'}</div>
          )}
          {events.map(e => (
            <div key={e.id} className={`alert-row ${selected && selected.id === e.id ? 'selected' : ''}`} onClick={() => setSelectedId(e.id)}>
              <div className="alert-time mono">{e.time}</div>
              <div><span className={`severity-badge ${e.threat}`}>{e.threatLabel}</span></div>
              <div className="alert-user">📍 {e.city}</div>
              <div className="alert-file"><span className="mono">{e.file}</span></div>
              <div className="alert-ip mono">{e.ip}</div>
              <div className="alert-action">⋯</div>
            </div>
          ))}
        </div>
        {selected && (
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Dettaglio incidente</div></div>
          <div className="dossier-row"><span className="dossier-row-label">Beacon ID</span><span className="dossier-row-value mono">{selected.file}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">Threat type</span><span className="dossier-row-value" style={{color:'var(--tor)'}}>{selected.threatLabel} · {selected.city}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">IP attaccante</span><span className="dossier-row-value mono">{selected.ip}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">Downloader originario</span><span className="dossier-row-value">{selected.user}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">Dwell Time</span><span className="dossier-row-value">{selected.dwellTime}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">Auto-Remediation</span><span className="dossier-row-value" style={{color: selected.remediated ? 'var(--ok)' : 'var(--critical)'}}>{selected.remediated ? '✓ IAM revocato' : '⚠ Pendente'}</span></div>
          <div className="dossier-row"><span className="dossier-row-label">Webhook Discord</span><span className="dossier-row-value" style={{color:'var(--ok)'}}>✓ Inviato</span></div>
          <div className="export-row">
            <button className="btn" onClick={() => onPreviewPdf(selected)}>{Icon.eye} Anteprima report</button>
            <button className="btn" onClick={() => showToast(`📄 Report incidente ${selected.file}.pdf scaricato`)}>{Icon.download} Stampa PDF</button>
          </div>
        </div>
        )}
      </div>
      <div className="panel" style={{marginTop:16}}>
        <div className="panel-header"><div className="panel-title">Timeline attacco</div><div className="panel-sub">Sequenza eventi correlati</div></div>
        <div className="timeline">
          <div className="timeline-item"><div className="timeline-dot ok"></div><div><div className="timeline-time mono">14:24:19</div><div className="timeline-text">luigi.verdi scarica <span className="mono">Progetto_REAL.pdf</span> da S3</div></div></div>
          <div className="timeline-item"><div className="timeline-dot warn"></div><div><div className="timeline-time mono">14:31:00</div><div className="timeline-text">Beacon JavaScript iniettato nel PDF (pyHanko firma valida)</div></div></div>
          <div className="timeline-item"><div className="timeline-dot critical"></div><div><div className="timeline-time mono">15:39:19</div><div className="timeline-text">Apertura beacon da IP esterno · <span className="mono">185.220.100.240</span> classificato come <strong style={{color:'var(--tor)'}}>TOR exit node</strong></div></div></div>
          <div className="timeline-item"><div className="timeline-dot ok"></div><div><div className="timeline-time mono">15:39:21</div><div className="timeline-text">Auto-Remediation: <strong>EmployeeS3Policy revocata</strong> da EmployeeRole (luigi.verdi)</div></div></div>
        </div>
      </div>
    </>
  )
}

function RuleCard({ fired, name, desc, count, color, icon }: { fired: boolean; name: string; desc: string; count: string; color: string; icon: JSX.Element }) {
  return (
    <div className={`rule-card ${fired ? 'fired' : ''}`}>
      <div className="rule-icon" style={{ background: `var(--${color}-bg)`, color: `var(--${color})` }}>{icon}</div>
      <div className="rule-name">{name}</div>
      <div className="rule-desc">{desc}</div>
      <div className="rule-count" style={{ color: fired ? `var(--${color})` : 'var(--text)' }}>{count}</div>
      <div className="rule-count-label">alert oggi</div>
    </div>
  )
}

const RULE_ICON: Record<string, JSX.Element> = { download_burst: Icon.zap, off_hours: Icon.clock, mass_access: Icon.users, recon_pattern: Icon.eye }

function BehavioralSection({ showToast, data, onPreviewPdf, onPreviewUser }: { showToast: (m: string) => void; data: any; onPreviewPdf: () => void; onPreviewUser: (user: any) => void }) {
  const [showCalibra, setShowCalibra] = useState(false)
  const rules: any[] = data?.rules || []
  const ranking: any[] = data?.ranking || []
  const alerts: any[] = data?.alerts || []
  return (
    <>
      <PageHeader title="Behavioral Analytics" breadcrumb={`4 regole attive · Sliding window · ${alerts.length} alert rilevati`} action={
        <div style={{display:'flex',gap:10}}>
          <button className="btn" onClick={() => setShowCalibra(s => !s)}>{Icon.settings} Configura soglie</button>
          <button className="btn" onClick={onPreviewPdf}>{Icon.eye} Anteprima report</button>
          <button className="btn primary" onClick={() => showToast('📄 Report behavioral con grafici scaricato')}>{Icon.download} Stampa PDF</button>
        </div>
      } />

      {showCalibra && (
        <div className="panel calibra-panel">
          <div className="panel-header"><div><div className="panel-title">Configura soglie regole</div><div className="panel-sub">Modifica i parametri per ridurre falsi positivi o aumentare sensibilità</div></div></div>
          <div className="calibra-grid">
            <div className="calibra-item"><label>download_burst · soglia download</label><input type="number" defaultValue={10} /><span className="calibra-unit">in 5 min</span></div>
            <div className="calibra-item"><label>off_hours · finestra oraria</label><input type="text" defaultValue="08:00–19:00" /><span className="calibra-unit">orario lavoro</span></div>
            <div className="calibra-item"><label>mass_access · soglia reparto</label><input type="number" defaultValue={15} /><span className="calibra-unit">in 30 min</span></div>
            <div className="calibra-item"><label>recon_pattern · finestra honey→real</label><input type="number" defaultValue={10} /><span className="calibra-unit">minuti</span></div>
          </div>
        </div>
      )}

      <div className="rules-grid">
        {rules.map((r, i) => (
          <RuleCard key={i} fired={r.fired} name={r.name} desc={r.desc} count={String(r.count)} color={r.severity} icon={RULE_ICON[r.name] || Icon.zap} />
        ))}
      </div>

      <div className="content-grid-2">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Anomalie nell'arco temporale</div><div className="panel-sub">Pattern di download per dipendente · 7 giorni</div></div>
          <BehavioralChart />
        </div>
        <div className="panel">
          <div className="panel-header"><div><div className="panel-title">Top dipendenti anomali</div><div className="panel-sub">Clicca per aprire il dossier comportamentale</div></div></div>
          {ranking.length === 0 && (
            <div className="info-banner">{data ? '✅ Nessuna anomalia comportamentale rilevata.' : '⏳ Caricamento dati dal backend…'}</div>
          )}
          {ranking.map((u, i) => (
            <div key={i} className="rank-item rank-clickable" onClick={() => onPreviewUser(u)}>
              <MiniAvatar initials={u.initials} variant={u.variant as 1|2|3|4} />
              <div style={{flex:1}}>
                <div className="rank-name">{u.user}</div>
                <div className="rank-meta">{u.reparto} · {u.rule}</div>
              </div>
              <div className="rank-score">{u.score}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <div className="panel-header"><div className="panel-title">Alert Behavioral · Cronologia dettagliata</div></div>
        {alerts.length === 0 && (
          <div className="info-banner">{data ? 'Nessun alert comportamentale registrato.' : '⏳ Caricamento…'}</div>
        )}
        {alerts.map((a, i) => (
          <div key={i} className="alert-row">
            <div className="alert-time mono">{a.time}</div>
            <div><span className={`severity-badge ${a.severity}`}>{a.rule}</span></div>
            <div className="alert-user"><MiniAvatar initials={a.initials} variant={a.variant} />{a.user}</div>
            <div className="alert-file">{a.evidenza}</div>
            <div className="alert-ip mono">{a.ip}</div>
            <div className="alert-action">⋯</div>
          </div>
        ))}
      </div>
    </>
  )
}

function BehavioralChart() {
  // Mock SVG chart - 7 days, 3 employees
  const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
  const series = [
    { name: 'mario.rossi', color: 'var(--critical)', vals: [3, 4, 2, 5, 12, 1, 0] },
    { name: 'paolo.conti', color: 'var(--medium)', vals: [2, 2, 3, 2, 3, 0, 1] },
    { name: 'luigi.verdi', color: 'var(--tor)', vals: [1, 2, 2, 1, 4, 2, 1] },
  ]
  const maxVal = 14
  const W = 100, H = 180
  return (
    <div className="bchart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="bchart-svg">
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1="0" y1={H - p * H} x2={W} y2={H - p * H} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="1 1" />
        ))}
        {series.map((s, si) => {
          const pts = s.vals.map((v, i) => `${(i / (s.vals.length - 1)) * W},${H - (v / maxVal) * H}`).join(' ')
          return (
            <g key={si}>
              <polyline points={pts} fill="none" stroke={s.color} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
              {s.vals.map((v, i) => (
                <circle key={i} cx={(i / (s.vals.length - 1)) * W} cy={H - (v / maxVal) * H} r="0.9" fill={s.color} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="bchart-xaxis">{days.map((d, i) => <span key={i}>{d}</span>)}</div>
      <div className="bchart-legend">
        {series.map(s => (
          <div key={s.name} className="bchart-legend-item">
            <span className="bchart-legend-dot" style={{ background: s.color }}></span>{s.name}
          </div>
        ))}
      </div>
    </div>
  )
}

interface Token {
  id: string
  tone: 'aws' | 'env' | 'yaml' | 'ssh'
  name: string
  desc: string
  status: 'armed' | 'leaked'
  created: string
  lastCheck: string
  icon: JSX.Element
  leakedBy?: string
  leakedAt?: string
  leakedIp?: string
  exposes: string[]
  reveals?: string
  recommendation?: string
}

const tokens: Token[] = [
  {
    id: 't1', tone: 'aws', name: 'aws_credentials.txt',
    desc: 'Chiavi AWS AKIA + secret (fake)',
    status: 'leaked', created: '01/05/2026', lastCheck: '2 min fa',
    leakedBy: 'sara.romano', leakedAt: '14:12 · 14/05/2026', leakedIp: '10.0.0.42',
    exposes: ['AWS Access Key ID (AKIA...)', 'AWS Secret (40 char)', 'Region us-east-1', 'Account alias "prod-finance"'],
    reveals: 'Sara ha probabilmente cercato deliberatamente credenziali cloud — pattern di reconnaissance pre-esfiltrazione',
    recommendation: 'Sospendere account, revisione attività CloudTrail 30gg, MFA reset obbligatorio',
    icon: Icon.file,
  },
  {
    id: 't2', tone: 'env', name: '.env.production',
    desc: 'DATABASE_URL, JWT, Stripe (fake)',
    status: 'armed', created: '01/05/2026', lastCheck: '5 min fa',
    exposes: ['DATABASE_URL postgres', 'JWT_SECRET (64 char)', 'STRIPE_API_KEY sk_live_*', 'SENDGRID_API_KEY'],
    icon: Icon.zap,
  },
  {
    id: 't3', tone: 'yaml', name: 'devops_secrets.yaml',
    desc: 'Vault token + K8s cluster token (fake)',
    status: 'armed', created: '03/05/2026', lastCheck: '5 min fa',
    exposes: ['Vault token (hvs.*)', 'K8s cluster_token base64', 'DB password admin', 'Host: db-prod.internal'],
    icon: Icon.layers,
  },
  {
    id: 't4', tone: 'ssh', name: 'id_rsa_backup',
    desc: 'Chiave SSH privata RSA (fake)',
    status: 'armed', created: '03/05/2026', lastCheck: '5 min fa',
    exposes: ['RSA Private Key 2048', 'Comment: id_rsa - backup', 'Host inferito da nomenclatura'],
    icon: Icon.key,
  },
]

function TokenCard({ token, selected, onClick }: { token: Token; selected: boolean; onClick: () => void }) {
  return (
    <div className={`token-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className={`token-icon ${token.tone}`}>{token.icon}</div>
      <div style={{ flex: 1 }}>
        <div className="token-name mono">{token.name}</div>
        <div className="token-desc">{token.desc}</div>
        <div className="token-meta-row">
          <span className="token-meta">Creato: {token.created}</span>
          <span className="token-meta">Ultimo check: {token.lastCheck}</span>
        </div>
        <div className={`token-status ${token.status}`}>
          {token.status === 'leaked' ? `⚠ LEAKED · ${token.leakedAt?.split(' · ')[0]} da ${token.leakedBy}` : '● ARMED · nessun accesso'}
        </div>
      </div>
    </div>
  )
}

function HoneytokenSection({ showToast, onPreviewPdf, onGenerateToken }: { showToast: (m: string) => void; onPreviewPdf: (data: any) => void; onGenerateToken: () => void }) {
  const [selectedId, setSelectedId] = useState(tokens[0].id)
  const selected = tokens.find(t => t.id === selectedId)!
  return (
    <>
      <PageHeader title="Honeytoken" breadcrumb="4 token attivi · 1 leak rilevato" action={<button className="btn primary" onClick={onGenerateToken}>+ Genera nuovo token</button>} />
      <div className="content-grid-2">
        <div>
          <div className="token-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            {tokens.map(t => <TokenCard key={t.id} token={t} selected={selectedId === t.id} onClick={() => setSelectedId(t.id)} />)}
          </div>
        </div>
        <div className="dossier">
          <div className={`dossier-hero ${selected.status === 'leaked' ? 'leak-hero' : 'armed-hero'}`}>
            <div className="dossier-hero-label">{selected.status === 'leaked' ? '⚠ DOSSIER LEAK' : '🔒 TOKEN ARMED'}</div>
            <div className="dossier-hero-title mono">{selected.name}</div>
            <div className="dossier-hero-meta">{selected.tone.toUpperCase()} · {selected.desc}</div>
          </div>
          <div className="dossier-body">
            <div className="dossier-row"><span className="dossier-row-label">Stato</span><span className="dossier-row-value" style={{ color: selected.status === 'leaked' ? 'var(--critical)' : 'var(--ok)' }}>{selected.status === 'leaked' ? 'COMPROMESSO' : 'OPERATIVO'}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">Creato il</span><span className="dossier-row-value">{selected.created}</span></div>
            <div className="dossier-row"><span className="dossier-row-label">Ultimo controllo</span><span className="dossier-row-value">{selected.lastCheck}</span></div>
            {selected.status === 'leaked' && (
              <>
                <div className="dossier-row"><span className="dossier-row-label">Compromesso da</span><span className="dossier-row-value">{selected.leakedBy}</span></div>
                <div className="dossier-row"><span className="dossier-row-label">Data leak</span><span className="dossier-row-value">{selected.leakedAt}</span></div>
                <div className="dossier-row"><span className="dossier-row-label">IP sorgente</span><span className="dossier-row-value mono">{selected.leakedIp}</span></div>
              </>
            )}
            <div style={{ marginTop: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Credenziali esposte</div>
              <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.8, color: 'var(--text)' }}>
                {selected.exposes.map((e, i) => <li key={i} className="mono" style={{ fontSize: 11 }}>{e}</li>)}
              </ul>
            </div>
            {selected.reveals && (
              <div className="token-reveals" style={{ marginTop: 8 }}>
                <strong>💡 Cosa rivela:</strong> {selected.reveals}
              </div>
            )}
            {selected.recommendation && (
              <div style={{ marginTop: 12, padding: 14, background: 'var(--high-bg)', border: '1px solid color-mix(in srgb, var(--high) 30%, var(--border))', borderRadius: 12, fontSize: 12, color: 'var(--text)' }}>
                <strong style={{ color: 'var(--high)' }}>⚙ Raccomandazione SOC:</strong> {selected.recommendation}
              </div>
            )}
            <div className="export-row">
              <button className="btn" onClick={() => onPreviewPdf(selected)}>{Icon.eye} Anteprima dossier</button>
              <button className="btn" onClick={() => showToast(`📄 Dossier ${selected.name}.pdf scaricato`)}>{Icon.download} Esporta PDF</button>
              {selected.status === 'leaked' && <button className="btn danger" onClick={() => showToast(`🔒 Account ${selected.leakedBy} sospeso`)}>{Icon.lock} Sospendi account</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="info-banner">
        💡 <strong>Come funziona</strong>: ogni token contiene credenziali fittizie ma realistiche, pensate per attirare attaccanti durante la fase di post-exploitation. Implementazione tecnica nei moduli <span className="mono">honeytoken.py</span> e <span className="mono">genera_chiavi.py</span>. La scoperta di un token avviene tracciando il download del file dal portale o (in deployment AWS reale) l'effettivo utilizzo delle credenziali via CloudTrail.
      </div>
    </>
  )
}

function BarItem({ color, height, label, value }: { color: string; height: string; label: string; value: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="bar" style={{ background: color, height }}>{value}</div>
      <div className="bar-label">{label}</div>
    </div>
  )
}

function ReportSection({ showToast, onPreviewPdf }: { showToast: (m: string) => void; onPreviewPdf: (type: 'nis2' | 'bundle') => void }) {
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('week')
  return (
    <>
      <PageHeader title="Report & Dossier" breadcrumb="Esportazione PDF · Compliance NIS2 / GDPR" action={
        <button className="btn primary" onClick={() => showToast('📋 Bundle completo PDF generato')}>{Icon.download} Genera PDF</button>
      } />

      <div className="range-tabs">
        <button className={`range-tab ${range === 'day' ? 'active' : ''}`} onClick={() => setRange('day')}>Giorno</button>
        <button className={`range-tab ${range === 'week' ? 'active' : ''}`} onClick={() => setRange('week')}>Settimana</button>
        <button className={`range-tab ${range === 'month' ? 'active' : ''}`} onClick={() => setRange('month')}>Mese</button>
        <button className={`range-tab ${range === 'year' ? 'active' : ''}`} onClick={() => setRange('year')}>Anno</button>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Eventi per tipo</div><div className="panel-sub">{range === 'day' ? 'Oggi' : range === 'week' ? 'Ultimi 7 giorni' : range === 'month' ? 'Ultimi 30 giorni' : 'Ultimo anno'}</div></div>
          <div className="bar-chart">
            <BarItem color="var(--critical)" height="60%" label="Critico" value="1" />
            <BarItem color="var(--high)" height="75%" label="Alto" value="3" />
            <BarItem color="var(--medium)" height="90%" label="Medio" value="5" />
            <BarItem color="var(--tor)" height="45%" label="Tor/VPN" value="2" />
            <BarItem color="var(--info)" height="30%" label="Honeytoken" value="1" />
          </div>
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Trend storico</div><div className="panel-sub">Esfiltrazioni vs Honey-hit</div></div>
          <TrendChart />
        </div>
      </div>

      <div className="chart-grid" style={{marginTop:16}}>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Reparti più esposti</div></div>
          <LegendItem color="var(--critical)" name="Amministrazione" value="4" />
          <LegendItem color="var(--high)" name="IT & Sistemi" value="3" />
          <LegendItem color="var(--medium)" name="HR" value="2" />
          <LegendItem color="var(--ok)" name="Marketing" value="1" />
        </div>
        <div className="panel">
          <div className="panel-header"><div className="panel-title">Compliance score</div></div>
          <div style={{textAlign:'center',padding:'10px 0'}}>
            <div style={{fontSize:48,fontWeight:800,color:'var(--ok)'}}>92%</div>
            <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>NIS2 Art. 21 · GDPR Art. 33-34</div>
            <div style={{marginTop:14,fontSize:12,color:'var(--text-muted)'}}>Audit trail completo · Non-Ripudio attivo · Auto-Remediation operativa</div>
          </div>
        </div>
      </div>

      <div className="panel" style={{marginTop:16}}>
        <div className="panel-header"><div className="panel-title">Esportazioni rapide</div><div className="panel-sub">4 tipi di report disponibili</div></div>
        <div className="export-row">
          <button className="btn" onClick={() => onPreviewPdf('nis2')}>{Icon.eye} Anteprima Report NIS2</button>
          <button className="btn" onClick={() => showToast('📄 Report mensile NIS2 scaricato')}>📄 Scarica Report NIS2</button>
          <button className="btn" onClick={() => onPreviewPdf('bundle')}>{Icon.eye} Anteprima Bundle</button>
          <button className="btn primary" onClick={() => showToast('📋 Bundle compliance ZIP generato')}>📋 Bundle compliance completo (ZIP)</button>
        </div>
      </div>
    </>
  )
}

function TrendChart() {
  // 12 mesi mock data
  const months = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D']
  const esfil = [1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 4, 3]
  const honey = [3, 2, 4, 3, 5, 4, 3, 2, 3, 4, 6, 5]
  const max = 7
  const W = 100, H = 160
  const ptsE = esfil.map((v, i) => `${(i / 11) * W},${H - (v / max) * H}`).join(' ')
  const ptsH = honey.map((v, i) => `${(i / 11) * W},${H - (v / max) * H}`).join(' ')
  const areaE = `${ptsE} ${W},${H} 0,${H}`
  const areaH = `${ptsH} ${W},${H} 0,${H}`
  return (
    <div className="bchart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="bchart-svg">
        <polygon points={areaH} fill="var(--info)" opacity="0.15" />
        <polygon points={areaE} fill="var(--critical)" opacity="0.15" />
        <polyline points={ptsH} fill="none" stroke="var(--info)" strokeWidth="0.7" />
        <polyline points={ptsE} fill="none" stroke="var(--critical)" strokeWidth="0.7" />
      </svg>
      <div className="bchart-xaxis">{months.map((m, i) => <span key={i}>{m}</span>)}</div>
      <div className="bchart-legend">
        <div className="bchart-legend-item"><span className="bchart-legend-dot" style={{ background: 'var(--info)' }}></span>Honey-hit</div>
        <div className="bchart-legend-item"><span className="bchart-legend-dot" style={{ background: 'var(--critical)' }}></span>Esfiltrazioni</div>
      </div>
    </div>
  )
}


function PdfPreviewOverlay({ title, subtitle, onClose, onDownload, children }: { title: string; subtitle: string; onClose: () => void; onDownload: () => void; children: JSX.Element }) {
  return (
    <div className="pdf-overlay">
      <div className="pdf-toolbar">
        <div>
          <div className="pdf-toolbar-title">{title}</div>
          <div className="pdf-toolbar-sub">{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" onClick={onClose}>← Chiudi anteprima</button>
          <button className="btn primary" onClick={onDownload}>{Icon.download} Scarica PDF</button>
        </div>
      </div>
      <div className="pdf-viewport">
        {children}
      </div>
    </div>
  )
}

function PdfForense({ data }: { data: any }) {
  // Timeline data ultimi 30 giorni - mock
  const timeline = [
    { date: '14/05', label: 'HONEY-HIT', tone: 'critical', detail: 'Questo evento · Bilancio_Riservato_HONEY.pdf' },
    { date: '12/05', label: 'Download', tone: 'ok', detail: 'Documenti regolari · 3 file' },
    { date: '08/05', label: 'off_hours', tone: 'medium', detail: 'Behavioral alert · 22:35' },
    { date: '03/05', label: 'Download', tone: 'ok', detail: 'Bilancio_Q1_2026.xlsx' },
  ]
  return (
    <>
      {/* PAGINA 1 */}
      <div className="pdf-page">
        <div className="pdf-watermark">CONFIDENZIALE</div>

        <div className="pdf-header forense">
          <div className="pdf-header-label">DOSSIER INDAGINE FORENSE</div>
          <div className="pdf-header-title">Insider Threat — Honeyfile</div>
          <div className="pdf-header-meta">
            <span>Rif. <strong>INC-2026-0153</strong></span>
            <span>·</span>
            <span>{data.time} · 14/05/2026</span>
            <span>·</span>
            <span className="pdf-classification">CONFIDENZIALE</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Profilo dipendente</div>
          <div className="pdf-profile-row">
            <div className={`pdf-profile-avatar v${data.variant}`}>{data.initials}</div>
            <div className="pdf-profile-data">
              <div className="pdf-profile-name">{data.user}</div>
              <div className="pdf-profile-grid">
                <div><span className="pdf-label">Reparto</span><span className="pdf-value">{data.reparto}</span></div>
                <div><span className="pdf-label">Ruolo</span><span className="pdf-value">{data.ruolo}</span></div>
                <div><span className="pdf-label">Sede</span><span className="pdf-value">{data.sede}</span></div>
                <div><span className="pdf-label">Livello rischio</span><span className="pdf-value" style={{color:'var(--critical)'}}>{data.rischio}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Dettagli evento</div>
          <div className="pdf-event-box">
            <div className="pdf-event-row"><span className="pdf-label">File tracciato</span><span className="pdf-value mono">{data.file}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Beacon ID</span><span className="pdf-value mono">HONEY_b7cc6270</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Timestamp</span><span className="pdf-value">{data.time} · 14/05/2026</span></div>
            <div className="pdf-event-row"><span className="pdf-label">IP sorgente</span><span className="pdf-value mono">{data.ip}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Geolocation</span><span className="pdf-value">{data.sede}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Firma documento</span><span className="pdf-value" style={{color:'var(--ok)'}}>✓ VALIDA (RSA-2048 Aurea Capital)</span></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Cronologia ultimi 30 giorni</div>
          <div className="pdf-timeline-mini">
            <div className="pdf-timeline-track">
              {timeline.map((t, i) => (
                <div key={i} className={`pdf-timeline-pin ${t.tone}`} style={{ left: `${(i / (timeline.length - 1)) * 95 + 2}%` }} title={t.detail}>
                  <div className="pdf-timeline-pin-dot"></div>
                  <div className="pdf-timeline-pin-date">{t.date}</div>
                </div>
              ))}
            </div>
            <div className="pdf-timeline-legend">
              {timeline.map((t, i) => (
                <div key={i} className="pdf-timeline-row">
                  <span className={`pdf-timeline-tag ${t.tone}`}>{t.label}</span>
                  <span className="pdf-timeline-detail">{t.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 2</span>
          <span>Cloud Active Defense · Modulo Forense v.2.6</span>
        </div>
      </div>

      {/* PAGINA 2 */}
      <div className="pdf-page">
        <div className="pdf-watermark">CONFIDENZIALE</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Contesto comportamentale</div>
          <div className="pdf-bullets">
            <div className="pdf-bullet">
              <span className="pdf-bullet-marker"></span>
              <span>L'utente ha generato <strong>1 alert behavioral di tipo off_hours</strong> nelle ultime 2 settimane (08/05 alle 22:35).</span>
            </div>
            <div className="pdf-bullet">
              <span className="pdf-bullet-marker"></span>
              <span>Il pattern temporale (accesso fuori orario + Honey-touch entro 7 giorni) è <strong>compatibile con reconnaissance pre-esfiltrazione</strong> secondo MITRE T1083 (File and Directory Discovery).</span>
            </div>
            <div className="pdf-bullet">
              <span className="pdf-bullet-marker"></span>
              <span>Nessun alert behavioral di tipo <em>download_burst</em> o <em>mass_access</em> rilevato — la condotta è puntuale e mirata, non massiva.</span>
            </div>
            <div className="pdf-bullet">
              <span className="pdf-bullet-marker"></span>
              <span>Il file toccato è classificato <strong>RISERVATO Livello 3</strong> e non rientra negli asset documentali del reparto di appartenenza dell'utente.</span>
            </div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Conclusione e raccomandazioni</div>
          <div className="pdf-reco-box">
            <p style={{ marginBottom: 10 }}>Si raccomanda l'attivazione del seguente protocollo di response, in coordinamento con HR e legal team:</p>
            <ol className="pdf-numlist">
              <li><strong>Revoca temporanea privilegi S3</strong> (24-48h) — applicare deny policy esplicita su prefisso <span className="mono">company-secure-documents/*</span> finché indagine non è conclusa.</li>
              <li><strong>Audit completo CloudTrail</strong> degli ultimi 30 giorni per l'utente, con focus su pattern di accesso a documenti non pertinenti al ruolo.</li>
              <li><strong>Reset MFA obbligatorio</strong> e verifica device autorizzati.</li>
              <li><strong>Audizione formale con HR</strong> entro 48 ore. Documentare motivazione dell'accesso al file dichiarato dall'utente.</li>
              <li><strong>Monitoraggio rafforzato 90 giorni</strong> — soglie behavioral abbassate del 50% per questo utente.</li>
            </ol>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Mappatura compliance</div>
          <div className="pdf-compliance">
            <div className="pdf-comp-item"><span className="pdf-comp-tag">NIS2</span><span>Art. 21 — Misure di rilevamento e gestione incidenti</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">GDPR</span><span>Art. 33-34 — Notifica violazione dati (se applicabile dopo verifica)</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">MITRE</span><span>T1083 File and Directory Discovery · T1078 Valid Accounts</span></div>
          </div>
        </div>

        <div className="pdf-signature">
          <div>
            <div className="pdf-sig-label">Analista responsabile</div>
            <div className="pdf-sig-name">SOC Team — Tier 2</div>
          </div>
          <div>
            <div className="pdf-sig-label">Hash documento (SHA-256)</div>
            <div className="pdf-sig-hash mono">7a4f3c8b9d1e6f2c0a8b5d1c3e7f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e2c</div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 2</span>
          <span>Generato 14/05/2026 16:02 · Cloud Active Defense</span>
        </div>
      </div>
    </>
  )
}


function PdfEsfiltrazione({ data }: { data: any }) {
  return (
    <>
      {/* PAGINA 1 */}
      <div className="pdf-page">
        <div className="pdf-watermark">RISERVATO</div>

        <div className="pdf-header esfil">
          <div className="pdf-header-label">REPORT INCIDENTE DLP</div>
          <div className="pdf-header-title">Esfiltrazione di documento riservato</div>
          <div className="pdf-header-meta">
            <span>Rif. <strong>INC-DLP-2026-0042</strong></span>
            <span>·</span>
            <span>{data.time} · 14/05/2026</span>
            <span>·</span>
            <span className="pdf-urgency">⚠ CRITICO</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Sintesi esecutiva</div>
          <div className="pdf-summary">
            Il <strong>14/05/2026 alle {data.time}</strong> il documento aziendale con identificativo <span className="mono">{data.file}</span> è stato aperto da un indirizzo IP esterno alla rete aziendale, geolocalizzato a <strong>{data.city}</strong> e classificato come <strong style={{color:'#9333ea'}}>{data.threatLabel} exit node</strong>. Il sistema ha automaticamente attivato il protocollo di Auto-Remediation, revocando in tempo reale i permessi IAM del dipendente che aveva precedentemente scaricato il file. L'incidente è classificato di severità <strong style={{color:'#dc2626'}}>CRITICA</strong> in conformità alla direttiva NIS2 art. 21.
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Vettore d'attacco geografico</div>
          <div className="pdf-attack-map">
            <div className="pdf-map-line"></div>
            <div className="pdf-map-pin hq">
              <div className="pdf-map-pin-dot"></div>
              <div className="pdf-map-pin-label"><strong>HQ Roma</strong><br/>41.9028, 12.4964</div>
            </div>
            <div className="pdf-map-pin attacker">
              <div className="pdf-map-pin-dot"></div>
              <div className="pdf-map-pin-label"><strong>{data.city}</strong><br/>{data.ip}<br/><span style={{color:'#9333ea'}}>Tor exit</span></div>
            </div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Cronologia incidente</div>
          <div className="pdf-timeline-vertical">
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot ok"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">14:24:19</div>
                <div className="pdf-tv-text"><strong>{data.user}</strong> scarica il documento da S3 (canale legittimo, sessione autenticata)</div>
              </div>
            </div>
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot info"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">14:24:21</div>
                <div className="pdf-tv-text">Documento generato con beacon JavaScript embedded (pyHanko firma RSA-2048 valida)</div>
              </div>
            </div>
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot warn"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">{data.time}</div>
                <div className="pdf-tv-text">Apertura del file rilevata · richiesta HTTP al radar da IP <span className="mono">{data.ip}</span></div>
              </div>
            </div>
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot critical"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">{data.time}</div>
                <div className="pdf-tv-text">IP classificato come <strong style={{color:'#9333ea'}}>Tor exit node</strong> tramite lookup statico (lista exit nodes Tor Project)</div>
              </div>
            </div>
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot ok"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">{data.time}</div>
                <div className="pdf-tv-text"><strong>Auto-Remediation</strong> · revoca <span className="mono">EmployeeS3Policy</span> da ruolo IAM <span className="mono">EmployeeRole</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 2</span>
          <span>Cloud Active Defense · Modulo DLP v.2.6</span>
        </div>
      </div>

      {/* PAGINA 2 */}
      <div className="pdf-page">
        <div className="pdf-watermark">RISERVATO</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Analisi della minaccia</div>
          <table className="pdf-table">
            <tbody>
              <tr><td>Indirizzo IP sorgente</td><td className="mono">{data.ip}</td></tr>
              <tr><td>Geolocalizzazione</td><td>{data.city}, {data.country}</td></tr>
              <tr><td>Classificazione</td><td><strong style={{color:'#9333ea'}}>Tor exit node</strong> (lista Tor Project)</td></tr>
              <tr><td>ASN proprietario</td><td className="mono">AS208294 · Tor Project</td></tr>
              <tr><td>Reputazione IP</td><td><strong style={{color:'#dc2626'}}>Alta sospettosità</strong> (anonimato attivo)</td></tr>
              <tr><td>Primo avvistamento nodo</td><td>2022-08-14</td></tr>
              <tr><td>Dwell time download→apertura</td><td><strong>{data.dwellTime}</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Catena di custodia del documento</div>
          <div className="pdf-event-box">
            <div className="pdf-event-row"><span className="pdf-label">Beacon ID</span><span className="pdf-value mono">{data.file}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Hash SHA-256 documento</span><span className="pdf-value mono">d8a2c7e4b3f6a1d9e2c5b8a4f7e1d6c3b9a5e8f2c1d7b4a9e6f3d8c2b5a1e7f4</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Firma digitale (pyHanko)</span><span className="pdf-value" style={{color:'#047857'}}>✓ VALIDA · Aurea Capital · RSA-2048</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Documento manomesso?</span><span className="pdf-value" style={{color:'#047857'}}>No · firma intatta</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Tracciato CloudTrail</span><span className="pdf-value">DownloadDocumento da {data.user}</span></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Azioni eseguite automaticamente</div>
          <div className="pdf-actions-grid">
            <div className="pdf-action-item ok"><div className="pdf-action-check">✓</div><div><strong>IAM detach_role_policy</strong><br/><span className="pdf-action-detail">EmployeeS3Policy rimossa da EmployeeRole</span></div></div>
            <div className="pdf-action-item ok"><div className="pdf-action-check">✓</div><div><strong>Log esfiltrazione su S3</strong><br/><span className="pdf-action-detail">esfiltrazione_1715693959.json</span></div></div>
            <div className="pdf-action-item ok"><div className="pdf-action-check">✓</div><div><strong>Webhook Discord notificato</strong><br/><span className="pdf-action-detail">canale #soc-alerts · payload con threat_type=tor</span></div></div>
            <div className="pdf-action-item ok"><div className="pdf-action-check">✓</div><div><strong>Log AutoRemediation su S3</strong><br/><span className="pdf-action-detail">remediation_1715693961.json · audit trail completo</span></div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Mappatura compliance e tecniche</div>
          <div className="pdf-compliance">
            <div className="pdf-comp-item"><span className="pdf-comp-tag">NIS2</span><span>Art. 21 — Misure tecniche di rilevamento e risposta · Notifica obbligatoria entro 24h all'autorità nazionale</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">GDPR</span><span>Art. 33 — Notifica violazione dati personali al Garante (verifica obbligatoria del contenuto)</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">MITRE</span><span>T1567.002 Exfiltration to Cloud Storage · T1090.003 Multi-hop Proxy (Tor)</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">D3FEND</span><span>D3-IAA Identity-based Authentication Action (revoca dinamica)</span></div>
          </div>
        </div>

        <div className="pdf-signature">
          <div>
            <div className="pdf-sig-label">Analista responsabile</div>
            <div className="pdf-sig-name">SOC Team — Tier 2</div>
          </div>
          <div>
            <div className="pdf-sig-label">Hash documento (SHA-256)</div>
            <div className="pdf-sig-hash mono">4b8e2a9c1d6f3b7e0a5d8c2b1e6f9a3c5d7e0b4f8a2c6d1e9b3a7c5d8f2e1a4b</div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 2</span>
          <span>Generato 14/05/2026 · Cloud Active Defense</span>
        </div>
      </div>
    </>
  )
}


function PdfMiniTrend({ title, color, vals, max }: { title: string; color: string; vals: number[]; max: number }) {
  const W = 100, H = 50
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - (v / max) * (H - 4) - 2}`).join(' ')
  const area = `${pts} ${W},${H} 0,${H}`
  return (
    <div className="pdf-mini-trend">
      <div className="pdf-mini-trend-header">
        <span className="pdf-mini-trend-title mono">{title}</span>
        <span className="pdf-mini-trend-sum" style={{color}}>{vals.reduce((a,b)=>a+b,0)} alert</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 50 }}>
        <polygon points={area} fill={color} opacity="0.18" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="pdf-mini-trend-axis">L M M G V S D</div>
    </div>
  )
}

function PdfHeatmap() {
  // 7 giorni x 24 ore = 168 celle, mock intensità
  const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
  const data: number[][] = days.map((_, di) =>
    Array.from({ length: 24 }, (_, hi) => {
      // intensità alta nelle ore di lavoro (8-19) + spike sera (22) per off_hours
      let v = 0
      if (hi >= 8 && hi <= 19) v = 0.2 + Math.random() * 0.3
      if (hi === 22 && di === 3) v = 0.85 // Paolo conti
      if (hi === 14 && di === 1) v = 0.95 // Mario burst
      if (hi >= 0 && hi <= 6) v = Math.random() * 0.08
      return v
    })
  )
  return (
    <div>
      <div className="pdf-heatmap">
        <div className="pdf-heatmap-yaxis">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="pdf-heatmap-grid">
          {data.map((row, di) => (
            <div key={di} className="pdf-heatmap-row">
              {row.map((v, hi) => {
                const c = v > 0.7 ? '#fb7185' : v > 0.4 ? '#f0b429' : v > 0.15 ? '#a78bfa' : '#e2e8f0'
                return <div key={hi} className="pdf-heatmap-cell" style={{ background: c, opacity: 0.25 + v * 0.75 }} title={`${days[di]} ${hi}:00 = ${(v*100).toFixed(0)}%`} />
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="pdf-heatmap-xaxis">
        <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
      </div>
      <div className="pdf-heatmap-legend">
        <span style={{ background: '#e2e8f0' }}></span><span>nessuno</span>
        <span style={{ background: '#a78bfa' }}></span><span>basso</span>
        <span style={{ background: '#f0b429' }}></span><span>medio</span>
        <span style={{ background: '#fb7185' }}></span><span>alto</span>
      </div>
    </div>
  )
}

function PdfBehavioral() {
  return (
    <>
      {/* PAGINA 1 */}
      <div className="pdf-page">
        <div className="pdf-watermark">ANALYTICS</div>

        <div className="pdf-header behavioral">
          <div className="pdf-header-label">BEHAVIORAL ANALYTICS REPORT</div>
          <div className="pdf-header-title">Analisi pattern comportamentali</div>
          <div className="pdf-header-meta">
            <span>Settimana <strong>W19/2026</strong></span>
            <span>·</span>
            <span>08–14 maggio 2026</span>
            <span>·</span>
            <span className="pdf-classification">USO INTERNO SOC</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Sintesi del periodo</div>
          <div className="pdf-summary">
            Nel periodo monitorato il sistema ha analizzato <strong>500 eventi di download</strong> distribuiti su 6 dipendenti. Le 4 regole behavioral (sliding window) hanno prodotto complessivamente <strong>3 alert</strong>, con un tasso di falsi positivi del <strong style={{color:'#047857'}}>0.20%</strong>. La regola più attiva è <strong>download_burst</strong>, scattata su un singolo dipendente in fascia oraria pomeridiana. Nessuna correlazione con tentativi di esfiltrazione esterna rilevati nello stesso periodo.
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ KPI di periodo</div>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Eventi analizzati</div><div className="pdf-kpi-cell-value">500</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Alert generati</div><div className="pdf-kpi-cell-value" style={{color:'#dc2626'}}>3</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Tasso falsi positivi</div><div className="pdf-kpi-cell-value" style={{color:'#047857'}}>0.20%</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Dipendenti coinvolti</div><div className="pdf-kpi-cell-value">2 / 6</div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Trend per regola</div>
          <div className="pdf-trends-grid">
            <PdfMiniTrend title="download_burst" color="#fb7185" vals={[0, 0, 0, 0, 1, 0, 0]} max={2} />
            <PdfMiniTrend title="off_hours" color="#f0b429" vals={[0, 0, 0, 1, 0, 0, 0]} max={2} />
            <PdfMiniTrend title="mass_access" color="#60a5fa" vals={[0, 0, 0, 0, 0, 0, 0]} max={2} />
            <PdfMiniTrend title="recon_pattern" color="#c084fc" vals={[0, 0, 0, 0, 0, 0, 0]} max={2} />
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Ranking dipendenti anomali</div>
          <table className="pdf-table pdf-table-rank">
            <thead><tr><th>#</th><th>Dipendente</th><th>Reparto</th><th>Regola</th><th>Score</th></tr></thead>
            <tbody>
              <tr><td>1</td><td><strong>mario.rossi</strong></td><td>IT &amp; Sistemi</td><td className="mono">download_burst</td><td style={{color:'#dc2626'}}><strong>12</strong></td></tr>
              <tr><td>2</td><td><strong>paolo.conti</strong></td><td>Direzione</td><td className="mono">off_hours</td><td style={{color:'#b45309'}}><strong>3</strong></td></tr>
              <tr><td>3</td><td>luigi.verdi</td><td>Amministrazione</td><td>—</td><td>0</td></tr>
            </tbody>
          </table>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 2</span>
          <span>Cloud Active Defense · Modulo Behavioral v.2.6</span>
        </div>
      </div>

      {/* PAGINA 2 */}
      <div className="pdf-page">
        <div className="pdf-watermark">ANALYTICS</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Heatmap oraria — distribuzione anomalie</div>
          <PdfHeatmap />
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Soglie attualmente configurate</div>
          <table className="pdf-table">
            <thead><tr><th>Regola</th><th>Parametro</th><th>Valore</th></tr></thead>
            <tbody>
              <tr><td className="mono">download_burst</td><td>N download in finestra</td><td><strong>10 in 5 min</strong></td></tr>
              <tr><td className="mono">off_hours</td><td>Finestra orario lavoro</td><td><strong>08:00 – 19:00</strong></td></tr>
              <tr><td className="mono">mass_access</td><td>N download per reparto</td><td><strong>15 in 30 min</strong></td></tr>
              <tr><td className="mono">recon_pattern</td><td>Finestra honey→real</td><td><strong>10 minuti</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Raccomandazioni di tuning</div>
          <div className="pdf-reco-box">
            <ol className="pdf-numlist">
              <li><strong>download_burst</strong>: la soglia 10/5min è appropriata per i pattern osservati. Nessun cambio raccomandato.</li>
              <li><strong>off_hours</strong>: 1 alert su utente Direzione fuori orario. Valutare se aggiungere a whitelist gli account dirigenziali autorizzati a operare fino alle 23:00.</li>
              <li><strong>mass_access</strong>: 0 alert nel periodo. La soglia 15/30min potrebbe essere troppo permissiva — considerare abbassamento a 10/30min per aumentare sensibilità.</li>
              <li><strong>recon_pattern</strong>: 0 alert. Mantenere finestra 10min, valutare possibili dipendenze con il futuro pattern di camouflage.</li>
            </ol>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Mappatura MITRE ATT&amp;CK</div>
          <div className="pdf-compliance">
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1083</span><span>File and Directory Discovery — copertura via mass_access &amp; recon_pattern</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1530</span><span>Data from Cloud Storage Object — copertura via download_burst</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1078</span><span>Valid Accounts — copertura via off_hours (uso credenziali insolito)</span></div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 2</span>
          <span>Generato 14/05/2026 · Cloud Active Defense</span>
        </div>
      </div>
    </>
  )
}


function PdfHoneytoken({ token }: { token: any }) {
  const isLeaked = token.status === 'leaked'
  const totalPages = isLeaked ? 3 : 2
  return (
    <>
      {/* PAGINA 1 — header, sintesi, profilo, (evento leak se leaked) */}
      <div className="pdf-page">
        <div className="pdf-watermark">{isLeaked ? 'CRITICO' : 'AUDIT'}</div>

        <div className={`pdf-header ${isLeaked ? 'leak' : 'audit'}`}>
          <div className="pdf-header-label">{isLeaked ? 'DOSSIER LEAK CREDENZIALI' : 'DOSSIER AUDIT HONEYTOKEN'}</div>
          <div className="pdf-header-title">{token.name}</div>
          <div className="pdf-header-meta">
            <span>Rif. <strong>TOK-2026-{token.id.replace('t','').padStart(4,'0')}</strong></span>
            <span>·</span>
            <span>14/05/2026</span>
            <span>·</span>
            <span className="pdf-urgency">{isLeaked ? '⚠ CRITICO' : '● ATTIVO'}</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Sintesi esecutiva</div>
          <div className="pdf-summary">
            {isLeaked ? (
              <>Il honeytoken di tipo <strong>{token.tone.toUpperCase()}</strong> denominato <span className="mono">{token.name}</span> è stato <strong style={{color:'#dc2626'}}>compromesso</strong> il {token.leakedAt} dall'utente interno <strong>{token.leakedBy}</strong> tramite download dal portale aziendale. Le credenziali esposte (fittizie) consentono di profilare le intenzioni dell'attaccante: ricerca attiva di credenziali cloud e configurazioni di produzione. Si raccomanda l'attivazione immediata del protocollo di response.</>
            ) : (
              <>Il honeytoken di tipo <strong>{token.tone.toUpperCase()}</strong> denominato <span className="mono">{token.name}</span> risulta <strong style={{color:'#047857'}}>operativo</strong> e non ha registrato accessi anomali. Creato il {token.created}, eseguiti controlli automatici di integrità con cadenza ogni 5 minuti.</>
            )}
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Profilo del token</div>
          <div className="pdf-event-box">
            <div className="pdf-event-row"><span className="pdf-label">Tipologia</span><span className="pdf-value">{token.tone.toUpperCase()} credentials</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Nome file</span><span className="pdf-value mono">{token.name}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Descrizione</span><span className="pdf-value">{token.desc}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Data creazione</span><span className="pdf-value">{token.created}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Posizione esposizione</span><span className="pdf-value">Portale aziendale · cartella "Credenziali"</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Ultimo controllo integrità</span><span className="pdf-value">{token.lastCheck}</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Stato</span><span className="pdf-value" style={{color: isLeaked ? '#dc2626' : '#047857'}}>{isLeaked ? 'COMPROMESSO' : 'OPERATIVO'}</span></div>
          </div>
        </div>

        {isLeaked && (
          <div className="pdf-section">
            <div className="pdf-section-title">▎ Evento di leak</div>
            <div className="pdf-event-box" style={{background:'#fef2f2',borderColor:'#fbc8c8'}}>
              <div className="pdf-event-row"><span className="pdf-label">Utente identificato</span><span className="pdf-value">{token.leakedBy}</span></div>
              <div className="pdf-event-row"><span className="pdf-label">Timestamp</span><span className="pdf-value">{token.leakedAt}</span></div>
              <div className="pdf-event-row"><span className="pdf-label">IP sorgente</span><span className="pdf-value mono">{token.leakedIp}</span></div>
              <div className="pdf-event-row"><span className="pdf-label">Modalità</span><span className="pdf-value">Download diretto da portale</span></div>
              <div className="pdf-event-row"><span className="pdf-label">User-Agent</span><span className="pdf-value mono">Mozilla/5.0 Windows · Edge 124.0</span></div>
            </div>
          </div>
        )}

        <div className="pdf-page-footer">
          <span>Pagina 1 di {totalPages}</span>
          <span>Cloud Active Defense · Modulo Honeytoken v.2.6</span>
        </div>
      </div>

      {/* PAGINA 2 — credenziali esposte, cronologia, (interpretazione se leaked) */}
      <div className="pdf-page">
        <div className="pdf-watermark">{isLeaked ? 'CRITICO' : 'AUDIT'}</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Credenziali fittizie esposte</div>
          <div className="pdf-cred-list">
            {token.exposes.map((e: string, i: number) => (
              <div key={i} className="pdf-cred-item mono">{e}</div>
            ))}
          </div>
          <div className="pdf-note">⚠ Tutti i valori elencati sono <strong>fittizi e non funzionanti</strong>. Generati esclusivamente come esca tramite il modulo <span className="mono">honeytoken.py</span>.</div>
        </div>

        {isLeaked && token.reveals && (
          <div className="pdf-section">
            <div className="pdf-section-title">▎ Interpretazione comportamentale del leak</div>
            <div className="pdf-reveals-box">
              <div className="pdf-reveals-label">💡 COSA RIVELA QUESTO LEAK</div>
              <div className="pdf-reveals-text">{token.reveals}</div>
            </div>
          </div>
        )}

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Cronologia accessi</div>
          <div className="pdf-timeline-vertical">
            {isLeaked && (
              <div className="pdf-tv-item">
                <div className="pdf-tv-dot critical"></div>
                <div className="pdf-tv-body">
                  <div className="pdf-tv-time mono">{token.leakedAt}</div>
                  <div className="pdf-tv-text"><strong style={{color:'#dc2626'}}>LEAK rilevato</strong> · {token.leakedBy} scarica il token dal portale</div>
                </div>
              </div>
            )}
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot ok"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">2 min fa</div>
                <div className="pdf-tv-text">Check di integrità automatico — token presente, hash invariato</div>
              </div>
            </div>
            <div className="pdf-tv-item">
              <div className="pdf-tv-dot ok"></div>
              <div className="pdf-tv-body">
                <div className="pdf-tv-time mono">{token.created}</div>
                <div className="pdf-tv-text">Token generato via <span className="mono">honeytoken.py</span> e depositato nel portale</div>
              </div>
            </div>
          </div>
        </div>

        {!isLeaked && (
          <>
            <div className="pdf-section">
              <div className="pdf-section-title">▎ Mappatura compliance</div>
              <div className="pdf-compliance">
                <div className="pdf-comp-item"><span className="pdf-comp-tag">MITRE</span><span>T1552 Unsecured Credentials · T1078 Valid Accounts</span></div>
                <div className="pdf-comp-item"><span className="pdf-comp-tag">NIS2</span><span>Art. 21 — Misure di rilevamento minacce interne</span></div>
                <div className="pdf-comp-item"><span className="pdf-comp-tag">NIST</span><span>SP 800-184 — Deception &amp; Insider Threat Recovery</span></div>
              </div>
            </div>
            <div className="pdf-signature">
              <div>
                <div className="pdf-sig-label">Analista responsabile</div>
                <div className="pdf-sig-name">SOC Team — Tier 2</div>
              </div>
              <div>
                <div className="pdf-sig-label">Hash documento (SHA-256)</div>
                <div className="pdf-sig-hash mono">2e8f5a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f</div>
              </div>
            </div>
          </>
        )}

        <div className="pdf-page-footer">
          <span>Pagina 2 di {totalPages}</span>
          <span>Cloud Active Defense · Modulo Honeytoken v.2.6</span>
        </div>
      </div>

      {/* PAGINA 3 (solo per leak) — raccomandazioni, compliance, firma */}
      {isLeaked && (
        <div className="pdf-page">
          <div className="pdf-watermark">CRITICO</div>

          <div className="pdf-section">
            <div className="pdf-section-title">▎ Analisi del pattern d'attacco</div>
            <div className="pdf-bullets">
              <div className="pdf-bullet"><span className="pdf-bullet-marker"></span><span>Il pattern di accesso (download diretto di un file con nome <em>aws_credentials.txt</em>) suggerisce <strong>ricerca attiva e targetizzata</strong>, non navigazione casuale.</span></div>
              <div className="pdf-bullet"><span className="pdf-bullet-marker"></span><span>L'azione è coerente con la fase <strong>Post-Exploitation / Credential Access</strong> del kill chain MITRE.</span></div>
              <div className="pdf-bullet"><span className="pdf-bullet-marker"></span><span>L'utente potrebbe essere stato <strong>compromesso da terzi</strong> (account takeover) oppure essere un <strong>insider con intent malevolo</strong>. Audit immediato necessario.</span></div>
            </div>
          </div>

          {token.recommendation && (
            <div className="pdf-section">
              <div className="pdf-section-title">▎ Raccomandazioni urgenti (priorità SOC)</div>
              <div className="pdf-reco-box">
                <ol className="pdf-numlist">
                  <li><strong>Sospensione immediata</strong> dell'account {token.leakedBy} su tutti i sistemi aziendali, in attesa di verifica.</li>
                  <li><strong>Revisione completa attività CloudTrail</strong> dell'utente nelle ultime 30 giornate per identificare eventuali altri pattern sospetti.</li>
                  <li><strong>Reset MFA obbligatorio</strong> e revoca di tutte le sessioni attive.</li>
                  <li><strong>Indagine HR coordinata con legal</strong> entro 48h. Verificare contesto, possibile coercizione o compromissione esterna.</li>
                  <li><strong>Monitoraggio rafforzato 90 giorni</strong> con soglie behavioral abbassate del 70% per questo utente.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="pdf-section">
            <div className="pdf-section-title">▎ Mappatura compliance e tecniche</div>
            <div className="pdf-compliance">
              <div className="pdf-comp-item"><span className="pdf-comp-tag">MITRE</span><span>T1552 Unsecured Credentials · T1078 Valid Accounts</span></div>
              <div className="pdf-comp-item"><span className="pdf-comp-tag">NIS2</span><span>Art. 21 — Misure di rilevamento minacce interne</span></div>
              <div className="pdf-comp-item"><span className="pdf-comp-tag">NIST</span><span>SP 800-184 — Deception &amp; Insider Threat Recovery</span></div>
            </div>
          </div>

          <div className="pdf-signature">
            <div>
              <div className="pdf-sig-label">Analista responsabile</div>
              <div className="pdf-sig-name">SOC Team — Tier 2</div>
            </div>
            <div>
              <div className="pdf-sig-label">Hash documento (SHA-256)</div>
              <div className="pdf-sig-hash mono">2e8f5a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f</div>
            </div>
          </div>

          <div className="pdf-page-footer">
            <span>Pagina 3 di 3</span>
            <span>Generato 14/05/2026 · Cloud Active Defense</span>
          </div>
        </div>
      )}
    </>
  )
}


function PdfNis2() {
  return (
    <>
      {/* PAGINA 1 — COPERTINA */}
      <div className="pdf-page pdf-nis2-cover">
        <div className="pdf-nis2-corp-bar">
          <div className="pdf-nis2-logo">
            <div className="pdf-nis2-logo-mark">ICN</div>
            <div>
              <div className="pdf-nis2-logo-name">ISTITUTO DI CREDITO NAZIONALE</div>
              <div className="pdf-nis2-logo-sub">Sede legale · Via del Corso 412 · 00186 Roma</div>
            </div>
          </div>
        </div>

        <div className="pdf-nis2-cover-body">
          <div className="pdf-nis2-classification">
            <div>UFFICIALE</div>
            <div className="pdf-nis2-classification-sub">USO INTERNO &amp; AUTORITÀ COMPETENTI</div>
          </div>

          <div className="pdf-nis2-cover-meta">Rapporto periodico ai sensi della Direttiva (UE) 2022/2555</div>

          <h1 className="pdf-nis2-cover-title">Rapporto di Conformità<br/>NIS2 — Maggio 2026</h1>

          <div className="pdf-nis2-cover-subtitle">
            Stato delle misure di rilevamento, risposta e ripristino<br/>
            secondo l'art. 21 della Direttiva NIS2 e relativo D.Lgs. 138/2024
          </div>

          <div className="pdf-nis2-cover-grid">
            <div className="pdf-nis2-cover-item">
              <div className="pdf-nis2-cover-label">Periodo di riferimento</div>
              <div className="pdf-nis2-cover-value">01/05/2026 — 31/05/2026</div>
            </div>
            <div className="pdf-nis2-cover-item">
              <div className="pdf-nis2-cover-label">Settore (art. 8)</div>
              <div className="pdf-nis2-cover-value">Bancario · Soggetto essenziale</div>
            </div>
            <div className="pdf-nis2-cover-item">
              <div className="pdf-nis2-cover-label">Codice rapporto</div>
              <div className="pdf-nis2-cover-value mono">NIS2-2026-05-ICN-0017</div>
            </div>
            <div className="pdf-nis2-cover-item">
              <div className="pdf-nis2-cover-label">Stato</div>
              <div className="pdf-nis2-cover-value" style={{color:'#047857'}}>✓ CONFORME</div>
            </div>
          </div>

          <div className="pdf-nis2-cover-issuer">
            <div>
              <div className="pdf-nis2-cover-label">Redatto da</div>
              <div className="pdf-nis2-cover-value">SOC Team — Cloud Active Defense</div>
            </div>
            <div>
              <div className="pdf-nis2-cover-label">Data emissione</div>
              <div className="pdf-nis2-cover-value">14 maggio 2026</div>
            </div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 3 — Copertina</span>
          <span>Documento ufficiale · ICN · NIS2-2026-05</span>
        </div>
      </div>

      {/* PAGINA 2 — SINTESI + KPI + GRAFICI */}
      <div className="pdf-page pdf-nis2">
        <div className="pdf-nis2-runner">ICN · Rapporto NIS2 Maggio 2026 · Pag. 2/3</div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 1</div>
          <div className="pdf-section-title pdf-nis2-title">Sintesi del periodo</div>
          <div className="pdf-nis2-text">
            Nel periodo di riferimento (1–31 maggio 2026), il sistema di rilevamento attivo "Cloud Active Defense" ha registrato complessivamente <strong>43 eventi</strong> di interesse della sicurezza, di cui <strong>2 esfiltrazioni esterne</strong> (Scenario B) e <strong>5 violazioni di honeyfile</strong> (Scenario A). Tutte le esfiltrazioni hanno innescato il protocollo di Auto-Remediation con revoca automatica delle credenziali IAM, completata in tempi medi inferiori ai <strong>3 secondi</strong> dal rilevamento. Nessun dato personale di soggetti terzi risulta compromesso. Si ritiene pertanto adempiuto l'obbligo di notifica preventiva di cui all'art. 23 della Direttiva.
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 2</div>
          <div className="pdf-section-title pdf-nis2-title">Indicatori chiave</div>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-cell pdf-nis2-kpi"><div className="pdf-kpi-cell-label">Eventi totali</div><div className="pdf-kpi-cell-value">43</div></div>
            <div className="pdf-kpi-cell pdf-nis2-kpi"><div className="pdf-kpi-cell-label">Esfiltrazioni</div><div className="pdf-kpi-cell-value" style={{color:'#dc2626'}}>2</div></div>
            <div className="pdf-kpi-cell pdf-nis2-kpi"><div className="pdf-kpi-cell-label">Dwell time medio</div><div className="pdf-kpi-cell-value">1h 12m</div></div>
            <div className="pdf-kpi-cell pdf-nis2-kpi"><div className="pdf-kpi-cell-label">Remediation automatiche</div><div className="pdf-kpi-cell-value" style={{color:'#047857'}}>100%</div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 3</div>
          <div className="pdf-section-title pdf-nis2-title">Distribuzione eventi per categoria</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <div style={{fontSize:11,color:'#475569',marginBottom:8,fontWeight:600}}>Per tipologia</div>
              <div className="pdf-nis2-bar-list">
                <div className="pdf-nis2-bar-row"><span>Honey-Hit</span><div className="pdf-nis2-bar"><div style={{width:'58%',background:'#fbbf24'}}></div></div><span>5</span></div>
                <div className="pdf-nis2-bar-row"><span>Esfiltrazione</span><div className="pdf-nis2-bar"><div style={{width:'25%',background:'#ef4444'}}></div></div><span>2</span></div>
                <div className="pdf-nis2-bar-row"><span>Behavioral</span><div className="pdf-nis2-bar"><div style={{width:'80%',background:'#a78bfa'}}></div></div><span>7</span></div>
                <div className="pdf-nis2-bar-row"><span>Honeytoken</span><div className="pdf-nis2-bar"><div style={{width:'12%',background:'#c084fc'}}></div></div><span>1</span></div>
                <div className="pdf-nis2-bar-row"><span>Download regolari</span><div className="pdf-nis2-bar"><div style={{width:'100%',background:'#34d399'}}></div></div><span>28</span></div>
              </div>
            </div>
            <div>
              <div style={{fontSize:11,color:'#475569',marginBottom:8,fontWeight:600}}>Reparti più esposti</div>
              <div className="pdf-nis2-bar-list">
                <div className="pdf-nis2-bar-row"><span>Amministrazione</span><div className="pdf-nis2-bar"><div style={{width:'72%',background:'#1e3a8a'}}></div></div><span>4</span></div>
                <div className="pdf-nis2-bar-row"><span>IT &amp; Sistemi</span><div className="pdf-nis2-bar"><div style={{width:'54%',background:'#1e3a8a'}}></div></div><span>3</span></div>
                <div className="pdf-nis2-bar-row"><span>HR</span><div className="pdf-nis2-bar"><div style={{width:'36%',background:'#1e3a8a'}}></div></div><span>2</span></div>
                <div className="pdf-nis2-bar-row"><span>Marketing</span><div className="pdf-nis2-bar"><div style={{width:'18%',background:'#1e3a8a'}}></div></div><span>1</span></div>
                <div className="pdf-nis2-bar-row"><span>Direzione</span><div className="pdf-nis2-bar"><div style={{width:'18%',background:'#1e3a8a'}}></div></div><span>1</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 4</div>
          <div className="pdf-section-title pdf-nis2-title">Eventi critici del periodo</div>
          <table className="pdf-table pdf-nis2-table">
            <thead><tr><th>Data</th><th>Tipologia</th><th>Soggetto</th><th>Vettore</th><th>Esito</th></tr></thead>
            <tbody>
              <tr><td>14/05</td><td>Esfiltrazione</td><td>luigi.verdi</td><td>Tor exit · DE</td><td style={{color:'#047857'}}>✓ Remediated</td></tr>
              <tr><td>14/05</td><td>Honeytoken leak</td><td>sara.romano</td><td>Portale int.</td><td style={{color:'#047857'}}>✓ Sospeso</td></tr>
              <tr><td>13/05</td><td>Behavioral burst</td><td>mario.rossi</td><td>10.0.0.15</td><td style={{color:'#b45309'}}>⚠ In review</td></tr>
              <tr><td>08/05</td><td>Off-hours</td><td>paolo.conti</td><td>172.16.0.5</td><td style={{color:'#b45309'}}>⚠ Whitelist</td></tr>
              <tr><td>05/05</td><td>Esfiltrazione</td><td>—</td><td>VPN · NL</td><td style={{color:'#047857'}}>✓ Remediated</td></tr>
            </tbody>
          </table>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 3 — Sintesi e indicatori</span>
          <span>NIS2-2026-05-ICN-0017</span>
        </div>
      </div>

      {/* PAGINA 3 — MAPPATURA CONFORMITÀ + MITRE + FIRMA */}
      <div className="pdf-page pdf-nis2">
        <div className="pdf-nis2-runner">ICN · Rapporto NIS2 Maggio 2026 · Pag. 3/3</div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 5</div>
          <div className="pdf-section-title pdf-nis2-title">Mappatura art. 21 NIS2 — Misure adottate</div>
          <table className="pdf-table pdf-nis2-art21">
            <thead><tr><th>Lett.</th><th>Misura richiesta</th><th>Stato</th></tr></thead>
            <tbody>
              <tr><td>a)</td><td>Politiche analisi dei rischi e sicurezza sistemi informativi</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>b)</td><td>Gestione incidenti (rilevamento, risposta, comunicazione)</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>c)</td><td>Continuità operativa e gestione crisi</td><td><span className="pdf-nis2-status mid">⚠ In miglioramento</span></td></tr>
              <tr><td>d)</td><td>Sicurezza catena di approvvigionamento (chain of trust)</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>e)</td><td>Sicurezza acquisto, sviluppo e manutenzione sistemi</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>f)</td><td>Valutazione efficacia delle misure di gestione del rischio</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>g)</td><td>Pratiche di igiene informatica e formazione</td><td><span className="pdf-nis2-status mid">⚠ In miglioramento</span></td></tr>
              <tr><td>h)</td><td>Crittografia (in particolare cifratura dati)</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>i)</td><td>Sicurezza risorse umane, controllo accessi, gestione asset</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
              <tr><td>j)</td><td>Autenticazione a più fattori e comunicazioni vocali/video cifrate</td><td><span className="pdf-nis2-status ok">✓ Conforme</span></td></tr>
            </tbody>
          </table>
        </div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 6</div>
          <div className="pdf-section-title pdf-nis2-title">Copertura MITRE ATT&amp;CK</div>
          <div className="pdf-mitre-grid">
            <div className="pdf-mitre-cell ok"><div className="pdf-mitre-name">Discovery</div><div className="pdf-mitre-pct">85%</div></div>
            <div className="pdf-mitre-cell ok"><div className="pdf-mitre-name">Credential Access</div><div className="pdf-mitre-pct">78%</div></div>
            <div className="pdf-mitre-cell ok"><div className="pdf-mitre-name">Exfiltration</div><div className="pdf-mitre-pct">82%</div></div>
            <div className="pdf-mitre-cell mid"><div className="pdf-mitre-name">Lateral Movement</div><div className="pdf-mitre-pct">42%</div></div>
            <div className="pdf-mitre-cell mid"><div className="pdf-mitre-name">Persistence</div><div className="pdf-mitre-pct">38%</div></div>
            <div className="pdf-mitre-cell low"><div className="pdf-mitre-name">Initial Access</div><div className="pdf-mitre-pct">15%</div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-nis2-section-num">§ 7</div>
          <div className="pdf-section-title pdf-nis2-title">Allegati al presente rapporto</div>
          <div className="pdf-nis2-attachments">
            <div className="pdf-nis2-attach">📄 Dossier forense — eventi critici del mese (5 file PDF)</div>
            <div className="pdf-nis2-attach">📄 Report incidente DLP — esfiltrazioni (2 file PDF)</div>
            <div className="pdf-nis2-attach">📊 Behavioral analytics — dati grezzi (CSV)</div>
            <div className="pdf-nis2-attach">🔐 Audit trail IAM — registro remediation automatiche (JSON)</div>
          </div>
        </div>

        <div className="pdf-signature pdf-nis2-signature">
          <div>
            <div className="pdf-sig-label">Responsabile della Sicurezza Informatica (CISO)</div>
            <div className="pdf-sig-name">Dott. Massimo Pacillo</div>
            <div className="pdf-nis2-sig-sub">Designato ai sensi dell'art. 21 D.Lgs. 138/2024</div>
          </div>
          <div>
            <div className="pdf-sig-label">Hash SHA-256 documento</div>
            <div className="pdf-sig-hash mono">9b2c5e8f1a4d7b0e3c6f9a2d5b8e1c4f7a0d3b6e9c2f5a8b1d4e7c0f3a6b9e2d</div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 3 di 3 — Conformità e firma</span>
          <span>Documento ufficiale · ICN · NIS2-2026-05</span>
        </div>
      </div>
    </>
  )
}


function PdfBehavioralUser({ user }: { user: any }) {
  // Mock data per ogni user
  const userData: Record<string, any> = {
    'mario.rossi': {
      events30d: 38,
      alertCount: 1,
      mainRule: 'download_burst',
      baseline: 'Reparto IT media: 8 download/giorno',
      personal: 'Media personale: 5.4 download/giorno · picco 12 in 5 minuti il 13/05',
      patternFound: ['Download burst 13/05 alle 13:58 (12 file in 5min)', 'Tutti i file appartengono al reparto IT (zero accessi cross-departmental)', 'Nessun pattern off_hours nelle ultime 4 settimane'],
      recommendation: 'Pattern compatibile con backup batch programmato. Verificare in audizione con il dipendente, valutare aggiunta a whitelist per backup routine.',
      timeline: [
        { date: '13/05', tone: 'critical', label: 'download_burst', detail: '12 file in 5 min · 13:58' },
        { date: '11/05', tone: 'ok', label: 'Download', detail: '4 file regolari · orario lavorativo' },
        { date: '08/05', tone: 'ok', label: 'Download', detail: '6 file regolari' },
        { date: '04/05', tone: 'ok', label: 'Download', detail: '3 file regolari' },
      ],
    },
    'paolo.conti': {
      events30d: 15,
      alertCount: 1,
      mainRule: 'off_hours',
      baseline: 'Direzione media: 2.3 download/giorno · 95% in orario',
      personal: 'Media personale: 0.5 download/giorno · 1 evento off_hours alle 22:35',
      patternFound: ['Download fuori orario il 08/05 alle 22:35 da rete interna', 'File acceduto: documento HR sensibile', 'Pattern unico nelle ultime 8 settimane'],
      recommendation: 'Direttore generale potrebbe legittimamente operare fuori orario. Considerare whitelist account dirigenziali per regola off_hours, oppure mantenere alert ma con severità ridotta.',
      timeline: [
        { date: '08/05', tone: 'medium', label: 'off_hours', detail: 'Download HR alle 22:35' },
        { date: '06/05', tone: 'ok', label: 'Download', detail: '1 file in orario' },
      ],
    },
    'luigi.verdi': {
      events30d: 22,
      alertCount: 0,
      mainRule: 'nessuno',
      baseline: 'Amministrazione media: 3.1 download/giorno',
      personal: 'Media personale: 0.7 download/giorno · nessuna soglia superata',
      patternFound: ['Comportamento regolare', 'Honey-Hit recente sul Bilancio_Riservato — gestito da modulo Honeyfile (vedi dossier dedicato)', 'Pattern di accesso a documenti pertinenti al ruolo Contabile Senior'],
      recommendation: 'Nessuna azione behavioral richiesta. Il caso Honeyfile è tracciato separatamente nel modulo dedicato.',
      timeline: [
        { date: '14/05', tone: 'medium', label: 'Honey-Hit', detail: 'Vedi dossier Honeyfile' },
        { date: '10/05', tone: 'ok', label: 'Download', detail: 'Bilancio Q1 regolare' },
      ],
    },
  }
  const d = userData[user.user] || userData['mario.rossi']
  return (
    <>
      <div className="pdf-page">
        <div className="pdf-watermark">BEHAVIORAL</div>

        <div className="pdf-header behavioral">
          <div className="pdf-header-label">DOSSIER COMPORTAMENTALE DIPENDENTE</div>
          <div className="pdf-header-title">{user.user}</div>
          <div className="pdf-header-meta">
            <span>Rif. <strong>BEH-2026-{user.user.split('.')[0].toUpperCase()}-W19</strong></span>
            <span>·</span>
            <span>Periodo ultimi 30 giorni</span>
            <span>·</span>
            <span className="pdf-classification">USO INTERNO SOC</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Profilo dipendente</div>
          <div className="pdf-profile-row">
            <div className={`pdf-profile-avatar v${user.variant}`}>{user.initials}</div>
            <div className="pdf-profile-data">
              <div className="pdf-profile-name">{user.user}</div>
              <div className="pdf-profile-grid">
                <div><span className="pdf-label">Reparto</span><span className="pdf-value">{user.reparto}</span></div>
                <div><span className="pdf-label">Ruolo</span><span className="pdf-value">{user.ruolo}</span></div>
                <div><span className="pdf-label">Sede</span><span className="pdf-value">{user.sede}</span></div>
                <div><span className="pdf-label">Severity attuale</span><span className="pdf-value" style={{color: user.severity === 'critical' ? '#dc2626' : user.severity === 'medium' ? '#b45309' : '#475569'}}>{user.severity.toUpperCase()}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Score behavioral del periodo</div>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Eventi tracciati 30gg</div><div className="pdf-kpi-cell-value">{d.events30d}</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Alert generati</div><div className="pdf-kpi-cell-value" style={{color: d.alertCount > 0 ? '#dc2626' : '#047857'}}>{d.alertCount}</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Anomaly score</div><div className="pdf-kpi-cell-value">{user.score}</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Regola principale</div><div className="pdf-kpi-cell-value mono" style={{fontSize:14}}>{d.mainRule}</div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Confronto con baseline del reparto</div>
          <div className="pdf-bullets">
            <div className="pdf-bullet"><span className="pdf-bullet-marker"></span><span><strong>Baseline reparto</strong>: {d.baseline}</span></div>
            <div className="pdf-bullet"><span className="pdf-bullet-marker"></span><span><strong>Profilo personale</strong>: {d.personal}</span></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Timeline anomalie (ultimi 30 giorni)</div>
          <div className="pdf-timeline-vertical">
            {d.timeline.map((t: any, i: number) => (
              <div key={i} className="pdf-tv-item">
                <div className={`pdf-tv-dot ${t.tone}`}></div>
                <div className="pdf-tv-body">
                  <div className="pdf-tv-time mono">{t.date}/2026</div>
                  <div className="pdf-tv-text"><strong>{t.label}</strong> · {t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 2 — {user.user}</span>
          <span>Cloud Active Defense · Modulo Behavioral v.2.6</span>
        </div>
      </div>

      <div className="pdf-page">
        <div className="pdf-watermark">BEHAVIORAL</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Pattern identificati dall'analisi</div>
          <div className="pdf-bullets">
            {d.patternFound.map((p: string, i: number) => (
              <div key={i} className="pdf-bullet"><span className="pdf-bullet-marker"></span><span>{p}</span></div>
            ))}
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Conclusioni e raccomandazioni</div>
          <div className="pdf-reco-box">
            <p>{d.recommendation}</p>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Mappatura MITRE ATT&amp;CK</div>
          <div className="pdf-compliance">
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1083</span><span>File and Directory Discovery</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1530</span><span>Data from Cloud Storage Object</span></div>
            <div className="pdf-comp-item"><span className="pdf-comp-tag">T1078</span><span>Valid Accounts</span></div>
          </div>
        </div>

        <div className="pdf-signature">
          <div>
            <div className="pdf-sig-label">Analista responsabile</div>
            <div className="pdf-sig-name">SOC Team — Tier 2</div>
          </div>
          <div>
            <div className="pdf-sig-label">Hash documento (SHA-256)</div>
            <div className="pdf-sig-hash mono">5a7c3e9f2b6d8a1c4e7f0b3d6a9c2e5f8b1d4a7c0e3f6b9d2a5c8e1f4b7d0c3e</div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 2 — {user.user}</span>
          <span>Generato 14/05/2026 · Cloud Active Defense</span>
        </div>
      </div>
    </>
  )
}


function BundlePreview() {
  const files = [
    { icon: '📄', name: 'Rapporto_NIS2_Maggio_2026.pdf', type: 'Report mensile compliance', size: '512 KB', section: 'Compliance' },
    { icon: '🚨', name: 'INC-DLP-2026-0042_luigi.verdi.pdf', type: 'Report incidente esfiltrazione', size: '184 KB', section: 'Incidenti' },
    { icon: '🚨', name: 'INC-DLP-2026-0041_anonimo.pdf', type: 'Report incidente esfiltrazione', size: '176 KB', section: 'Incidenti' },
    { icon: '🔍', name: 'Dossier_Forense_luigi.verdi_14-05.pdf', type: 'Dossier insider threat', size: '156 KB', section: 'Forensi' },
    { icon: '🔍', name: 'Dossier_Forense_sara.romano_14-05.pdf', type: 'Dossier insider threat', size: '148 KB', section: 'Forensi' },
    { icon: '🔍', name: 'Dossier_Forense_anna.bianchi_11-05.pdf', type: 'Dossier insider threat', size: '152 KB', section: 'Forensi' },
    { icon: '📊', name: 'Report_Behavioral_2026-W19.pdf', type: 'Analisi pattern settimanale', size: '298 KB', section: 'Behavioral' },
    { icon: '🔑', name: 'Dossier_Token_aws_credentials.pdf', type: 'Dossier leak credenziali', size: '142 KB', section: 'Honeytoken' },
    { icon: '📈', name: 'behavioral_raw_data.csv', type: 'Dati grezzi behavioral', size: '24 KB', section: 'Dati' },
    { icon: '📋', name: 'iam_audit_trail_maggio_2026.json', type: 'Audit Auto-Remediation', size: '38 KB', section: 'Audit' },
    { icon: '📑', name: 'README.txt', type: 'Indice del bundle', size: '4 KB', section: 'Meta' },
  ]
  const sectionsP1 = ['Compliance', 'Incidenti', 'Forensi']
  const sectionsP2 = ['Behavioral', 'Honeytoken', 'Dati', 'Audit', 'Meta']
  const totalSize = '1.6 MB'

  const renderFolders = (secs: string[]) => secs.map(sec => {
    const items = files.filter(f => f.section === sec)
    if (items.length === 0) return null
    return (
      <div key={sec} className="bundle-folder">
        <div className="bundle-folder-name">📁 {sec}/</div>
        {items.map((f, i) => (
          <div key={i} className="bundle-file">
            <span className="bundle-file-icon">{f.icon}</span>
            <div className="bundle-file-info">
              <div className="bundle-file-name mono">{f.name}</div>
              <div className="bundle-file-type">{f.type}</div>
            </div>
            <div className="bundle-file-size">{f.size}</div>
          </div>
        ))}
      </div>
    )
  })

  return (
    <>
      {/* PAGINA 1 — header + sintesi + prime 3 cartelle */}
      <div className="pdf-page bundle-page">
        <div className="pdf-header bundle">
          <div className="pdf-header-label">BUNDLE COMPLIANCE COMPLETO</div>
          <div className="pdf-header-title">Archivio mensile · Maggio 2026</div>
          <div className="pdf-header-meta">
            <span>Generato il <strong>14/05/2026 — 16:32</strong></span>
            <span>·</span>
            <span>{files.length} file</span>
            <span>·</span>
            <span>{totalSize} totali</span>
            <span>·</span>
            <span className="pdf-classification">ZIP firmato</span>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Sintesi del bundle</div>
          <div className="pdf-summary">
            Questo archivio contiene <strong>tutta la documentazione di compliance e investigazione</strong> prodotta dal sistema Cloud Active Defense durante il mese di maggio 2026. Include il rapporto NIS2 ufficiale, i dossier forensi per ogni incidente, i report comportamentali, i log di audit IAM e i dati grezzi per riproducibilità. L'archivio è firmato digitalmente per garantire integrità e non-ripudio. Destinatari previsti: <strong>CISO, compliance officer, autorità competenti</strong>.
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Contenuto dell'archivio · 1/2</div>
          {renderFolders(sectionsP1)}
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 1 di 3 · Bundle ZIP · Maggio 2026</span>
          <span>Cloud Active Defense · Pacchetto certificato</span>
        </div>
      </div>

      {/* PAGINA 2 — restanti cartelle + KPI + bar chart */}
      <div className="pdf-page bundle-page">
        <div className="pdf-watermark">BUNDLE</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Contenuto dell'archivio · 2/2</div>
          {renderFolders(sectionsP2)}
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Quadro generale del mese</div>
          <div className="pdf-kpi-row">
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Eventi totali</div><div className="pdf-kpi-cell-value">43</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Esfiltrazioni</div><div className="pdf-kpi-cell-value" style={{color:'#dc2626'}}>2</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Honey-hit</div><div className="pdf-kpi-cell-value" style={{color:'#b45309'}}>5</div></div>
            <div className="pdf-kpi-cell"><div className="pdf-kpi-cell-label">Compliance NIS2</div><div className="pdf-kpi-cell-value" style={{color:'#047857'}}>92%</div></div>
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Eventi per tipologia</div>
          <div className="pdf-bar-chart-h">
            <div className="pdf-bar-h-row"><span className="pdf-bar-h-label">Critico</span><div className="pdf-bar-h-track"><div style={{width:'12%',background:'#fb7185'}}>1</div></div></div>
            <div className="pdf-bar-h-row"><span className="pdf-bar-h-label">Alto</span><div className="pdf-bar-h-track"><div style={{width:'36%',background:'#fb923c'}}>3</div></div></div>
            <div className="pdf-bar-h-row"><span className="pdf-bar-h-label">Medio</span><div className="pdf-bar-h-track"><div style={{width:'60%',background:'#f0b429'}}>5</div></div></div>
            <div className="pdf-bar-h-row"><span className="pdf-bar-h-label">Tor/VPN</span><div className="pdf-bar-h-track"><div style={{width:'24%',background:'#c084fc'}}>2</div></div></div>
            <div className="pdf-bar-h-row"><span className="pdf-bar-h-label">Honeytoken</span><div className="pdf-bar-h-track"><div style={{width:'12%',background:'#60a5fa'}}>1</div></div></div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 2 di 3 · Bundle ZIP · Maggio 2026</span>
          <span>Cloud Active Defense · Pacchetto certificato</span>
        </div>
      </div>

      {/* PAGINA 3 — trend storico + catena custodia */}
      <div className="pdf-page bundle-page">
        <div className="pdf-watermark">BUNDLE</div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Trend storico — ultimi 12 mesi</div>
          <div className="pdf-trend-area">
            <PdfTrendArea />
          </div>
        </div>

        <div className="pdf-section">
          <div className="pdf-section-title">▎ Catena di custodia dell'archivio</div>
          <div className="pdf-event-box">
            <div className="pdf-event-row"><span className="pdf-label">Nome archivio</span><span className="pdf-value mono">Bundle_Compliance_Maggio_2026.zip</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Hash SHA-256</span><span className="pdf-value mono" style={{fontSize:9}}>a3b6c9d2e5f8a1b4c7d0e3f6a9c2b5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0b3a6</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Firma digitale</span><span className="pdf-value" style={{color:'#047857'}}>✓ pyHanko · Aurea Capital · RSA-2048</span></div>
            <div className="pdf-event-row"><span className="pdf-label">Marca temporale</span><span className="pdf-value">2026-05-14 16:32:18 UTC+02:00</span></div>
          </div>
        </div>

        <div className="pdf-signature">
          <div>
            <div className="pdf-sig-label">Responsabile compliance</div>
            <div className="pdf-sig-name">CISO — Dott. Massimo Pacillo</div>
          </div>
          <div>
            <div className="pdf-sig-label">Hash bundle (SHA-256)</div>
            <div className="pdf-sig-hash mono">a3b6c9d2e5f8a1b4c7d0e3f6a9c2b5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0b3a6</div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Pagina 3 di 3 · Bundle ZIP · Maggio 2026</span>
          <span>Cloud Active Defense · Pacchetto certificato</span>
        </div>
      </div>
    </>
  )
}

function PdfTrendArea() {
  const months = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D']
  const esfil = [1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 4, 3]
  const honey = [3, 2, 4, 3, 5, 4, 3, 2, 3, 4, 6, 5]
  const max = 7
  const W = 100, H = 70
  const ptsE = esfil.map((v, i) => `${(i / 11) * W},${H - (v / max) * (H - 4) - 2}`).join(' ')
  const ptsH = honey.map((v, i) => `${(i / 11) * W},${H - (v / max) * (H - 4) - 2}`).join(' ')
  const areaE = `${ptsE} ${W},${H} 0,${H}`
  const areaH = `${ptsH} ${W},${H} 0,${H}`
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 110 }}>
        <polygon points={areaH} fill="#60a5fa" opacity="0.18" />
        <polygon points={areaE} fill="#fb7185" opacity="0.22" />
        <polyline points={ptsH} fill="none" stroke="#60a5fa" strokeWidth="0.9" />
        <polyline points={ptsE} fill="none" stroke="#fb7185" strokeWidth="0.9" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 2px 0', fontSize: 9, color: '#78706a' }}>
        {months.map((m, i) => <span key={i}>{m}</span>)}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 3, background: '#60a5fa', borderRadius: 2 }}></span>Honey-hit mensili</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 3, background: '#fb7185', borderRadius: 2 }}></span>Esfiltrazioni mensili</div>
      </div>
    </>
  )
}

function TokenGenerateModal({ onClose, onGenerate }: { onClose: () => void; onGenerate: (type: string, name: string) => void }) {
  const [type, setType] = useState<'aws' | 'env' | 'yaml' | 'ssh'>('aws')
  const tokenTypes = [
    { id: 'aws', label: 'AWS Credentials', desc: 'AKIA + secret key (fake)', file: 'aws_credentials.txt', icon: Icon.file, tone: 'aws' },
    { id: 'env', label: 'Environment file', desc: 'DATABASE_URL, JWT, Stripe keys (fake)', file: '.env.production', icon: Icon.zap, tone: 'env' },
    { id: 'yaml', label: 'DevOps secrets', desc: 'Vault token, K8s cluster token (fake)', file: 'devops_secrets.yaml', icon: Icon.layers, tone: 'yaml' },
    { id: 'ssh', label: 'SSH private key', desc: 'Chiave RSA-2048 con header standard (fake)', file: 'id_rsa_backup', icon: Icon.key, tone: 'ssh' },
  ]
  const selected = tokenTypes.find(t => t.id === type)!
  const [name, setName] = useState(selected.file)
  const [location, setLocation] = useState('Portale aziendale · /credenziali')

  const handleType = (t: 'aws' | 'env' | 'yaml' | 'ssh') => {
    setType(t)
    setName(tokenTypes.find(tt => tt.id === t)!.file)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Genera nuovo Honeytoken</div>
            <div className="modal-sub">Crea una nuova trappola da esporre sul portale aziendale</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <div className="modal-label">1. Tipologia di credenziale</div>
            <div className="token-type-grid">
              {tokenTypes.map(t => (
                <div
                  key={t.id}
                  className={`token-type-card ${type === t.id ? 'selected' : ''}`}
                  onClick={() => handleType(t.id as any)}
                >
                  <div className={`token-icon ${t.tone}`}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="token-type-label">{t.label}</div>
                    <div className="token-type-desc">{t.desc}</div>
                  </div>
                  {type === t.id && <div className="token-type-check">✓</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-label">2. Nome del file (visibile all'attaccante)</div>
            <input className="modal-input mono" value={name} onChange={e => setName(e.target.value)} placeholder="es. aws_credentials.txt" />
          </div>

          <div className="modal-section">
            <div className="modal-label">3. Posizione di esposizione</div>
            <select className="modal-input" value={location} onChange={e => setLocation(e.target.value)}>
              <option>Portale aziendale · /credenziali</option>
              <option>Portale aziendale · /backup</option>
              <option>Portale aziendale · /devops</option>
              <option>S3 bucket pubblico · /docs</option>
            </select>
          </div>

          <div className="info-banner" style={{ marginTop: 16, fontSize: 12 }}>
            💡 Il token verrà generato con valori <strong>fittizi ma realistici</strong> usando il modulo <span className="mono">honeytoken.py</span>. Sarà monitorato automaticamente: ogni accesso scatena un alert con identificazione dell'utente.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn primary" onClick={() => onGenerate(type, name)}>{Icon.key} Genera token</button>
        </div>
      </div>
    </div>
  )
}


interface Doc {
  id: string
  name: string
  format: 'pdf' | 'docx' | 'xlsx' | 'txt'
  kind: 'real' | 'honey' | 'token'
  category: string
  size: string
  modified: string
}

const documents: Doc[] = [
  { id: 'd1', name: 'Bilancio_Riservato_2026.pdf', format: 'pdf', kind: 'honey', category: 'Bilancio', size: '128 KB', modified: '14/05/2026' },
  { id: 'd2', name: 'Progetto_Atlas_Specifiche.pdf', format: 'pdf', kind: 'real', category: 'Progetto IT', size: '256 KB', modified: '12/05/2026' },
  { id: 'd3', name: 'Contratto_Fornitura_Apex_2026.docx', format: 'docx', kind: 'real', category: 'Contratto', size: '96 KB', modified: '10/05/2026' },
  { id: 'd4', name: 'Valutazione_Personale_Q1.docx', format: 'docx', kind: 'honey', category: 'Risorse Umane', size: '72 KB', modified: '08/05/2026' },
  { id: 'd5', name: 'Bilancio_Q1_2026.xlsx', format: 'xlsx', kind: 'real', category: 'Bilancio', size: '184 KB', modified: '14/05/2026' },
  { id: 'd6', name: 'Stipendi_Dirigenza_HONEY.xlsx', format: 'xlsx', kind: 'honey', category: 'Risorse Umane', size: '64 KB', modified: '14/05/2026' },
  { id: 't1', name: 'aws_credentials.txt', format: 'txt', kind: 'token', category: 'Credenziali', size: '4 KB', modified: '01/05/2026' },
  { id: 't2', name: '.env.production', format: 'txt', kind: 'token', category: 'Credenziali', size: '6 KB', modified: '01/05/2026' },
  { id: 't3', name: 'devops_secrets.yaml', format: 'txt', kind: 'token', category: 'Credenziali', size: '5 KB', modified: '03/05/2026' },
  { id: 't4', name: 'id_rsa_backup', format: 'txt', kind: 'token', category: 'Credenziali', size: '3 KB', modified: '03/05/2026' },
]

function DocumentiSection({ onPreview }: { onPreview: (d: Doc) => void }) {
  const grouped = {
    'File aziendali reali': documents.filter(d => d.kind === 'real'),
    'Honeyfile (esche file)': documents.filter(d => d.kind === 'honey'),
    'Honeytoken (esche credenziali)': documents.filter(d => d.kind === 'token'),
  }
  return (
    <>
      <PageHeader title="Documenti generati" breadcrumb={`${documents.length} file totali · ${documents.filter(d=>d.kind==='honey'||d.kind==='token').length} esche attive`} />
      <div className="info-banner" style={{ marginBottom: 16 }}>
        💡 Tutti i file in questa pagina sono <strong>generati dinamicamente</strong> dal modulo <span className="mono">generator.py</span> e <span className="mono">honeytoken.py</span>. I file "reali" contengono dati aziendali plausibili (anche se fittizi) e includono un Web Beacon. Le esche sono indistinguibili dai veri agli occhi di un attaccante. Clicca un file per vedere l'anteprima.
      </div>

      {Object.entries(grouped).map(([groupName, items]) => (
        <div key={groupName} className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-header">
            <div>
              <div className="panel-title">{groupName}</div>
              <div className="panel-sub">{items.length} file</div>
            </div>
          </div>
          <div className="docs-grid">
            {items.map(d => (
              <div key={d.id} className={`doc-card doc-${d.format}`} onClick={() => onPreview(d)}>
                <div className="doc-icon">
                  {d.format === 'pdf' && '📕'}
                  {d.format === 'docx' && '📘'}
                  {d.format === 'xlsx' && '📗'}
                  {d.format === 'txt' && '📄'}
                </div>
                <div className="doc-body">
                  <div className="doc-name mono">{d.name}</div>
                  <div className="doc-meta">{d.category} · {d.size} · {d.modified}</div>
                </div>
                <div className={`doc-badge ${d.kind}`}>
                  {d.kind === 'real' && 'REALE'}
                  {d.kind === 'honey' && 'HONEY'}
                  {d.kind === 'token' && 'TOKEN'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function DocPreview({ doc }: { doc: Doc }) {
  if (doc.format === 'pdf') return <DocPreviewPdf doc={doc} />
  if (doc.format === 'docx') return <DocPreviewDocx doc={doc} />
  if (doc.format === 'xlsx') return <DocPreviewXlsx doc={doc} />
  return <DocPreviewTxt doc={doc} />
}

function DocPreviewPdf({ doc }: { doc: Doc }) {
  if (doc.id === 'd1') return <DocBilancioRiservato />
  return <DocProgettoAtlas />
}

function DocPreviewDocx({ doc }: { doc: Doc }) {
  if (doc.id === 'd3') return <DocContrattoApex />
  return <DocValutazionePersonale />
}

function DocPreviewXlsx({ doc }: { doc: Doc }) {
  if (doc.id === 'd5') return <DocBilancioQ1 />
  return <DocStipendiDirigenza />
}

function DocPreviewTxt({ doc }: { doc: Doc }) {
  const contents: Record<string, { lang: string; text: string }> = {
    't1': { lang: 'aws', text: `[default]
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
region = us-east-1
output = json

# Account: prod-finance-bank-icn
# Last rotated: 2026-04-15
# Owner: devops@icn.it
# Backup credentials — keep secure

[prod-restricted]
aws_access_key_id = AKIAJOSFOXX7EXAMPLE
aws_secret_access_key = bKalrYUtnGFNHL8MDENG/aPxRfiCYBACKUPKEY
region = eu-west-1
mfa_serial = arn:aws:iam::000000000000:mfa/admin

[readonly-audit]
aws_access_key_id = AKIAREADONLYACCESS01
aws_secret_access_key = readonly-secret-for-audit-team-only-x9y8z7
region = eu-central-1`},
    't2': { lang: 'env', text: `# .env.production
# DO NOT COMMIT TO REPOSITORY
# Last updated: 2026-04-22 by devops@icn.it

# Database
DATABASE_URL=postgres://admin:Pr0d_DB_2026!Strong@db-prod-icn.internal:5432/banking_core
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
HSM_PIN=4729-5816-3094-7521`},
    't3': { lang: 'yaml', text: `# devops_secrets.yaml
# Production secrets — Aurea Capital S.p.A.
# Managed by: devops-team
# Last rotation: 2026-04-30

database:
  host: db-prod-icn.internal
  port: 5432
  username: db_admin_prod
  password: pR0d_d4t4b4s3_st70ng_!2026
  ssl_mode: require

vault:
  endpoint: https://vault-prod.icn.local:8200
  token: hvs.esca_honeytoken_non_reale
  approle_id: 5a8b7c6d-3e2f-1a4b-8c9d-5e6f7a8b9c0d
  approle_secret: 4f3e2d1c-9b8a-7c6d-5e4f-3a2b1c0d9e8f

kubernetes:
  cluster: icn-prod-eu-west
  cluster_token: eyJhbGciOiJSUzI1NiIsImtpZCI6IkU0VVZUVjFUVjFTVlpYUjZSV1JGVjFFV1ZGUlhWMU5XVVZSVlRsUlZTRGM2T1RZek1qWXpOVFkwT0RVMU16VTFOakV4TXpReE1qVTFOall6T0RZeE5UWXhNeTAwTW1RM01EZGtNVE0xWlRJM01EYzRZelF6TmpkbU5UbGtOREkz
  namespace: banking-core
  service_account: prod-deployer

api_gateway:
  master_key: ak_prod_8f7c6b5a4d3e2f1a9b8c7d6e5f4a3b2c1d0e9f8a7b6c
  webhook_signing_key: whk_2026_b9a8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9
  rate_limit_token: rlt_prod_8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e

internal_certs:
  ca_root: /etc/ssl/icn-ca-root.pem
  ca_passphrase: "ic3n_p4ssphr4s3_pr0d_v8_keep_rotating"`},
    't4': { lang: 'pem', text: `# id_rsa_backup
# Backup SSH key — devops production access
# Owner: devops@icn.it
# Comment: id_rsa - prod-jumphost-backup

----- CHIAVE RSA DI ESEMPIO -- HONEYTOKEN, NON REALE -----
MIIEpA__esca_honeytoken__chiave_fittizia_troncata_per_sicurezza
__nessun_valore_crittografico_reale__esca_DLP_aurea_capital_2026
----- FINE CHIAVE DI ESEMPIO (HONEYTOKEN) -----`},
  }
  const c = contents[doc.id] || { lang: 'txt', text: doc.name }
  return (
    <div className="txt-viewer">
      <div className="txt-viewer-bar">
        <div className="txt-viewer-controls"><span></span><span></span><span></span></div>
        <div className="txt-viewer-title mono">{doc.name}</div>
        <div className="txt-viewer-meta">{c.lang.toUpperCase()} · {doc.size}</div>
      </div>
      <pre className="txt-viewer-body mono"><code>{c.text}</code></pre>
    </div>
  )
}

// ============ PDF: Bilancio Riservato ============
function DocBilancioRiservato() {
  return (
    <>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">RISERVATO</div>
        <div className="doc-bank-header">
          <div className="doc-bank-logo">
            <div className="doc-bank-mark">ICN</div>
            <div>
              <div className="doc-bank-name">ISTITUTO DI CREDITO NAZIONALE S.p.A.</div>
              <div className="doc-bank-sub">Sede Legale: Via del Corso 412, 00186 Roma · C.F./P.IVA: 12345670019</div>
            </div>
          </div>
          <div className="doc-bank-class">RISERVATO · LIVELLO 3</div>
        </div>

        <h1 className="doc-title-l">Bilancio Trimestrale Riservato</h1>
        <div className="doc-subtitle">Quarto trimestre 2025 · Documento per uso esclusivo della Direzione Generale</div>

        <div className="doc-h2">1. Sintesi finanziaria</div>
        <div className="doc-p">Nel quarto trimestre 2025 l'Istituto ha registrato risultati significativamente superiori alle previsioni di budget, con un margine operativo lordo in crescita del <strong>+12.4%</strong> rispetto al trimestre precedente. Le politiche di contenimento del rischio adottate dal CdA hanno consentito di mantenere il rapporto NPL sotto la soglia del 3.8%, in miglioramento rispetto al 4.1% del Q3.</div>

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

        <div className="pdf-page-footer doc-footer">
          <span>Pagina 1 di 2 · Bilancio Q4 2025 · RISERVATO</span>
          <span>ICN S.p.A. · ad uso esclusivo Direzione Generale</span>
        </div>
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
        <div className="doc-p">La Direzione conferma le previsioni di crescita per il primo trimestre 2026. Si prevede un margine d'intermediazione in linea con il Q4 2025, con possibili upside derivanti dall'effetto a regime delle acquisizioni recenti. I principali rischi sono legati all'evoluzione dei tassi BCE e alla tenuta del mercato del credito alle PMI.</div>

        <div className="doc-h2">7. Approvazioni</div>
        <div className="doc-sig-box">
          <div className="doc-sig-col">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">Dott. Antonio Pacillo</div>
            <div className="doc-sig-role">Amministratore Delegato</div>
          </div>
          <div className="doc-sig-col">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">Dott.ssa Maria Conti</div>
            <div className="doc-sig-role">CFO</div>
          </div>
          <div className="doc-sig-col">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">Dott. Luca Bianchi</div>
            <div className="doc-sig-role">Presidente CdA</div>
          </div>
        </div>

        <div className="doc-disclaimer">Il presente documento contiene informazioni riservate. La diffusione non autorizzata costituisce violazione del Regolamento Interno ICN art. 14 e del D.Lgs. 196/2003 sul trattamento dei dati personali. Classificazione: <strong>RISERVATO LIVELLO 3</strong>.</div>

        <div className="pdf-page-footer doc-footer">
          <span>Pagina 2 di 2 · Bilancio Q4 2025 · RISERVATO</span>
          <span>Documento approvato dal CdA il 18/01/2026</span>
        </div>
      </div>
    </>
  )
}

// ============ PDF: Progetto Atlas ============
function DocProgettoAtlas() {
  return (
    <>
      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">CONFIDENZIALE</div>
        <div className="doc-tech-header">
          <div className="doc-tech-meta">
            <div className="doc-tech-code">PRJ-ATLAS-2026-001</div>
            <div className="doc-tech-status">v 2.3 · Bozza tecnica</div>
          </div>
          <div className="doc-tech-class">CONFIDENZIALE</div>
        </div>

        <h1 className="doc-title-l">Progetto Atlas — Specifiche tecniche</h1>
        <div className="doc-subtitle">Migrazione del sistema core banking su architettura cloud-native ibrida</div>

        <div className="doc-h2">1. Executive summary</div>
        <div className="doc-p">Il Progetto Atlas costituisce la roadmap di trasformazione tecnologica triennale di Aurea Capital S.p.A. (AC). L'obiettivo strategico è migrare l'attuale sistema core banking on-premise verso un'architettura ibrida cloud (AWS EU-West-1 + datacenter Milano), riducendo il TCO del 28% e dimezzando i tempi di recovery in caso di disastro.</div>

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

        <div className="pdf-page-footer doc-footer">
          <span>Pagina 1 di 2 · PRJ-ATLAS-2026-001</span>
          <span>ICN S.p.A. · CONFIDENZIALE</span>
        </div>
      </div>

      <div className="pdf-page doc-pdf">
        <div className="doc-pdf-watermark">CONFIDENZIALE</div>

        <div className="doc-h2">4. Roadmap di implementazione</div>
        <div className="doc-timeline-h">
          <div className="doc-tl-item"><div className="doc-tl-q">Q1<br/>2026</div><div><strong>Fase Foundation</strong><br/><span className="doc-tl-detail">Setup ambienti AWS, IAM, networking. Definizione standard sicurezza.</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q2<br/>2026</div><div><strong>Fase Discovery</strong><br/><span className="doc-tl-detail">Inventario sistemi as-is. Mappatura dipendenze. Pilot di migrazione (servizio autenticazione).</span></div></div>
          <div className="doc-tl-item"><div className="doc-tl-q">Q3<br/>2026</div><div><strong>Fase Migration</strong><br/><span className="doc-tl-detail">Migrazione progressiva dei microservizi non-core (notifiche, reporting, audit).</span></div></div>
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
          <li><strong>Tecnologici</strong>: vendor lock-in AWS. Mitigazione: design multi-cloud-compatible, container-first.</li>
          <li><strong>Regolatori</strong>: conformità NIS2 e DORA. Mitigazione: audit conformità in fase Foundation.</li>
          <li><strong>Operativi</strong>: turnover personale tecnico. Mitigazione: piano formazione + retention bonus.</li>
          <li><strong>Sicurezza</strong>: superficie d'attacco estesa. Mitigazione: Cloud Active Defense (cfr. doc PRJ-CAD-2026).</li>
        </ul>

        <div className="doc-sig-box">
          <div className="doc-sig-col">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">Dott. Massimo Pacillo</div>
            <div className="doc-sig-role">CIO · Project Sponsor</div>
          </div>
          <div className="doc-sig-col">
            <div className="doc-sig-line"></div>
            <div className="doc-sig-name">Dott.ssa Sara Romano</div>
            <div className="doc-sig-role">Architect Lead</div>
          </div>
        </div>

        <div className="pdf-page-footer doc-footer">
          <span>Pagina 2 di 2 · PRJ-ATLAS-2026-001</span>
          <span>Approvato dal Comitato Strategico il 12/05/2026</span>
        </div>
      </div>
    </>
  )
}

// ============ DOCX: Contratto Apex ============
function DocContrattoApex() {
  return (
    <>
      <div className="pdf-page doc-docx">
        <div className="docx-ribbon">
          <div className="docx-ribbon-app">📘 Microsoft Word — Contratto_Fornitura_Apex_2026.docx</div>
        </div>
        <div className="docx-content">
          <h1 className="docx-title">CONTRATTO DI FORNITURA DI SERVIZI</h1>
          <div className="docx-subtitle">Rif. CTR-APX-2026-04217 · stipulato in data 10 maggio 2026</div>

          <div className="docx-section">
            <div className="docx-h">TRA</div>
            <p><strong>ISTITUTO DI CREDITO NAZIONALE S.p.A.</strong>, con sede legale in Roma, Via del Corso 412 — 00186, P. IVA 12345670019, in persona del legale rappresentante <em>pro tempore</em> Dott. Antonio Pacillo, di seguito denominata "<strong>ICN</strong>" o "<strong>Committente</strong>",</p>

            <div className="docx-h">E</div>
            <p><strong>APEX SOLUTIONS S.r.l.</strong>, con sede legale in Milano, Via della Spiga 32 — 20121, P. IVA 09876543210, in persona del legale rappresentante <em>pro tempore</em> Ing. Roberto Apicella, di seguito denominata "<strong>APEX</strong>" o "<strong>Fornitore</strong>",</p>

            <p style={{textAlign:'center',fontStyle:'italic',marginTop:14}}>congiuntamente le "Parti"</p>
          </div>

          <div className="docx-section">
            <div className="docx-h">PREMESSO CHE</div>
            <ul className="docx-bullets">
              <li>ICN intende avvalersi di servizi specialistici di system integration per il proprio Progetto Atlas (Rif. PRJ-ATLAS-2026-001);</li>
              <li>APEX dichiara di possedere le competenze e le certificazioni richieste (AWS Premier Partner, ISO 27001, ISO 9001);</li>
              <li>Le Parti hanno definito termini e condizioni della fornitura come da art. seguenti.</li>
            </ul>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 1 — Oggetto del contratto</div>
            <p>Il Fornitore si impegna a erogare al Committente servizi professionali di consulenza, sviluppo e integrazione di sistemi informatici, secondo le specifiche tecniche di cui all'<em>Allegato A</em>, per un periodo di 36 (trentasei) mesi a decorrere dal 1° giugno 2026.</p>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 2 — Corrispettivo</div>
            <p>Il corrispettivo per la fornitura è stabilito in € 2.450.000 (duemilioniquattrocentocinquantamila/00), oltre IVA, da corrispondersi in 12 rate trimestrali anticipate di € 204.167 ciascuna. Fatturazione il primo giorno lavorativo del trimestre. Pagamento a 60 giorni data fattura, fine mese.</p>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 3 — Livelli di servizio (SLA)</div>
            <table className="docx-table">
              <thead><tr><th>Indicatore</th><th>Soglia</th><th>Penale</th></tr></thead>
              <tbody>
                <tr><td>Tempo di risposta intervento P1</td><td>1 ora</td><td>2% canone mensile</td></tr>
                <tr><td>Tempo di risposta P2</td><td>4 ore</td><td>1% canone mensile</td></tr>
                <tr><td>Disponibilità servizi gestiti</td><td>99.9%</td><td>5% canone mensile</td></tr>
              </tbody>
            </table>
          </div>

          <div className="pdf-page-footer doc-footer">
            <span>Pagina 1 di 2 · CTR-APX-2026-04217</span>
            <span>ICN S.p.A. — APEX SOLUTIONS S.r.l.</span>
          </div>
        </div>
      </div>

      <div className="pdf-page doc-docx">
        <div className="docx-ribbon">
          <div className="docx-ribbon-app">📘 Microsoft Word — Contratto_Fornitura_Apex_2026.docx</div>
        </div>
        <div className="docx-content">
          <div className="docx-section">
            <div className="docx-art">Articolo 4 — Riservatezza e protezione dei dati</div>
            <p>Le Parti si obbligano reciprocamente alla più stretta riservatezza su ogni informazione, documento, dato tecnico o commerciale di cui possano venire a conoscenza in esecuzione del presente contratto. L'obbligo di riservatezza permane anche dopo la cessazione del contratto per un periodo non inferiore a 5 (cinque) anni. Si applicano altresì le disposizioni del GDPR (Reg. UE 2016/679) e del D.Lgs. 196/2003.</p>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 5 — Sicurezza informatica e Direttiva NIS2</div>
            <p>Il Fornitore dichiara di adottare misure tecniche e organizzative conformi alla Direttiva (UE) 2022/2555 (NIS2) e al D.Lgs. 138/2024. In particolare il Fornitore garantisce: gestione vulnerabilità, autenticazione a più fattori, crittografia end-to-end dei dati in transito e a riposo, audit log immutabili conservati 12 mesi.</p>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 6 — Recesso e risoluzione</div>
            <p>Il Committente potrà recedere unilateralmente dal presente contratto con preavviso di 90 giorni in qualsiasi momento. La risoluzione di diritto opera nei casi di: violazione SLA reiterata, comportamenti contrari all'art. 4, ritardi nei pagamenti superiori a 90 giorni, fallimento o procedure concorsuali.</p>
          </div>

          <div className="docx-section">
            <div className="docx-art">Articolo 7 — Foro competente</div>
            <p>Per qualsiasi controversia derivante o connessa al presente contratto è competente in via esclusiva il Foro di Roma. Si conferisce alla Camera di Arbitrato di Milano la facoltà di pronunciarsi su controversie tecniche su istanza congiunta delle Parti.</p>
          </div>

          <div className="docx-section">
            <p>Letto, confermato e sottoscritto in Roma, in data <strong>10 maggio 2026</strong>.</p>
          </div>

          <div className="docx-sig">
            <div className="docx-sig-col">
              <div className="docx-sig-label">Per ICN S.p.A.</div>
              <div className="docx-sig-stamp">
                <div className="docx-sig-line"></div>
                <div className="docx-sig-name">Dott. Antonio Pacillo</div>
                <div className="docx-sig-role">Amministratore Delegato</div>
                <div className="docx-stamp">ICN S.p.A.<br/>TIMBRO</div>
              </div>
            </div>
            <div className="docx-sig-col">
              <div className="docx-sig-label">Per APEX Solutions S.r.l.</div>
              <div className="docx-sig-stamp">
                <div className="docx-sig-line"></div>
                <div className="docx-sig-name">Ing. Roberto Apicella</div>
                <div className="docx-sig-role">Legale rappresentante</div>
                <div className="docx-stamp apex">APEX<br/>S.r.l.</div>
              </div>
            </div>
          </div>

          <div className="pdf-page-footer doc-footer">
            <span>Pagina 2 di 2 · CTR-APX-2026-04217</span>
            <span>Sottoscritto digitalmente ai sensi del DPR 445/2000</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ============ DOCX: Valutazione Personale ============
function DocValutazionePersonale() {
  return (
    <div className="pdf-page doc-docx">
      <div className="docx-ribbon">
        <div className="docx-ribbon-app">📘 Microsoft Word — Valutazione_Personale_Q1.docx</div>
      </div>
      <div className="docx-content">
        <div className="hr-header">
          <div>
            <h1 className="hr-title">Scheda di Valutazione delle Prestazioni</h1>
            <div className="hr-subtitle">Periodo: Q1 2026 (gennaio – marzo)</div>
          </div>
          <div className="hr-meta">
            <div>Rif. <strong>HR-2026-Q1-0418</strong></div>
            <div>Data: 04/04/2026</div>
            <div>Riservato HR</div>
          </div>
        </div>

        <div className="hr-section-title">Dati anagrafici dipendente</div>
        <table className="hr-data-table">
          <tbody>
            <tr><td>Nome e cognome</td><td><strong>Luigi Verdi</strong></td><td>Matricola</td><td><strong>ICN-04217</strong></td></tr>
            <tr><td>Reparto</td><td>Amministrazione</td><td>Sede</td><td>Centrale · Piano 2</td></tr>
            <tr><td>Ruolo</td><td>Contabile Senior</td><td>Anzianità aziendale</td><td>7 anni</td></tr>
            <tr><td>Responsabile</td><td>Dott.ssa Anna Russo</td><td>RAL lorda</td><td>€ 42.500</td></tr>
          </tbody>
        </table>

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
        <div className="hr-comment">Luigi ha dimostrato continuità di rendimento e affidabilità nel trimestre, con risultati particolarmente notevoli nella chiusura del bilancio. Si segnala una leggera resistenza nell'adozione del nuovo software ERP, da migliorare nel prossimo trimestre con affiancamento mirato. Confermato il livello di competenza Senior; valutare promozione a Lead Contabile entro Q3 2026.</div>

        <div className="hr-section-title">Piano di sviluppo Q2 2026</div>
        <ul className="docx-bullets">
          <li>Completare certificazione interna ERP (modulo avanzato)</li>
          <li>Assumere ownership del processo di chiusura mensile</li>
          <li>Partecipare a 2 audit interni come delegato HR-finance</li>
        </ul>

        <div className="hr-signature">
          <div>
            <div className="docx-sig-line"></div>
            <div className="docx-sig-name">Luigi Verdi</div>
            <div className="docx-sig-role">Dipendente · per presa visione</div>
          </div>
          <div>
            <div className="docx-sig-line"></div>
            <div className="docx-sig-name">Dott.ssa Anna Russo</div>
            <div className="docx-sig-role">Responsabile diretto</div>
          </div>
          <div>
            <div className="docx-sig-line"></div>
            <div className="docx-sig-name">Dott.ssa Giulia Ferrari</div>
            <div className="docx-sig-role">HR Manager</div>
          </div>
        </div>

        <div className="pdf-page-footer doc-footer">
          <span>Scheda HR-2026-Q1-0418 · Riservato HR</span>
          <span>Conservazione 5 anni · art. 13 GDPR</span>
        </div>
      </div>
    </div>
  )
}

// ============ XLSX: Bilancio Q1 ============
function DocBilancioQ1() {
  return (
    <div className="xlsx-page">
      <div className="xlsx-ribbon">
        <div className="xlsx-ribbon-app">📗 Microsoft Excel — Bilancio_Q1_2026.xlsx</div>
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
          <thead>
            <tr>
              <th className="xlsx-col-h"></th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="xlsx-row-h">1</td><td colSpan={5} className="xlsx-title-cell"><strong>ISTITUTO DI CREDITO NAZIONALE — Bilancio Q1 2026 (in € migliaia)</strong></td></tr>
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
      <div className="xlsx-status-bar">
        <span>Pronto</span>
        <span>Foglio 1 di 4</span>
        <span>Somma colonna B: 156.420</span>
      </div>
    </div>
  )
}

// ============ XLSX: Stipendi Dirigenza HONEY ============
function DocStipendiDirigenza() {
  return (
    <div className="xlsx-page">
      <div className="xlsx-ribbon">
        <div className="xlsx-ribbon-app">📗 Microsoft Excel — Stipendi_Dirigenza_HONEYFILE.xlsx <span className="xlsx-restricted">🔒 RISERVATO</span></div>
        <div className="xlsx-ribbon-tabs">
          <span className="xlsx-tab active">Compensi 2026</span>
          <span className="xlsx-tab">Bonus annuali</span>
          <span className="xlsx-tab">Benefit</span>
        </div>
      </div>
      <div className="xlsx-formula-bar">
        <div className="xlsx-cell-ref">F15</div>
        <div className="xlsx-cell-eq">=</div>
        <div className="xlsx-cell-formula mono">=SOMMA(F4:F14)</div>
      </div>
      <div className="xlsx-sheet">
        <table className="xlsx-table">
          <thead>
            <tr>
              <th className="xlsx-col-h"></th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
              <th>F</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="xlsx-row-h">1</td><td colSpan={6} className="xlsx-title-cell"><strong>ICN — Compensi Dirigenza · Anno 2026</strong></td></tr>
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
      <div className="xlsx-status-bar">
        <span>Pronto</span>
        <span>Foglio 1 di 3</span>
        <span>Cellule selezionate: 1</span>
      </div>
    </div>
  )
}

// ============ SISTEMA & NOTIFICHE ============
function SistemaSection({ showToast }: { showToast: (m: string) => void }) {
  const [notifLog, setNotifLog] = useState<{ time: string; channel: string; msg: string; status: 'ok' | 'fail' }[]>([
    { time: '15:39:21', channel: 'webhook', msg: 'DLP Alert · REAL_a73a4f46 · 185.220.100.240', status: 'ok' },
    { time: '15:39:21', channel: 'sns', msg: 'DLP Alert · email a security.admin@aureacapital.local', status: 'ok' },
    { time: '14:12:05', channel: 'webhook', msg: 'Honeytoken Leak · aws_credentials.txt · 192.42.116.17', status: 'ok' },
    { time: '11:24:03', channel: 'webhook', msg: 'Honey-Hit · anna.bianchi · Contratto_Fornitura_HONEY.docx', status: 'ok' },
    { time: '09:08:14', channel: 'webhook', msg: 'Behavioral Alert · mario.rossi · download_burst', status: 'fail' },
  ])

  const sendTestWebhook = () => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
    setNotifLog(l => [{ time, channel: 'webhook', msg: 'TEST · invio manuale da Sistema & Notifiche', status: 'ok' }, ...l])
    showToast('Notifica di test inviata al webhook · HTTP 204')
  }

  const sendTestSns = () => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`
    setNotifLog(l => [{ time, channel: 'sns', msg: 'TEST · publish manuale su topic SNS', status: 'ok' }, ...l])
    showToast('Publish SNS di test inviato · MessageId mock-7a3f')
  }

  const components = [
    { name: 'LocalStack S3', status: 'ok' as const, detail: 'company-secure-documents + portale-sicurezza-logs · port 4566' },
    { name: 'API Gateway · radar', status: 'ok' as const, detail: 'In ascolto su :8080 · uptime 4h 23m' },
    { name: 'Lambda · radar function', status: 'ok' as const, detail: 'Deployed · ultima invocazione 15:39:19' },
    { name: 'GeoIP database (MaxMind GeoLite2)', status: 'ok' as const, detail: 'data/geoip/GeoLite2-City.mmdb · 73 MB · agg. 12/05/2026' },
    { name: 'Tor exit nodes list', status: 'ok' as const, detail: '1.218 IP caricati · fonte check.torproject.org · refresh 14/05 06:00' },
    { name: 'Webhook · Discord/Slack', status: 'ok' as const, detail: 'Discord rilevato · ultimo invio HTTP 204 · 15:39:21' },
    { name: 'SNS topic · Allarme-Intrusione-Radar', status: 'warn' as const, detail: 'LocalStack Community · no consegna email reale (fallback webhook)' },
    { name: 'Behavioral scanner', status: 'ok' as const, detail: 'Cron ogni 5 min · ultima esecuzione 15:35:00 · 2 alert generati' },
    { name: 'Auto-Remediation IAM', status: 'ok' as const, detail: 'Abilitata · ruolo target EmployeeRole · 2 revoche oggi' },
  ]

  const config = [
    { key: 'network.internal_ips', value: '192.168.1.50, 10.0.0.15, 172.16.0.5, 127.0.0.1', desc: 'Whitelist rete aziendale' },
    { key: 'company.hq_lat / hq_lon', value: '41.9028 / 12.4964 (Roma)', desc: 'Coordinate HQ per la mappa' },
    { key: 'behavioral.download_burst', value: 'soglia 10 / finestra 5 min', desc: 'Stesso utente > N download in M minuti' },
    { key: 'behavioral.off_hours', value: '08:00 – 19:00', desc: 'Orario considerato lavorativo' },
    { key: 'behavioral.mass_access', value: 'soglia 15 / finestra 30 min', desc: 'Reparto > N download distinti' },
    { key: 'behavioral.recon_pattern', value: 'finestra 10 min', desc: 'Tempo max tra accesso REAL e HONEY' },
    { key: 'remediation.enabled', value: 'true', desc: 'Auto-revoca permessi IAM all\'esfiltrazione' },
    { key: 'remediation.role_to_revoke', value: 'EmployeeRole', desc: 'Ruolo IAM target della revoca' },
  ]

  return (
    <>
      <PageHeader title="Sistema & Notifiche" breadcrumb="Canali di alerting · stato componenti · configurazione runtime (config.yaml)" />

      <div className="sistema-grid">
        {/* === CANALE WEBHOOK === */}
        <div className="sistema-card">
          <div className="sistema-card-h">
            <div className="sistema-card-icon webhook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66 0 1.61 1.31 2.91 2.92 2.91s2.92-1.3 2.92-2.91-1.31-2.92-2.92-2.92z"/></svg>
            </div>
            <div>
              <div className="sistema-card-title">Webhook · canale primario</div>
              <div className="sistema-card-sub">Notifiche real-time verso Discord o Slack via HTTP POST JSON</div>
            </div>
            <span className="sistema-pill ok">ATTIVO</span>
          </div>
          <div className="sistema-rows">
            <div className="sistema-row"><span>URL configurato</span><span className="mono">https://discord.com/api/webhooks/****/****/abc123def456</span></div>
            <div className="sistema-row"><span>Provider rilevato</span><span><span className="sistema-provider discord">Discord</span></span></div>
            <div className="sistema-row"><span>Ultima notifica</span><span className="mono">15:39:21 · HTTP 204 · 142 ms</span></div>
            <div className="sistema-row"><span>Inviate oggi</span><span><strong>17</strong> · <span style={{ color: 'var(--mint)' }}>16 OK</span> · <span style={{ color: 'var(--critical)' }}>1 fallita</span></span></div>
            <div className="sistema-row"><span>Sorgente codice</span><span className="mono">src/radar.py:invia_webhook()</span></div>
          </div>
          <div className="sistema-actions">
            <button className="btn-primary" onClick={sendTestWebhook}>Invia notifica di test</button>
            <button className="btn-ghost" onClick={() => showToast('Apertura config.yaml in editor')}>Modifica URL</button>
          </div>
        </div>

        {/* === CANALE SNS === */}
        <div className="sistema-card">
          <div className="sistema-card-h">
            <div className="sistema-card-icon sns">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </div>
            <div>
              <div className="sistema-card-title">AWS SNS · canale secondario</div>
              <div className="sistema-card-sub">Topic email per notifiche di backup · usato in produzione reale</div>
            </div>
            <span className="sistema-pill warn">LIMITATO</span>
          </div>
          <div className="sistema-rows">
            <div className="sistema-row"><span>Topic ARN</span><span className="mono">arn:aws:sns:us-east-1:000000000000:Allarme-Intrusione-Radar</span></div>
            <div className="sistema-row"><span>Destinatario</span><span className="mono">security.admin@aureacapital.local</span></div>
            <div className="sistema-row"><span>Subscription</span><span><span className="sistema-provider sns-blue">Email · pending</span></span></div>
            <div className="sistema-row"><span>Stato</span><span style={{ color: 'var(--warn)' }}>LocalStack Community non consegna email reali · fallback su webhook</span></div>
            <div className="sistema-row"><span>Sorgente codice</span><span className="mono">setup_sns.py · src/radar.py:invia_allarme_sns()</span></div>
          </div>
          <div className="sistema-actions">
            <button className="btn-primary" onClick={sendTestSns}>Publish di test</button>
            <button className="btn-ghost" onClick={() => showToast('LocalStack non consegna email reali in Community Edition')}>Test consegna email</button>
          </div>
        </div>

        {/* === CANALE EMAIL SMTP (futuro) === */}
        <div className="sistema-card disabled">
          <div className="sistema-card-h">
            <div className="sistema-card-icon smtp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div>
              <div className="sistema-card-title">SMTP diretto · roadmap future work</div>
              <div className="sistema-card-sub">Invio email via SMTP aziendale (Gmail/Postfix) senza dipendenza AWS</div>
            </div>
            <span className="sistema-pill off">NON ATTIVO</span>
          </div>
          <div className="sistema-rows">
            <div className="sistema-row"><span>Stato</span><span>Non implementato — previsto come estensione per deployment self-hosted</span></div>
            <div className="sistema-row"><span>Dipendenze</span><span className="mono">smtplib (stdlib) · ssl context · app password</span></div>
            <div className="sistema-row"><span>Use case</span><span>Aziende senza AWS o con policy "no cloud SaaS" per le notifiche</span></div>
          </div>
        </div>
      </div>

      {/* === STATO COMPONENTI === */}
      <div className="sistema-block">
        <div className="sistema-block-h">
          <div>
            <div className="sistema-block-title">Stato dei componenti</div>
            <div className="sistema-block-sub">Health check in tempo reale · refresh ogni 30 secondi</div>
          </div>
          <span className="sistema-pill ok">9/9 OPERATIVI</span>
        </div>
        <div className="sistema-health">
          {components.map((c, i) => (
            <div key={i} className={`sistema-health-row ${c.status}`}>
              <div className={`sistema-dot ${c.status}`}></div>
              <div className="sistema-health-info">
                <div className="sistema-health-name">{c.name}</div>
                <div className="sistema-health-detail">{c.detail}</div>
              </div>
              <span className={`sistema-pill ${c.status}`}>{c.status === 'ok' ? 'OK' : c.status === 'warn' ? 'LIMITATO' : 'OFF'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === LOG NOTIFICHE === */}
      <div className="sistema-block">
        <div className="sistema-block-h">
          <div>
            <div className="sistema-block-title">Log notifiche · ultime 24h</div>
            <div className="sistema-block-sub">Cronologia degli alert inviati sui canali configurati</div>
          </div>
          <button className="btn-ghost" onClick={() => showToast('Esportazione log notifiche · notifiche_2026-05-14.csv')}>Esporta CSV</button>
        </div>
        <div className="sistema-log">
          {notifLog.map((n, i) => (
            <div key={i} className="sistema-log-row">
              <span className="mono sistema-log-time">{n.time}</span>
              <span className={`sistema-channel-pill ${n.channel}`}>{n.channel.toUpperCase()}</span>
              <span className="sistema-log-msg">{n.msg}</span>
              <span className={`sistema-pill ${n.status === 'ok' ? 'ok' : 'fail'}`}>{n.status === 'ok' ? 'OK' : 'FAIL'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === CONFIG RUNTIME === */}
      <div className="sistema-block">
        <div className="sistema-block-h">
          <div>
            <div className="sistema-block-title">Configurazione runtime</div>
            <div className="sistema-block-sub">Valori attivi · sola lettura · modifica via <code className="mono" style={{ background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 4 }}>config.yaml</code></div>
          </div>
        </div>
        <div className="sistema-config">
          {config.map((c, i) => (
            <div key={i} className="sistema-config-row">
              <div>
                <div className="sistema-config-key mono">{c.key}</div>
                <div className="sistema-config-desc">{c.desc}</div>
              </div>
              <div className="sistema-config-val mono">{c.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
