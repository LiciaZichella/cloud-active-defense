import boto3
import json
import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src'))

from config import CONFIG
import behavioral

s3 = boto3.client(
    's3',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region'],
)

BUCKET_LOGS = CONFIG['buckets']['audit_logs']

_HR_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'hr_data.json')
with open(_HR_PATH, encoding='utf-8') as _f:
    HR_DATA = json.load(_f)


def leggi_eventi():
    eventi = []
    response = s3.list_objects_v2(Bucket=BUCKET_LOGS, Prefix='cloudtrail_logs/')
    for item in response.get('Contents', []):
        if not item['Key'].endswith('.json'):
            continue
        try:
            obj = s3.get_object(Bucket=BUCKET_LOGS, Key=item['Key'])
            log = json.loads(obj['Body'].read().decode('utf-8'))
            if log.get('eventName') == 'BehavioralAlert':
                continue
            eventi.append(log)
        except Exception as e:
            print(f"[WARN] Errore lettura {item['Key']}: {e}")
    return eventi


def salva_alert(alert):
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    ts_unique = f"{ts}_{int(time.time() * 1000) % 10000}"
    rule = alert.get('rule', 'unknown')
    user = alert.get('user', alert.get('reparto', 'unknown'))
    key = f"cloudtrail_logs/behavioral_{ts_unique}_{rule}_{user}.json"
    log = {
        "eventVersion": "1.08",
        "eventTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "eventName": "BehavioralAlert",
        "rule": rule,
        "severity": alert.get('severity', 'MEDIO'),
        "userIdentity": {"userName": user},
        "sourceIPAddress": "[detector]",
        "requestParameters": {"documento": f"[{rule}]"},
        "evidence": alert,
    }
    s3.put_object(
        Bucket=BUCKET_LOGS,
        Key=key,
        Body=json.dumps(log),
        ContentType='application/json',
    )
    return key


if __name__ == '__main__':
    print("--- BEHAVIORAL SCAN AVVIATO ---")
    eventi = leggi_eventi()
    print(f"[*] Letti {len(eventi)} eventi da CloudTrail.")

    alerts = behavioral.esegui_tutte_le_regole(eventi, HR_DATA, CONFIG)

    conteggio = {}
    for alert in alerts:
        rule = alert.get('rule', 'unknown')
        conteggio[rule] = conteggio.get(rule, 0) + 1
        try:
            key = salva_alert(alert)
            print(f"[ALERT] {rule.upper()} → {key}")
        except Exception as e:
            print(f"[ERRORE] Impossibile salvare alert: {e}")

    totale = len(alerts)
    dettaglio = ', '.join(f"{r}: {n}" for r, n in conteggio.items())
    print(f"\nGenerati {totale} alert ({dettaglio})")
