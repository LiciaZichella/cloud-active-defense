import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
import dwell_time


def _dl(user, ts_str, nome):
    return {
        'userIdentity': {'userName': user},
        'eventTime': ts_str,
        'eventName': 'DownloadDocumento',
        'requestParameters': {'documento': nome},
    }


def _esf(beacon_id, ts_str):
    return {
        'eventName': 'Exfiltration',
        'eventTime': ts_str,
        'requestParameters': {'documento': beacon_id},
    }


def test_dwell_time_minuti():
    dl = [_dl('mario.rossi', '2026-01-15 10:00:00', 'doc.pdf')]
    esf = [_esf('bid1', '2026-01-15 10:15:00')]
    result = dwell_time.calcola_dwell_times(dl, esf, {'bid1': 'doc.pdf'})
    assert len(result) == 1
    assert result[0]['dwell_seconds'] == 900
    assert result[0]['dwell_human'] == '15m'


def test_dwell_time_ore():
    dl = [_dl('mario.rossi', '2026-01-15 10:00:00', 'doc.pdf')]
    esf = [_esf('bid2', '2026-01-15 14:30:00')]
    result = dwell_time.calcola_dwell_times(dl, esf, {'bid2': 'doc.pdf'})
    assert len(result) == 1
    assert result[0]['dwell_seconds'] == 16200
    assert result[0]['dwell_human'] == '4h 30m'


def test_dwell_time_giorni():
    dl = [_dl('mario.rossi', '2026-01-12 10:00:00', 'doc.pdf')]
    esf = [_esf('bid3', '2026-01-14 10:00:00')]
    result = dwell_time.calcola_dwell_times(dl, esf, {'bid3': 'doc.pdf'})
    assert len(result) == 1
    assert result[0]['dwell_seconds'] == 172800
    assert result[0]['dwell_human'] == '2d'


def test_dwell_skip_senza_mapping():
    # beacon_id non in mapping e non corrisponde ad alcun download → skip
    esf = [_esf('UNKNOWN_BEACON_XYZ_999', '2026-01-15 10:15:00')]
    result = dwell_time.calcola_dwell_times([], esf, {})
    assert result == []


def test_dwell_skip_senza_download():
    esf = [_esf('bid5', '2026-01-15 10:15:00')]
    result = dwell_time.calcola_dwell_times([], esf, {'bid5': 'doc.pdf'})
    assert result == []


def test_formatta_dwell_human_readable():
    assert dwell_time._formatta_dwell(5400) == '1h 30m'
    assert dwell_time._formatta_dwell(187200) == '2d 4h'
    assert dwell_time._formatta_dwell(65) == '1m 5s'
