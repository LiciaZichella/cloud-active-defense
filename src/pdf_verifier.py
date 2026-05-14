import io
from asn1crypto import pem as asn1_pem
from asn1crypto import x509 as asn1_x509
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
from pyhanko_certvalidator import ValidationContext


def verifica_firma(pdf_bytes, cert_pem_bytes=None):
    """Verifica la firma di un PDF da bytes.

    Args:
        pdf_bytes: contenuto del PDF come bytes
        cert_pem_bytes: PEM del certificato aziendale da usare come trust root

    Returns:
        dict {status: 'VALID'|'INVALID'|'MISSING', signer: str|None, reason: str}
    """
    try:
        r = PdfFileReader(io.BytesIO(pdf_bytes))
        sigs = r.embedded_signatures
        if not sigs:
            return {
                'status': 'MISSING',
                'signer': None,
                'reason': 'Nessuna firma incorporata nel documento',
            }

        sig = sigs[0]

        vc = _build_validation_context(cert_pem_bytes)
        status = validate_pdf_signature(sig, vc)

        signer_str = None
        if sig.signer_cert is not None:
            try:
                signer_str = sig.signer_cert.subject.human_friendly
            except Exception:
                pass

        if status.trusted and status.bottom_line:
            return {'status': 'VALID', 'signer': signer_str, 'reason': 'Firma valida e integra'}
        return {'status': 'INVALID', 'signer': signer_str, 'reason': 'Firma non valida o documento alterato'}

    except Exception as e:
        return {'status': 'INVALID', 'signer': None, 'reason': f'Errore verifica: {e}'}


def _build_validation_context(cert_pem_bytes):
    if not cert_pem_bytes:
        return ValidationContext()
    try:
        _, _, der = asn1_pem.unarmor(cert_pem_bytes)
        asn1_cert = asn1_x509.Certificate.load(der)
        return ValidationContext(trust_roots=[asn1_cert])
    except Exception:
        return ValidationContext()
