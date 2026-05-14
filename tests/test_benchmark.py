"""Test per le funzioni pure di benchmark.py — tutti offline."""
import csv
import io
import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import benchmark


def test_genera_dataset_normale_corretto():
    """Il dataset sintetico produce N eventi tutti nell'orario 9-18."""
    eventi = benchmark.genera_dataset_normale(n=200, seed=7)
    assert len(eventi) == 200
    for e in eventi:
        ts_str = e['eventTime']
        from datetime import datetime
        ts = datetime.strptime(ts_str, '%Y-%m-%d %H:%M:%S')
        assert 9 <= ts.hour < 18, f'Evento fuori orario lavorativo: {ts_str}'
        assert 'userName' in e['userIdentity']
        assert 'documento' in e['requestParameters']


def test_csv_output_schema(tmp_path):
    """Il CSV generato ha esattamente le colonne metric_name, value, unit, notes."""
    csv_path = tmp_path / 'experiment_data.csv'
    righe = [
        {'metric_name': 'cold_time_s', 'value': 0.123, 'unit': 's', 'notes': 'test'},
        {'metric_name': 'warm_time_avg_s', 'value': 0.045, 'unit': 's', 'notes': 'test'},
    ]
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['metric_name', 'value', 'unit', 'notes'])
        writer.writeheader()
        writer.writerows(righe)

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        colonne = reader.fieldnames
        assert colonne == ['metric_name', 'value', 'unit', 'notes']
        lette = list(reader)
    assert len(lette) == 2
    assert lette[0]['metric_name'] == 'cold_time_s'
    assert lette[1]['unit'] == 's'


def test_charts_creati(tmp_path, monkeypatch):
    """I 4 PNG vengono prodotti da genera_grafici (matplotlib mockato)."""
    charts_dir = tmp_path / 'charts'
    charts_dir.mkdir()

    saved_files = []

    class FakeFig:
        def savefig(self, path, **kwargs):
            saved_files.append(str(path))

    fake_fig = FakeFig()
    fake_ax = MagicMock()
    fake_ax.bar.return_value = [MagicMock() for _ in range(5)]
    fake_ax.get_x = MagicMock(return_value=0)

    # Monkeypatch CHARTS_DIR nel modulo benchmark
    monkeypatch.setattr(benchmark, 'CHARTS_DIR', charts_dir)

    import matplotlib.pyplot as plt

    with patch.object(plt, 'subplots', return_value=(fake_fig, fake_ax)), \
         patch.object(plt, 'tight_layout'), \
         patch.object(plt, 'savefig', side_effect=lambda p, **kw: saved_files.append(str(p))), \
         patch.object(plt, 'close'), \
         patch.object(plt, 'xticks'), \
         patch.object(plt, 'style') as mock_style:

        r1 = {'cold_time_s': 0.5, 'warm_time_avg_s': 0.05, 'warm_time_std_s': 0.005}
        r2 = {
            'total_events': 500,
            'total_alerts': 0,
            'alerts_per_rule': {'download_burst': 0, 'off_hours': 0, 'mass_access': 0, 'recon_pattern': 0},
            'false_positive_rate': 0.0,
        }
        r3 = {'avg_with_signature_ms': 350.0, 'avg_without_signature_ms': 5.0, 'signature_overhead_ms': 345.0, 'chiavi_trovate': True}
        r4 = {
            'overall_activation_rate': 0.67,
            'pdf_activation_rate': 0.75,
            'dati_reader': [
                {'reader': 'Adobe Reader DC', 'formato': 'PDF', 'funziona': True},
                {'reader': 'Foxit PDF Reader', 'formato': 'PDF', 'funziona': True},
                {'reader': 'Firefox PDF Viewer', 'formato': 'PDF', 'funziona': True},
                {'reader': 'Microsoft Edge', 'formato': 'PDF', 'funziona': False},
                {'reader': 'Microsoft Word 365', 'formato': 'DOCX', 'funziona': False},
                {'reader': 'Microsoft Excel 365', 'formato': 'XLSX', 'funziona': True},
            ],
        }
        benchmark.genera_grafici(r1, r2, r3, r4)

    nomi_attesi = {'detection_time.png', 'behavioral_false_positives.png',
                   'signature_overhead.png', 'reader_activation.png'}
    nomi_prodotti = {Path(p).name for p in saved_files}
    assert nomi_attesi == nomi_prodotti, f'PNG mancanti: {nomi_attesi - nomi_prodotti}'
