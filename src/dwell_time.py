from datetime import datetime


def _parse_ts(s):
    return datetime.strptime(s, '%Y-%m-%d %H:%M:%S')


def _formatta_dwell(secondi):
    """Converte secondi in stringa "Xd Yh" / "Xh Ym" / "Xm Ys", omettendo unità a zero."""
    secondi = int(secondi)
    giorni = secondi // 86400
    ore = (secondi % 86400) // 3600
    minuti = (secondi % 3600) // 60
    sec = secondi % 60

    if giorni > 0:
        parts = [f"{giorni}d"]
        if ore > 0:
            parts.append(f"{ore}h")
        return ' '.join(parts)
    if ore > 0:
        parts = [f"{ore}h"]
        if minuti > 0:
            parts.append(f"{minuti}m")
        return ' '.join(parts)
    if minuti > 0:
        parts = [f"{minuti}m"]
        if sec > 0:
            parts.append(f"{sec}s")
        return ' '.join(parts)
    return f"{sec}s"


def calcola_dwell_times(eventi_download, eventi_esfiltrazione, mapping_beacon):
    """
    Correla download e esfiltrazioni per file e calcola il tempo trascorso.

    Args:
        eventi_download: list di dict CloudTrail con eventName='DownloadDocumento'
        eventi_esfiltrazione: list di dict CloudTrail con eventName='Exfiltration'
        mapping_beacon: dict {beacon_id: file_name}

    Returns:
        list di dict con dwell_seconds e dwell_human per ogni esfiltrazione correlata.
    """
    results = []
    for esf in eventi_esfiltrazione:
        beacon_id = esf.get('requestParameters', {}).get('documento', '')
        exfil_time = esf.get('eventTime', '')
        try:
            exfil_ts = _parse_ts(exfil_time)
        except (ValueError, TypeError):
            continue

        # Risolvi beacon_id → file_name; se non in mapping usa beacon_id direttamente
        file_name = mapping_beacon.get(beacon_id, beacon_id)

        # Cerca il download più recente con eventTime <= exfil_ts
        best_dl = None
        best_ts = None
        for dl in eventi_download:
            if dl.get('requestParameters', {}).get('documento', '') != file_name:
                continue
            dl_time = dl.get('eventTime', '')
            try:
                dl_ts = _parse_ts(dl_time)
            except (ValueError, TypeError):
                continue
            if dl_ts > exfil_ts:
                continue
            if best_ts is None or dl_ts > best_ts:
                best_ts = dl_ts
                best_dl = dl

        if best_dl is None:
            continue

        dwell_seconds = int((exfil_ts - best_ts).total_seconds())
        results.append({
            'file_name': file_name,
            'beacon_id': beacon_id,
            'downloader': best_dl.get('userIdentity', {}).get('userName', 'Sconosciuto'),
            'download_time': best_ts.strftime('%Y-%m-%d %H:%M:%S'),
            'exfiltration_time': exfil_time,
            'dwell_seconds': dwell_seconds,
            'dwell_human': _formatta_dwell(dwell_seconds),
        })

    return results
