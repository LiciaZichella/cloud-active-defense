import json
import sys
import os
from unittest.mock import patch, MagicMock

os.environ.setdefault('LOCALSTACK_ENDPOINT', 'http://localhost:4566')
os.environ.setdefault('BUCKET_AUDIT_LOGS', 'test-logs')
os.environ.setdefault('APP_REGION', 'us-east-1')
os.environ.setdefault('INTERNAL_IPS', '192.168.1.1,10.0.0.1,127.0.0.1')
os.environ.setdefault('WEBHOOK_URL', '')
os.environ.setdefault('REMEDIATION_ENABLED', 'true')
os.environ.setdefault('REMEDIATION_ROLE', 'EmployeeRole')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
import radar

IP_INTERNO = '192.168.1.1'
IP_ESTERNO = '203.0.113.88'


def make_event(ip=IP_INTERNO, file_id='doc.pdf'):
    return {
        'requestContext': {'identity': {'sourceIp': ip}},
        'queryStringParameters': {'file_id': file_id},
        'geoLat': 0.0,
        'geoLon': 0.0,
    }


def test_trova_downloader_via_mapping():
    mock_s3 = MagicMock()
    mapping_bytes = json.dumps({
        "beacon_id": "REAL_abc123",
        "file_name": "Bilancio_Q3.xlsx",
        "generated_at": "2026-01-01 10:00:00",
        "tipo": "REAL"
    }).encode()
    cloudtrail_bytes = json.dumps({
        "userIdentity": {"userName": "mario.rossi"},
        "eventTime": "2026-01-01 11:00:00",
        "requestParameters": {"documento": "Bilancio_Q3.xlsx"}
    }).encode()
    mock_s3.get_object.side_effect = [
        {'Body': MagicMock(read=lambda: mapping_bytes)},
        {'Body': MagicMock(read=lambda: cloudtrail_bytes)},
    ]
    mock_s3.list_objects_v2.return_value = {
        'Contents': [{'Key': 'cloudtrail_logs/log_test.json'}]
    }
    result = radar.trova_downloader('REAL_abc123', mock_s3, 'test-logs')
    assert result == 'mario.rossi'


def test_trova_downloader_no_mapping():
    mock_s3 = MagicMock()
    mock_s3.get_object.side_effect = Exception("NoSuchKey")
    result = radar.trova_downloader('REAL_nonexistent', mock_s3, 'test-logs')
    assert result is None


@patch('radar.boto3.client')
def test_revoca_permessi_chiama_detach_role_policy(mock_boto_client):
    mock_iam = MagicMock()
    mock_s3 = MagicMock()
    mock_boto_client.return_value = mock_iam
    mock_iam.list_attached_role_policies.return_value = {
        'AttachedPolicies': [
            {'PolicyArn': 'arn:aws:iam::000:policy/EmployeeS3Policy', 'PolicyName': 'EmployeeS3Policy'},
        ]
    }
    radar.revoca_permessi_iam('mario.rossi', 'EmployeeRole', 'Test motivo', 'test-logs', mock_s3)
    mock_iam.detach_role_policy.assert_called_once_with(
        RoleName='EmployeeRole',
        PolicyArn='arn:aws:iam::000:policy/EmployeeS3Policy'
    )
    mock_s3.put_object.assert_called_once()


def test_remediation_disabilitato_non_revoca():
    original = radar.REMEDIATION_ENABLED
    radar.REMEDIATION_ENABLED = False
    try:
        with patch('radar.boto3.client') as mock_boto, \
             patch('radar.revoca_permessi_iam') as mock_revoca:
            mock_boto.return_value = MagicMock()
            radar.lambda_handler(make_event(ip=IP_ESTERNO), None)
        mock_revoca.assert_not_called()
    finally:
        radar.REMEDIATION_ENABLED = original
