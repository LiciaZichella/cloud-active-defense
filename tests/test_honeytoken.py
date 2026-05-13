import os
import sys
import types
import tempfile
from unittest.mock import patch, MagicMock

_mock_config = types.ModuleType('config')
_mock_config.CONFIG = {
    'localstack': {
        'endpoint': 'http://localhost:4566',
        'access_key': 'test',
        'secret_key': 'test',
        'region': 'us-east-1',
    },
    'buckets': {'documents': 'test-docs'},
    'radar': {'url': 'http://localhost:8080'},
}
sys.modules['config'] = _mock_config
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

with patch('boto3.client') as _mock_boto:
    _mock_boto.return_value.create_bucket.return_value = {}
    import honeytoken
    import generator


def test_aws_credentials_formato_akia():
    contenuto = honeytoken.genera_aws_credentials('TOKEN_test123')
    assert 'AKIA' in contenuto
    assert 'aws_access_key_id' in contenuto


def test_env_file_contiene_chiavi_critiche():
    contenuto = honeytoken.genera_env_file('TOKEN_test123')
    assert 'DATABASE_URL' in contenuto
    assert 'JWT_SECRET' in contenuto
    assert 'STRIPE_API_KEY' in contenuto


def test_ssh_key_header_corretti():
    contenuto = honeytoken.genera_ssh_key('TOKEN_test123')
    assert '-----BEGIN RSA PRIVATE KEY-----' in contenuto
    assert '-----END RSA PRIVATE KEY-----' in contenuto


def test_beacon_id_presente_in_tutti():
    beacon_id = 'TOKEN_testbeacon'
    for fn in [honeytoken.genera_aws_credentials, honeytoken.genera_env_file,
               honeytoken.genera_config_devops, honeytoken.genera_ssh_key]:
        assert beacon_id in fn(beacon_id), f"{fn.__name__} non contiene beacon_id"


def test_lotto_genera_n_token():
    src_dir = os.path.dirname(generator.__file__)
    try:
        with patch.object(generator.s3, 'upload_file') as mock_upload:
            generator.genera_lotto(0, 0, n_tokens=3)
        assert mock_upload.call_count == 3
    finally:
        for nome in generator.NOMI_HONEYTOKEN.values():
            p = os.path.join(src_dir, nome)
            if os.path.exists(p):
                os.remove(p)
