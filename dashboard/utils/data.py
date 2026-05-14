import json
import os
import sys
import boto3
import pandas as pd
import streamlit as st
from config import CONFIG

_SRC_PATH = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src'))
if _SRC_PATH not in sys.path:
    sys.path.insert(0, _SRC_PATH)
import dwell_time as _dwell_time

_HR_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'hr_data.json')
with open(_HR_PATH, encoding='utf-8') as _f:
    _HR_DB = json.load(_f)


def ottieni_dati_hr(username):
    return _HR_DB.get(username.lower(), {
        "reparto": "Sconosciuto",
        "ruolo": "Non assegnato",
        "rischio": "Non calcolato",
        "sede": "Remoto"
    })


@st.cache_data(ttl=2)
def carica_log_auditing():
    try:
        s3 = boto3.client(
            's3',
            endpoint_url=CONFIG['localstack']['endpoint'],
            region_name=CONFIG['localstack']['region'],
            aws_access_key_id=CONFIG['localstack']['access_key'],
            aws_secret_access_key=CONFIG['localstack']['secret_key'],
        )
        bucket = CONFIG['buckets']['audit_logs']
        response = s3.list_objects_v2(Bucket=bucket)
        logs = []
        raw_logs = []
        if 'Contents' in response:
            for item in response['Contents']:
                if not item['Key'].endswith('.json'):
                    continue
                try:
                    obj = s3.get_object(Bucket=bucket, Key=item['Key'])
                    log = json.loads(obj['Body'].read().decode('utf-8'))
                    raw_logs.append(log)
                    req = log.get('requestParameters', {})
                    nome_doc = req.get('documento', 'Sconosciuto')
                    event_name = log.get('eventName', '')
                    ip_address = log.get('sourceIPAddress', '0.0.0.0')
                    # Nomi file riconosciuti come honeytoken (devono coincidere con
                    # NOMI_HONEYTOKEN in src/generator.py — se aggiungi tipi nuovi
                    # aggiorna entrambi).
                    NOMI_HONEYTOKEN = {
                        'aws_credentials.txt',
                        '.env.production',
                        'devops_secrets.yaml',
                        'id_rsa_backup',
                    }
                    if event_name == 'BehavioralAlert':
                        status = 'Behavioral-Alert'
                        nome_doc = log.get('rule', 'behavioral')
                        ip_address = '[detector]'
                    elif event_name == 'AutoRemediation':
                        status = 'Remediation'
                        nome_doc = '[remediation]'
                        ip_address = '[system]'
                    elif nome_doc in NOMI_HONEYTOKEN:
                        status = 'Honeytoken-Leak'
                    elif 'HONEY' in nome_doc:
                        status = 'Honey-Hit'
                    elif event_name == 'Exfiltration':
                        status = 'Esfiltrazione'
                    else:
                        status = 'Download Regolare'
                    geo = log.get('geo', {'lat': None, 'lon': None})
                    threat = log.get('threat_type', 'normale')
                    logs.append({
                        'utente': log.get('userIdentity', {}).get('userName', 'Sconosciuto'),
                        'file': nome_doc,
                        'ip': ip_address,
                        'ora': log.get('eventTime', 'N/A'),
                        'status': status,
                        'threat': threat,
                        'lat': geo.get('lat'),
                        'lon': geo.get('lon'),
                    })
                except Exception:
                    pass

        cols = ['utente', 'file', 'ip', 'ora', 'status', 'threat', 'lat', 'lon',
                'dwell_seconds', 'dwell_human']
        df = pd.DataFrame(logs) if logs else pd.DataFrame(columns=cols)
        if not df.empty:
            df = df.sort_values(by='ora', ascending=False).reset_index(drop=True)

        # Calcolo Dwell Time: correla download → esfiltrazione per file
        raw_download = [l for l in raw_logs if l.get('eventName') == 'DownloadDocumento']
        raw_esfil = [l for l in raw_logs if l.get('eventName') == 'Exfiltration']

        mapping_beacon = {}
        try:
            mapping_resp = s3.list_objects_v2(Bucket=bucket, Prefix='beacon_mapping/')
            for item in mapping_resp.get('Contents', []):
                if not item['Key'].endswith('.json'):
                    continue
                try:
                    obj = s3.get_object(Bucket=bucket, Key=item['Key'])
                    m = json.loads(obj['Body'].read().decode('utf-8'))
                    if 'beacon_id' in m and 'file_name' in m:
                        mapping_beacon[m['beacon_id']] = m['file_name']
                except Exception:
                    pass
        except Exception:
            pass

        df['dwell_seconds'] = None
        df['dwell_human'] = None
        dwell_results = _dwell_time.calcola_dwell_times(raw_download, raw_esfil, mapping_beacon)
        for dr in dwell_results:
            mask = (
                (df['status'] == 'Esfiltrazione') &
                (df['file'] == dr['beacon_id']) &
                (df['ora'] == dr['exfiltration_time'])
            )
            df.loc[mask, 'dwell_seconds'] = dr['dwell_seconds']
            df.loc[mask, 'dwell_human'] = dr['dwell_human']

        return df
    except Exception:
        return pd.DataFrame(columns=[
            'utente', 'file', 'ip', 'ora', 'status', 'threat', 'lat', 'lon',
            'dwell_seconds', 'dwell_human',
        ])
