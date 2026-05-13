import json
import os
import sys
from unittest.mock import patch, MagicMock

# Env var prima dell'import: radar.py le legge a livello di modulo
os.environ.setdefault('LOCALSTACK_ENDPOINT', 'http://localhost:4566')
os.environ.setdefault('BUCKET_AUDIT_LOGS', 'test-logs')
os.environ.setdefault('SNS_TOPIC_ARN', 'arn:aws:sns:us-east-1:000000000000:test')
os.environ.setdefault('APP_REGION', 'us-east-1')
os.environ.setdefault('INTERNAL_IPS', '192.168.1.1,10.0.0.1,127.0.0.1')
os.environ.setdefault('WEBHOOK_URL', '')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
import radar

IP_INTERNO = '192.168.1.1'
IP_ESTERNO = '203.0.113.88'


def make_event(ip=IP_INTERNO, file_id='doc.pdf', geo_lat=41.9, geo_lon=12.5):
    return {
        'requestContext': {'identity': {'sourceIp': ip}},
        'queryStringParameters': {'file_id': file_id},
        'geoLat': geo_lat,
        'geoLon': geo_lon,
    }


@patch('radar.boto3.client')
def test_ip_interno_nessun_log_esfiltrazione(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    radar.lambda_handler(make_event(ip=IP_INTERNO), None)
    mock_s3.put_object.assert_not_called()


@patch('radar.boto3.client')
def test_ip_esterno_salva_log_s3(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    radar.lambda_handler(make_event(ip=IP_ESTERNO, file_id='segreto.pdf'), None)
    mock_s3.put_object.assert_called_once()
    body = json.loads(mock_s3.put_object.call_args[1]['Body'])
    assert body['eventName'] == 'Exfiltration'
    assert body['sourceIPAddress'] == IP_ESTERNO
    assert body['requestParameters']['documento'] == 'segreto.pdf'


@patch('radar.boto3.client')
def test_file_id_mancante_usa_sconosciuto(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    event = {
        'requestContext': {'identity': {'sourceIp': IP_ESTERNO}},
        'queryStringParameters': {},
        'geoLat': 0.0,
        'geoLon': 0.0,
    }
    radar.lambda_handler(event, None)
    body = json.loads(mock_s3.put_object.call_args[1]['Body'])
    assert body['requestParameters']['documento'] == 'SCONOSCIUTO'


@patch('radar.boto3.client')
def test_coordinate_geo_nel_log(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    radar.lambda_handler(make_event(ip=IP_ESTERNO, geo_lat=48.85, geo_lon=2.35), None)
    body = json.loads(mock_s3.put_object.call_args[1]['Body'])
    assert body['geo']['lat'] == 48.85
    assert body['geo']['lon'] == 2.35


@patch('radar.urllib.request.urlopen')
@patch('radar.boto3.client')
def test_webhook_solo_ip_esterno(mock_boto, mock_urlopen):
    radar.WEBHOOK_URL = 'https://discord.com/api/webhooks/test/token'
    mock_resp = MagicMock()
    mock_resp.status = 204
    mock_resp.__enter__ = lambda s: s
    mock_resp.__exit__ = MagicMock(return_value=False)
    mock_urlopen.return_value = mock_resp

    radar.lambda_handler(make_event(ip=IP_ESTERNO), None)
    assert mock_urlopen.called

    mock_urlopen.reset_mock()
    radar.lambda_handler(make_event(ip=IP_INTERNO), None)
    mock_urlopen.assert_not_called()

    radar.WEBHOOK_URL = ''


@patch('radar.boto3.client')
def test_risposta_http_sempre_200(mock_boto):
    for ip in [IP_INTERNO, IP_ESTERNO]:
        result = radar.lambda_handler(make_event(ip=ip), None)
        assert result['statusCode'] == 200


@patch('radar.boto3.client')
def test_log_contiene_versione_evento(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    radar.lambda_handler(make_event(ip=IP_ESTERNO), None)
    body = json.loads(mock_s3.put_object.call_args[1]['Body'])
    assert body['eventVersion'] == '1.08'


@patch('radar.boto3.client')
def test_log_contiene_threat_type(mock_boto):
    mock_s3 = MagicMock()
    mock_boto.return_value = mock_s3
    radar.lambda_handler(make_event(ip=IP_ESTERNO), None)
    body = json.loads(mock_s3.put_object.call_args[1]['Body'])
    assert 'threat_type' in body
    assert body['threat_type'] == 'normale'