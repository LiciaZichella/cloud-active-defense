import io
from pyhanko.sign import signers
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter


def firma_pdf(percorso_pdf, percorso_cert, percorso_key):
    """Firma in-place un PDF con la chiave privata aziendale.

    Ritorna dict {success: bool, reason: str}.
    """
    try:
        signer = signers.SimpleSigner.load(
            key_file=str(percorso_key),
            cert_file=str(percorso_cert),
        )
        with open(percorso_pdf, 'rb') as f:
            buf = io.BytesIO(f.read())
        out = io.BytesIO()
        w = IncrementalPdfFileWriter(buf)
        signers.sign_pdf(
            w,
            signers.PdfSignatureMetadata(field_name='Firma'),
            signer=signer,
            output=out,
        )
        with open(percorso_pdf, 'wb') as f:
            f.write(out.getvalue())
        return {'success': True, 'reason': 'Firma applicata'}
    except Exception as e:
        return {'success': False, 'reason': str(e)}
