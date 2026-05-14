"""Genera la coppia RSA-2048 + certificato X.509 self-signed aziendale.
Eseguire una volta sola prima di avviare il generatore di documenti."""
import datetime
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

KEY_DIR = Path(__file__).parent / 'data' / 'keys'
KEY_PATH = KEY_DIR / 'acme_private.pem'
CERT_PATH = KEY_DIR / 'acme_cert.pem'

_SUBJECT = [
    x509.NameAttribute(NameOID.COUNTRY_NAME, 'IT'),
    x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'ACME Corp'),
    x509.NameAttribute(NameOID.COMMON_NAME, 'ACME Corp - Cloud Active Defense'),
]


def _stampa_info(cert):
    print(f"    Subject : CN=ACME Corp - Cloud Active Defense, O=ACME Corp, C=IT")
    nb = cert.not_valid_before_utc
    na = cert.not_valid_after_utc
    print(f"    Valido  : {nb.strftime('%Y-%m-%d')} → {na.strftime('%Y-%m-%d')}")
    fp = cert.fingerprint(hashes.SHA256()).hex().upper()
    print(f"    SHA256  : {':'.join(fp[i:i+2] for i in range(0, len(fp), 2))}")


def genera_chiavi():
    KEY_DIR.mkdir(parents=True, exist_ok=True)

    if KEY_PATH.exists() and CERT_PATH.exists():
        print("[*] Chiavi già presenti — skip generazione.")
        cert = x509.load_pem_x509_certificate(CERT_PATH.read_bytes(), default_backend())
        _stampa_info(cert)
        return

    print("[*] Generazione RSA-2048 + X.509 self-signed...")

    k = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend(),
    )
    subj = x509.Name(_SUBJECT)
    now = datetime.datetime.now(datetime.timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(subj)
        .issuer_name(subj)
        .public_key(k.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now)
        .not_valid_after(now + datetime.timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)
        .sign(k, hashes.SHA256(), default_backend())
    )

    KEY_PATH.write_bytes(k.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ))
    CERT_PATH.write_bytes(cert.public_bytes(serialization.Encoding.PEM))

    print(f"[OK] Chiave privata : {KEY_PATH}")
    print(f"[OK] Certificato    : {CERT_PATH}")
    _stampa_info(cert)


if __name__ == '__main__':
    genera_chiavi()
