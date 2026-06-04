"""Accesso ai dati per il backend API — logica pura, NESSUNA dipendenza da Streamlit.

Riusa lo stesso schema di parsing di dashboard/utils/data.py ma produce liste di
dict serializzabili in JSON (niente pandas), così FastAPI può restituirle direttamente.
"""
import json
import os
import socket
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urlparse

import boto3
from botocore.config import Config

# Timeout aggressivi + nessun retry: se LocalStack e' spento/non risponde,
# la chiamata fallisce in ~2s invece di appendersi ~60s sui default di boto3.
_BOTO_CFG = Config(connect_timeout=2, read_timeout=5, retries={'max_attempts': 1})

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_SRC = os.path.join(_ROOT, 'src')
for _p in (_ROOT, _SRC):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from config import CONFIG
import dwell_time as _dwell_time

# DB HR finto (stesso file usato dalla dashboard)
_HR_PATH = os.path.join(_ROOT, 'data', 'hr_data.json')
with open(_HR_PATH, encoding='utf-8') as _f:
    _HR_DB = json.load(_f)

NOMI_HONEYTOKEN = {
    'aws_credentials.txt',
    '.env.production',
    'devops_secrets.yaml',
    'id_rsa_backup',
}


def ottieni_dati_hr(username):
    return _HR_DB.get((username or '').lower(), {
        'reparto': 'Sconosciuto',
        'ruolo': 'Non assegnato',
        'rischio': 'Non calcolato',
        'sede': 'Remoto',
    })


def _s3_client():
    return boto3.client(
        's3',
        endpoint_url=CONFIG['localstack']['endpoint'],
        region_name=CONFIG['localstack']['region'],
        aws_access_key_id=CONFIG['localstack']['access_key'],
        aws_secret_access_key=CONFIG['localstack']['secret_key'],
        config=_BOTO_CFG,
    )


def _localstack_raggiungibile():
    """Pre-check veloce: evita che boto3 si appenda ~60s se LocalStack e' spento.
    Su Windows il connect_timeout di botocore non tronca le connessioni 'filtered',
    mentre un socket Python con settimeout si'."""
    try:
        u = urlparse(CONFIG['localstack']['endpoint'])
        host = u.hostname or '127.0.0.1'
        port = u.port or 4566
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.6)
        try:
            s.connect((host, port))
        finally:
            s.close()
        return True
    except Exception:
        return False


def _classifica(event_name, nome_doc):
    if event_name == 'BehavioralAlert':
        return 'Behavioral-Alert'
    if event_name == 'AutoRemediation':
        return 'Remediation'
    if nome_doc in NOMI_HONEYTOKEN:
        return 'Honeytoken-Leak'
    if 'HONEY' in (nome_doc or ''):
        return 'Honey-Hit'
    if event_name == 'Exfiltration':
        return 'Esfiltrazione'
    return 'Download Regolare'


def carica_eventi():
    """Legge i log di audit da S3 e restituisce (eventi, raw_logs).

    eventi: lista di dict normalizzati (utente, file, ip, ora, status, threat,
    signature, lat, lon, dwell_seconds, dwell_human), ordinata per ora DESC.
    """
    try:
        if not _localstack_raggiungibile():
            return [], []
        s3 = _s3_client()
        bucket = CONFIG['buckets']['audit_logs']
        response = s3.list_objects_v2(Bucket=bucket)
        eventi = []

        def _scarica(key):
            try:
                obj = s3.get_object(Bucket=bucket, Key=key)
                return json.loads(obj['Body'].read().decode('utf-8'))
            except Exception:
                return None

        # Download in parallelo: leggere gli oggetti uno a uno verso LocalStack
        # era lentissimo (~11s). Con i thread scende a ~1-2s (boto3 e' thread-safe).
        keys = [it['Key'] for it in response.get('Contents', [])
                if it['Key'].endswith('.json') and not it['Key'].startswith('beacon_mapping/')]
        with ThreadPoolExecutor(max_workers=16) as ex:
            raw_logs = [l for l in ex.map(_scarica, keys) if l is not None]

        for log in raw_logs:
            req = log.get('requestParameters', {})
            nome_doc = req.get('documento', 'Sconosciuto')
            event_name = log.get('eventName', '')
            ip_address = log.get('sourceIPAddress', '0.0.0.0')
            status = _classifica(event_name, nome_doc)
            if status == 'Behavioral-Alert':
                nome_doc = log.get('rule', 'behavioral')
                ip_address = '[detector]'
            elif status == 'Remediation':
                nome_doc = '[remediation]'
                ip_address = '[system]'
            geo = log.get('geo', {'lat': None, 'lon': None})
            eventi.append({
                'utente': log.get('userIdentity', {}).get('userName', 'Sconosciuto'),
                'file': nome_doc,
                'ip': ip_address,
                'ora': log.get('eventTime', 'N/A'),
                'status': status,
                'threat': log.get('threat_type', 'normale'),
                'signature': log.get('signature_status') if event_name == 'Exfiltration' else None,
                'lat': geo.get('lat'),
                'lon': geo.get('lon'),
                'dwell_seconds': None,
                'dwell_human': None,
            })

        eventi.sort(key=lambda e: e['ora'], reverse=True)

        # Dwell time: correla download -> esfiltrazione
        raw_download = [l for l in raw_logs if l.get('eventName') == 'DownloadDocumento']
        raw_esfil = [l for l in raw_logs if l.get('eventName') == 'Exfiltration']
        mapping_beacon = {}
        try:
            mr = s3.list_objects_v2(Bucket=bucket, Prefix='beacon_mapping/')
            bkeys = [it['Key'] for it in mr.get('Contents', []) if it['Key'].endswith('.json')]
            with ThreadPoolExecutor(max_workers=16) as ex:
                for m in ex.map(_scarica, bkeys):
                    if m and 'beacon_id' in m and 'file_name' in m:
                        mapping_beacon[m['beacon_id']] = m['file_name']
        except Exception:
            pass

        for dr in _dwell_time.calcola_dwell_times(raw_download, raw_esfil, mapping_beacon):
            for ev in eventi:
                if (ev['status'] == 'Esfiltrazione' and ev['file'] == dr['beacon_id']
                        and ev['ora'] == dr['exfiltration_time']):
                    ev['dwell_seconds'] = dr['dwell_seconds']
                    ev['dwell_human'] = dr['dwell_human']

        return eventi, raw_logs
    except Exception:
        return [], []


# ---------------------------------------------------------------------------
# Helper di presentazione
# ---------------------------------------------------------------------------
def _iniziali(nome):
    parti = [p for p in (nome or '').replace('.', ' ').split() if p]
    if not parti:
        return '??'
    if len(parti) == 1:
        return parti[0][:2].upper()
    return (parti[0][0] + parti[1][0]).upper()


def _variant(nome):
    return (sum(ord(c) for c in (nome or 'x')) % 4) + 1


def _severity(ev):
    threat = (ev.get('threat') or '').lower()
    status = ev['status']
    if status == 'Esfiltrazione':
        return 'tor' if threat in ('tor', 'vpn') else 'critical'
    if status == 'Honeytoken-Leak':
        return 'tor' if threat in ('tor', 'vpn') else 'critical'
    if status == 'Behavioral-Alert':
        return 'high'
    if status == 'Honey-Hit':
        return 'medium'
    return 'medium'


_NAV = {
    'Esfiltrazione': 'esfiltrazione',
    'Honeytoken-Leak': 'honeytoken',
    'Behavioral-Alert': 'behavioral',
    'Honey-Hit': 'honeyfile',
    'Remediation': 'esfiltrazione',
    'Download Regolare': 'report',
}


def _solo_ora(ts):
    # "2026-05-14T15:39:19Z" -> "15:39:19"
    if not ts or ts == 'N/A':
        return '--:--:--'
    if 'T' in ts:
        return ts.split('T', 1)[1].rstrip('Z')[:8]
    return ts[:8]


def _overview_da(eventi):
    honey = [e for e in eventi if e['status'] == 'Honey-Hit']
    esfil = [e for e in eventi if e['status'] == 'Esfiltrazione']
    token = [e for e in eventi if e['status'] == 'Honeytoken-Leak']
    behav = [e for e in eventi if e['status'] == 'Behavioral-Alert']

    vitals = max(0, 100 - len(honey) * 5 - len(esfil) * 10)
    allarmi = len(esfil) + len(token) + len(behav)

    # Dwell medio
    dwell_vals = [e['dwell_seconds'] for e in eventi if e.get('dwell_seconds')]
    if dwell_vals:
        media = sum(dwell_vals) / len(dwell_vals)
        h = int(media // 3600)
        m = int((media % 3600) // 60)
        dwell_medio = (f"{h}h {m}m" if h else f"{m}m")
    else:
        dwell_medio = 'n/d'

    # Alert recenti (top 5)
    alert_recenti = []
    for e in eventi[:5]:
        sev = _severity(e)
        if e['status'] == 'Esfiltrazione':
            label = f"{e['file']} · esfiltrazione"
        elif e['status'] == 'Honeytoken-Leak':
            label = f"Honeytoken {e['file']}"
        elif e['status'] == 'Behavioral-Alert':
            label = f"Behavioral: {e['file']}"
        elif e['status'] == 'Honey-Hit':
            label = f"Honey-Hit {e['file']}"
        else:
            label = e['file']
        alert_recenti.append({
            'time': _solo_ora(e['ora']),
            'severity': sev,
            'user': e['utente'],
            'initials': _iniziali(e['utente']),
            'variant': _variant(e['utente']),
            'fileLabel': label,
            'ip': e['ip'],
            'nav': _NAV.get(e['status'], 'report'),
        })

    # Mappa minacce
    hq_lat = CONFIG.get('company', {}).get('hq_lat', 41.9028)
    hq_lon = CONFIG.get('company', {}).get('hq_lon', 12.4964)
    mappa = [{'lat': hq_lat, 'lon': hq_lon, 'tipo': 'hq', 'label': 'HQ Aurea Capital'}]
    for e in esfil + token:
        if e.get('lat') and e.get('lon'):
            tipo = 'tor' if (e.get('threat') or '').lower() in ('tor', 'vpn') else 'esfil'
            mappa.append({'lat': e['lat'], 'lon': e['lon'], 'tipo': tipo,
                          'label': f"{e['utente']} · {e['ip']}"})

    # Severity mix (donut)
    mix = {'critical': 0, 'high': 0, 'medium': 0, 'ok': 0}
    for e in eventi:
        mix[_severity(e)] = mix.get(_severity(e), 0) + 1
    if sum(mix.values()) == 0:
        mix['ok'] = 1

    return {
        'vitalsScore': vitals,
        'allarmiAttivi': allarmi,
        'dwellMedio': dwell_medio,
        'tempoDetection': '2.7',
        'alertRecenti': alert_recenti,
        'mappa': mappa,
        'severityMix': mix,
        'attackActive': len(esfil) > 0,
    }


def get_overview():
    eventi, _ = carica_eventi()
    return _overview_da(eventi)


def _honeyfile_da(eventi):
    """Cronologia Honey-Hit (Scenario A) con dossier HR per ogni evento."""
    honey = [e for e in eventi if e['status'] == 'Honey-Hit']
    alerts = []
    for i, e in enumerate(honey):
        hr = ottieni_dati_hr(e['utente'])
        alerts.append({
            'id': f'h{i + 1}',
            'time': _solo_ora(e['ora']),
            'severity': _severity(e),
            'user': e['utente'],
            'initials': _iniziali(e['utente']),
            'variant': _variant(e['utente']),
            'file': e['file'],
            'ip': e['ip'],
            'reparto': hr.get('reparto', 'Sconosciuto'),
            'ruolo': hr.get('ruolo', 'Non assegnato'),
            'rischio': hr.get('rischio', 'n/d'),
            'sede': hr.get('sede', 'Remoto'),
            'signatureValid': (e.get('signature') in (None, 'VALID')),
        })
    return {'alerts': alerts}


def _esfiltrazione_da(eventi):
    """Eventi di esfiltrazione (Scenario B) con geo, dwell e remediation."""
    esfil = [e for e in eventi if e['status'] == 'Esfiltrazione']
    remediati = any(e['status'] == 'Remediation' for e in eventi)
    events = []
    for i, e in enumerate(esfil):
        threat = (e.get('threat') or 'normale').lower()
        lat, lon = e.get('lat'), e.get('lon')
        if lat and lon:
            city = f"{lat:.2f}, {lon:.2f}"
            country = 'Posizione esterna'
        else:
            city = e['ip']
            country = 'Posizione esterna'
        events.append({
            'id': f'e{i + 1}',
            'time': _solo_ora(e['ora']),
            'city': city,
            'country': country,
            'threat': 'tor' if threat in ('tor', 'vpn') else 'esfil',
            'threatLabel': threat.upper() if threat in ('tor', 'vpn') else 'ESFILTRAZIONE',
            'file': e['file'],
            'user': e['utente'],
            'ip': e['ip'],
            'dwellTime': e.get('dwell_human') or 'n/d',
            'remediated': remediati,
            'lat': lat,
            'lon': lon,
            'signatureValid': (e.get('signature') in (None, 'VALID')),
        })

    hq_lat = CONFIG.get('company', {}).get('hq_lat', 41.9028)
    hq_lon = CONFIG.get('company', {}).get('hq_lon', 12.4964)
    mappa = [{'lat': hq_lat, 'lon': hq_lon, 'tipo': 'hq', 'label': 'HQ Aurea Capital'}]
    for e in esfil:
        if e.get('lat') and e.get('lon'):
            tipo = 'tor' if (e.get('threat') or '').lower() in ('tor', 'vpn') else 'esfil'
            mappa.append({'lat': e['lat'], 'lon': e['lon'], 'tipo': tipo,
                          'label': f"{e['utente']} · {e['ip']}"})
    return {'events': events, 'attackActive': len(esfil) > 0, 'mappa': mappa}


_RULES_CANONICHE = ['download_burst', 'off_hours', 'mass_access', 'recon_pattern']
_RULE_SEV = {'download_burst': 'critical', 'off_hours': 'medium', 'mass_access': 'high', 'recon_pattern': 'tor'}
_RULE_DESC = {
    'download_burst': 'Stesso utente oltre soglia di download in 5 min',
    'off_hours': 'Download fuori orario lavorativo (08-19)',
    'mass_access': 'Accesso massivo dello stesso reparto in 30 min',
    'recon_pattern': 'Honey-touch entro pochi minuti da un file reale',
}


def _behavioral_da(eventi):
    """Analisi comportamentale: rule card, ranking dipendenti, cronologia alert."""
    behav = [e for e in eventi if e['status'] == 'Behavioral-Alert']

    conteggio = {}
    for e in behav:
        conteggio[e['file']] = conteggio.get(e['file'], 0) + 1

    rules = []
    for r in _RULES_CANONICHE:
        c = conteggio.get(r, 0)
        rules.append({'name': r, 'desc': _RULE_DESC.get(r, ''), 'count': c,
                      'fired': c > 0, 'severity': _RULE_SEV.get(r, 'info')})

    per_utente = {}
    for e in behav:
        u = e['utente']
        d = per_utente.setdefault(u, {'count': 0, 'rules': {}})
        d['count'] += 1
        d['rules'][e['file']] = d['rules'].get(e['file'], 0) + 1
    ranking = []
    for u, info in sorted(per_utente.items(), key=lambda x: -x[1]['count']):
        hr = ottieni_dati_hr(u)
        rule_prevalente = max(info['rules'], key=info['rules'].get)
        ranking.append({
            'user': u, 'initials': _iniziali(u), 'variant': _variant(u),
            'reparto': hr.get('reparto', 'Sconosciuto'), 'ruolo': hr.get('ruolo', 'n/d'),
            'sede': hr.get('sede', 'Remoto'), 'rule': rule_prevalente,
            'score': info['count'], 'severity': _RULE_SEV.get(rule_prevalente, 'info'),
        })

    alerts = []
    for e in behav:
        rule = e['file']
        alerts.append({
            'time': _solo_ora(e['ora']), 'rule': rule, 'severity': _RULE_SEV.get(rule, 'info'),
            'user': e['utente'], 'initials': _iniziali(e['utente']), 'variant': _variant(e['utente']),
            'evidenza': _RULE_DESC.get(rule, ''), 'ip': e['ip'],
        })

    return {'rules': rules, 'ranking': ranking, 'alerts': alerts}


# Definizioni dei 4 honeytoken (coincidono con NOMI_HONEYTOKEN e i file generati).
# Lo stato (armed/leaked) viene calcolato dai log: e' "leaked" se qualcuno ha
# avuto accesso al file (evento Honeytoken-Leak).
_TOKEN_DEFS = [
    {'id': 't1', 'tone': 'aws', 'name': 'aws_credentials.txt',
     'desc': 'Chiavi AWS AKIA + secret (esca)',
     'exposes': ['AWS Access Key ID (AKIA...)', 'AWS Secret (40 char)', 'Region us-east-1', 'Account alias "prod-finance"']},
    {'id': 't2', 'tone': 'env', 'name': '.env.production',
     'desc': 'DATABASE_URL, JWT, Stripe (esca)',
     'exposes': ['DATABASE_URL postgres', 'JWT_SECRET (64 char)', 'STRIPE_API_KEY sk_live_*', 'SENDGRID_API_KEY']},
    {'id': 't3', 'tone': 'yaml', 'name': 'devops_secrets.yaml',
     'desc': 'Vault token + K8s cluster token (esca)',
     'exposes': ['Vault token (hvs.*)', 'K8s cluster_token base64', 'DB password admin', 'Host: db-prod.internal']},
    {'id': 't4', 'tone': 'ssh', 'name': 'id_rsa_backup',
     'desc': 'Chiave SSH privata RSA (esca)',
     'exposes': ['RSA Private Key 2048', 'Comment: id_rsa - backup', 'Host inferito da nomenclatura']},
]


def _honeytoken_da(eventi):
    """Stato dei 4 honeytoken: armed di default, leaked se ci sono accessi nei log."""
    leaks = {}
    for e in eventi:
        if e['status'] == 'Honeytoken-Leak':
            leaks.setdefault(e['file'], e)  # eventi ordinati DESC: tiene il piu' recente

    tokens_out = []
    n_leaked = 0
    for d in _TOKEN_DEFS:
        t = dict(d)
        t['created'] = '01/05/2026'
        leak = leaks.get(d['name'])
        if leak:
            n_leaked += 1
            hr = ottieni_dati_hr(leak['utente'])
            t['status'] = 'leaked'
            t['lastCheck'] = 'adesso'
            t['leakedBy'] = leak['utente']
            t['leakedAt'] = _solo_ora(leak['ora'])
            t['leakedIp'] = leak['ip']
            t['reveals'] = (f"{leak['utente']} ({hr.get('reparto', 'n/d')}) ha avuto accesso a credenziali "
                            f"esca di tipo {d['tone'].upper()}: possibile reconnaissance pre-esfiltrazione")
            t['recommendation'] = 'Sospendere account, revisione CloudTrail 30gg, reset MFA obbligatorio'
        else:
            t['status'] = 'armed'
            t['lastCheck'] = 'nessun accesso'
        tokens_out.append(t)
    return {'tokens': tokens_out, 'leaked': n_leaked}


def _report_da(eventi):
    """Aggregazioni per la reportistica: eventi per severity, reparti esposti, compliance."""
    rilevanti = [e for e in eventi if e['status'] in
                 ('Honey-Hit', 'Esfiltrazione', 'Honeytoken-Leak', 'Behavioral-Alert')]

    def _cat(e):
        if e['status'] == 'Honeytoken-Leak':
            return 'honeytoken'
        sev = _severity(e)
        return sev if sev in ('critical', 'high', 'medium', 'tor') else 'medium'

    tipi = {'critical': 0, 'high': 0, 'medium': 0, 'tor': 0, 'honeytoken': 0}
    for e in rilevanti:
        tipi[_cat(e)] = tipi.get(_cat(e), 0) + 1

    rep = {}
    for e in rilevanti:
        u = e['utente'] or ''
        if 'sconosciuto' in u.lower():
            continue
        r = ottieni_dati_hr(u).get('reparto', 'Sconosciuto')
        rep[r] = rep.get(r, 0) + 1
    reparti = [{'reparto': k, 'count': v} for k, v in sorted(rep.items(), key=lambda x: -x[1])][:5]

    n_esfil = sum(1 for e in rilevanti if e['status'] == 'Esfiltrazione')
    n_leak = sum(1 for e in rilevanti if e['status'] == 'Honeytoken-Leak')
    compliance = max(60, 100 - n_esfil * 4 - n_leak * 2)

    return {'eventiPerTipo': tipi, 'repartiEsposti': reparti, 'complianceScore': compliance}


_dash_cache = {'ts': 0.0, 'data': None}


def get_dashboard():
    """Endpoint aggregato: una sola lettura S3 alimenta tutte le sezioni gia' collegate.
    Cache breve (3s) per non rileggere S3 ad ogni richiesta ravvicinata del polling."""
    now = time.time()
    if _dash_cache['data'] is not None and (now - _dash_cache['ts']) < 3:
        return _dash_cache['data']
    eventi, _ = carica_eventi()
    data = {
        'overview': _overview_da(eventi),
        'honeyfile': _honeyfile_da(eventi),
        'esfiltrazione': _esfiltrazione_da(eventi),
        'behavioral': _behavioral_da(eventi),
        'honeytoken': _honeytoken_da(eventi),
        'report': _report_da(eventi),
    }
    _dash_cache['data'] = data
    _dash_cache['ts'] = now
    return data
