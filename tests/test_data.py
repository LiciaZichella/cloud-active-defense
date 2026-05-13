import json
import sys
import types
from unittest.mock import patch, MagicMock

_mock_config = types.ModuleType('config')
_mock_config.CONFIG = {
    'localstack': {
        'endpoint': 'http://localhost:4566',
        'access_key': 'test',
        'secret_key': 'test',
        'region': 'us-east-1',
    },
    'buckets': {'audit_logs': 'test-logs'},
}
sys.modules['config'] = _mock_config

# cache_data pass-through: evita che il decorator avvolga la funzione in un MagicMock
_mock_st = types.ModuleType('streamlit')
def _cache_data_passthrough(**kwargs):
    def decorator(fn):
        return fn
    return decorator
_mock_st.cache_data = _cache_data_passthrough
sys.modules['streamlit'] = _mock_st

import dashboard.utils.data as data_mod


def _make_log(documento, event_name='DownloadDocumento'):
    return json.dumps({
        'eventVersion': '1.0',
        'userIdentity': {'userName': 'anna.bianchi'},
        'eventTime': '2026-01-01 10:00:00',
        'eventName': event_name,
        'sourceIPAddress': '172.16.0.5',
        'requestParameters': {'documento': documento},
        'geo': {'lat': None, 'lon': None},
    }).encode()


def test_honeytoken_classificato_come_leak():
    mock_s3 = MagicMock()
    mock_s3.list_objects_v2.return_value = {
        'Contents': [{'Key': 'cloudtrail_logs/log_test.json'}]
    }
    mock_s3.get_object.return_value = {
        'Body': MagicMock(read=lambda: _make_log('aws_credentials.txt'))
    }

    with patch('dashboard.utils.data.boto3.client', return_value=mock_s3):
        df = data_mod.carica_log_auditing()

    assert not df.empty
    assert df.iloc[0]['status'] == 'Honeytoken-Leak'
