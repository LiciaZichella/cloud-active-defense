"""Test firma digitale e verifica PDF — completamente offline, chiavi temporanee."""
import datetime
import io
import os
import shutil
import sys

import pytest
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas as rl_canvas

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
import pdf_signer
import pdf_verifier
from pyhanko.pdf_utils.reader import PdfFileReader


@pytest.fixture(scope='module')
def firma_setup(tmp_path_factory):
    """Genera chiavi temporanee, un PDF non firmato e una versione firmata."""
    base = tmp_path_factory.mktemp('sig_test')

    # Genera coppia chiave/cert
    k = rsa.generate_private_key(65537, 2048, default_backend())
    subj = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, 'IT'),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'ACME Corp'),
        x509.NameAttribute(NameOID.COMMON_NAME, 'ACME Corp - Cloud Active Defense'),
    ])
    now = datetime.datetime.now(datetime.timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(subj).issuer_name(subj)
        .public_key(k.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + datetime.timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .sign(k, hashes.SHA256(), default_backend())
    )

    key_pem = k.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    )
    cert_pem = cert.public_bytes(serialization.Encoding.PEM)

    key_path = base / 'key.pem'
    cert_path = base / 'cert.pem'
    key_path.write_bytes(key_pem)
    cert_path.write_bytes(cert_pem)

    # Crea PDF non firmato
    unsigned_path = base / 'unsigned.pdf'
    c = rl_canvas.Canvas(str(unsigned_path), pagesize=A4)
    c.drawString(100, 700, 'Test PDF per firma digitale - Cloud Active Defense')
    c.save()
    unsigned_bytes = unsigned_path.read_bytes()

    # Crea copia e firmala
    signed_path = base / 'signed.pdf'
    shutil.copy(str(unsigned_path), str(signed_path))
    result = pdf_signer.firma_pdf(str(signed_path), str(cert_path), str(key_path))
    signed_bytes = signed_path.read_bytes()

    return {
        'key_path': key_path,
        'cert_path': cert_path,
        'cert_pem': cert_pem,
        'unsigned_bytes': unsigned_bytes,
        'signed_bytes': signed_bytes,
        'sign_result': result,
    }


def test_firma_pdf_aggiunge_signature(firma_setup):
    assert firma_setup['sign_result']['success'], firma_setup['sign_result']['reason']
    r = PdfFileReader(io.BytesIO(firma_setup['signed_bytes']))
    assert len(r.embedded_signatures) > 0


def test_verifica_firma_valida(firma_setup):
    result = pdf_verifier.verifica_firma(
        firma_setup['signed_bytes'],
        firma_setup['cert_pem'],
    )
    assert result['status'] == 'VALID', result['reason']
    assert result['signer'] is not None
    assert 'ACME Corp' in result['signer']


def test_verifica_pdf_alterato(firma_setup):
    altered = bytearray(firma_setup['signed_bytes'])
    altered[len(altered) // 4] ^= 0x01  # flip bit in area contenuto firmato
    result = pdf_verifier.verifica_firma(bytes(altered), firma_setup['cert_pem'])
    assert result['status'] == 'INVALID'


def test_verifica_pdf_senza_firma(firma_setup):
    result = pdf_verifier.verifica_firma(firma_setup['unsigned_bytes'], firma_setup['cert_pem'])
    assert result['status'] == 'MISSING'


def test_chain_of_trust_self_signed(firma_setup):
    result = pdf_verifier.verifica_firma(
        firma_setup['signed_bytes'],
        firma_setup['cert_pem'],
    )
    assert result['status'] == 'VALID'
    assert 'ACME Corp - Cloud Active Defense' in result['signer']
