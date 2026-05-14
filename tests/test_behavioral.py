import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
import behavioral

HR_DATA = {
    'mario.rossi':    {'reparto': 'IT & Sistemi'},
    'luigi.verdi':    {'reparto': 'Amministrazione'},
    'anna.bianchi':   {'reparto': 'Amministrazione'},
    'giulia.ferrari': {'reparto': 'Amministrazione'},
    'paolo.conti':    {'reparto': 'Amministrazione'},
    'sara.romano':    {'reparto': 'IT & Sistemi'},
}

BASE = datetime(2026, 1, 15, 10, 0, 0)


def _evento(user, ts, nome):
    return {
        'userIdentity': {'userName': user},
        'eventTime': ts.strftime('%Y-%m-%d %H:%M:%S'),
        'eventName': 'DownloadDocumento',
        'requestParameters': {'documento': nome},
    }


def test_download_burst_supera_soglia():
    eventi = [
        _evento('mario.rossi', BASE + timedelta(seconds=i * 20), f'doc_{i}.pdf')
        for i in range(12)
    ]
    alerts = behavioral.regola_download_burst(eventi, soglia_n=10, finestra_min=5)
    assert len(alerts) == 1
    assert alerts[0]['rule'] == 'download_burst'
    assert alerts[0]['severity'] == 'ALTO'


def test_download_burst_sotto_soglia():
    eventi = [
        _evento('mario.rossi', BASE + timedelta(seconds=i * 20), f'doc_{i}.pdf')
        for i in range(5)
    ]
    alerts = behavioral.regola_download_burst(eventi, soglia_n=10, finestra_min=5)
    assert len(alerts) == 0


def test_off_hours_serale():
    ts = datetime(2026, 1, 15, 22, 30, 0)
    eventi = [_evento('luigi.verdi', ts, 'report.pdf')]
    alerts = behavioral.regola_off_hours(eventi, ora_inizio=8, ora_fine=19)
    assert len(alerts) == 1
    assert alerts[0]['rule'] == 'off_hours'
    assert alerts[0]['severity'] == 'MEDIO'


def test_mass_access_reparto():
    dipendenti = ['luigi.verdi', 'anna.bianchi', 'giulia.ferrari', 'paolo.conti']
    eventi = [
        _evento(dipendenti[i % len(dipendenti)],
                BASE + timedelta(seconds=i * 70),
                f'doc_{i}.pdf')
        for i in range(16)
    ]
    alerts = behavioral.regola_mass_access(eventi, HR_DATA, soglia_n=15, finestra_min=30)
    assert len(alerts) == 1
    assert alerts[0]['rule'] == 'mass_access'
    assert alerts[0]['severity'] == 'ALTO'


def test_recon_pattern_honey_dopo_real():
    ts_real  = datetime(2026, 1, 15, 10, 0, 0)
    ts_honey = datetime(2026, 1, 15, 10, 5, 0)
    eventi = [
        _evento('mario.rossi', ts_real,  'contratto_reale.pdf'),
        _evento('mario.rossi', ts_honey, 'HONEY_bilancio.pdf'),
    ]
    alerts = behavioral.regola_recon_pattern(eventi, finestra_min=10)
    assert len(alerts) == 1
    assert alerts[0]['rule'] == 'recon_pattern'
    assert alerts[0]['severity'] == 'CRITICO'


def test_eventi_vuoti_nessun_alert():
    assert behavioral.regola_download_burst([], 10, 5) == []
    assert behavioral.regola_off_hours([], 8, 19) == []
    assert behavioral.regola_mass_access([], HR_DATA, 15, 30) == []
    assert behavioral.regola_recon_pattern([], 10) == []
