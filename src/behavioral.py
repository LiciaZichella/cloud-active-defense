from collections import defaultdict
from datetime import datetime


def _parse_ts(s):
    return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')


def regola_download_burst(eventi, soglia_n, finestra_min):
    """Stesso utente: > soglia_n download in finestra_min minuti."""
    alerts = []
    per_user = defaultdict(list)
    for e in eventi:
        user = e.get('userIdentity', {}).get('userName', 'Sconosciuto')
        ts_str = e.get('eventTime', '')
        try:
            ts = _parse_ts(ts_str)
        except (ValueError, TypeError):
            continue
        nome = e.get('requestParameters', {}).get('documento', '')
        per_user[user].append((ts, nome))

    for user, accessi in per_user.items():
        accessi.sort(key=lambda x: x[0])
        in_alert = False
        j = 0
        for i in range(len(accessi)):
            ts_i = accessi[i][0]
            while (ts_i - accessi[j][0]).total_seconds() > finestra_min * 60:
                j += 1
            count = i - j + 1
            if count > soglia_n and not in_alert:
                in_alert = True
                alerts.append({
                    'rule': 'download_burst',
                    'user': user,
                    'count': count,
                    'window_start': accessi[j][0].strftime('%Y-%m-%d %H:%M:%S'),
                    'window_end': ts_i.strftime('%Y-%m-%d %H:%M:%S'),
                    'files': [a[1] for a in accessi[j:i + 1]],
                    'severity': 'ALTO',
                })
            elif count <= soglia_n:
                in_alert = False
    return alerts


def regola_off_hours(eventi, ora_inizio, ora_fine):
    """Download eseguiti fuori dall'orario lavorativo."""
    alerts = []
    for e in eventi:
        ts_str = e.get('eventTime', '')
        try:
            ts = _parse_ts(ts_str)
        except (ValueError, TypeError):
            continue
        if ts.hour < ora_inizio or ts.hour >= ora_fine:
            alerts.append({
                'rule': 'off_hours',
                'user': e.get('userIdentity', {}).get('userName', 'Sconosciuto'),
                'file': e.get('requestParameters', {}).get('documento', ''),
                'ora': ts_str,
                'severity': 'MEDIO',
            })
    return alerts


def regola_mass_access(eventi, hr_data, soglia_n, finestra_min):
    """Stesso reparto: > soglia_n download distinti in finestra_min minuti."""
    alerts = []
    per_reparto = defaultdict(list)
    for e in eventi:
        user = e.get('userIdentity', {}).get('userName', 'Sconosciuto')
        reparto = hr_data.get(user.lower(), {}).get('reparto', 'Sconosciuto')
        ts_str = e.get('eventTime', '')
        try:
            ts = _parse_ts(ts_str)
        except (ValueError, TypeError):
            continue
        nome = e.get('requestParameters', {}).get('documento', '')
        per_reparto[reparto].append((ts, user, nome))

    for reparto, accessi in per_reparto.items():
        accessi.sort(key=lambda x: x[0])
        in_alert = False
        j = 0
        for i in range(len(accessi)):
            ts_i = accessi[i][0]
            while (ts_i - accessi[j][0]).total_seconds() > finestra_min * 60:
                j += 1
            count = i - j + 1
            if count > soglia_n and not in_alert:
                in_alert = True
                window = accessi[j:i + 1]
                alerts.append({
                    'rule': 'mass_access',
                    'reparto': reparto,
                    'count': count,
                    'window_start': accessi[j][0].strftime('%Y-%m-%d %H:%M:%S'),
                    'window_end': ts_i.strftime('%Y-%m-%d %H:%M:%S'),
                    'users': list({a[1] for a in window}),
                    'files': [a[2] for a in window],
                    'severity': 'ALTO',
                })
            elif count <= soglia_n:
                in_alert = False
    return alerts


def regola_recon_pattern(eventi, finestra_min):
    """Honey-touch entro X min da accesso a file reale dello stesso utente."""
    alerts = []
    per_user = defaultdict(list)
    for e in eventi:
        user = e.get('userIdentity', {}).get('userName', 'Sconosciuto')
        ts_str = e.get('eventTime', '')
        try:
            ts = _parse_ts(ts_str)
        except (ValueError, TypeError):
            continue
        nome = e.get('requestParameters', {}).get('documento', '')
        per_user[user].append({'ts': ts, 'nome': nome, 'ts_str': ts_str})

    for user, accessi in per_user.items():
        honey = [a for a in accessi if 'HONEY' in a['nome'].upper()]
        real = [a for a in accessi if 'HONEY' not in a['nome'].upper() and a['nome']]
        for h in honey:
            for r in real:
                diff = (h['ts'] - r['ts']).total_seconds()
                if 0 < diff <= finestra_min * 60:
                    alerts.append({
                        'rule': 'recon_pattern',
                        'user': user,
                        'honey_file': h['nome'],
                        'real_file': r['nome'],
                        'honey_at': h['ts_str'],
                        'real_at': r['ts_str'],
                        'severity': 'CRITICO',
                    })
                    break
    return alerts


def esegui_tutte_le_regole(eventi, hr_data, config):
    """Aggregatore: applica tutte le regole e ritorna tutti gli alert."""
    cfg = config['behavioral']
    return (
        regola_download_burst(
            eventi,
            cfg['download_burst']['soglia_n'],
            cfg['download_burst']['finestra_minuti'],
        ) +
        regola_off_hours(
            eventi,
            cfg['off_hours']['ora_inizio'],
            cfg['off_hours']['ora_fine'],
        ) +
        regola_mass_access(
            eventi,
            hr_data,
            cfg['mass_access']['soglia_n'],
            cfg['mass_access']['finestra_minuti'],
        ) +
        regola_recon_pattern(
            eventi,
            cfg['recon_pattern']['finestra_minuti'],
        )
    )
