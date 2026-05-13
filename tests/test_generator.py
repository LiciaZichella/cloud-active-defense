import os
import sys
import types
import tempfile
from unittest.mock import patch, MagicMock

# Modulo config finto prima dell'import di generator (che esegue boto3 a livello di modulo)
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
    import generator


def _esegui(nome_file, prefisso_id, titolo='Titolo', contenuto='Testo'):
    with tempfile.TemporaryDirectory() as tmpdir:
        mock_canvas = MagicMock()
        with patch('generator.canvas.Canvas', return_value=mock_canvas), \
             patch('os.path.dirname', return_value=tmpdir), \
             patch.object(generator.s3, 'upload_file'):
            generator.crea_e_carica_documento(nome_file, titolo, contenuto, prefisso_id)
    return mock_canvas


def test_beacon_id_univoco():
    c1 = _esegui('a.pdf', 'HONEY')
    c2 = _esegui('b.pdf', 'HONEY')
    id1 = c1.setTitle.call_args[0][0].split('TrackingID:')[1]
    id2 = c2.setTitle.call_args[0][0].split('TrackingID:')[1]
    assert id1 != id2


def test_autore_default_amministrazione():
    c = _esegui('test.pdf', 'HONEY')
    c.setAuthor.assert_called_once_with('Amministrazione')


def test_honeyfile_senza_link_url():
    c = _esegui('honey.pdf', 'HONEY')
    c.linkURL.assert_not_called()


def test_file_reale_con_link_url():
    c = _esegui('real.pdf', 'REAL_DOC')
    c.linkURL.assert_called_once()
    url_arg = c.linkURL.call_args[0][0]
    assert 'http://localhost:8080/radar' in url_arg
    assert 'file_id=' in url_arg


def test_filigrana_visiva():
    c = _esegui('doc.pdf', 'HONEY')
    testi = [call[0][2] for call in c.drawCentredString.call_args_list]
    assert any('RISERVATO' in t for t in testi)


def test_tracking_id_nel_footer():
    c = _esegui('doc.pdf', 'HONEY')
    testi = [str(call) for call in c.drawString.call_args_list]
    assert any('Tracking ID' in t for t in testi)


def test_lotto_genera_n_file():
    nomi = []

    def cattura(nome_file, *args, **kwargs):
        nomi.append(nome_file)

    with patch.object(generator, 'crea_e_carica_documento', side_effect=cattura), \
         patch.object(generator.multi_format, 'crea_documento_docx', side_effect=cattura), \
         patch.object(generator.multi_format, 'crea_documento_xlsx', side_effect=cattura), \
         patch.object(generator, 'crea_e_carica_honeytoken'):
        generator.genera_lotto(2, 1)

    assert len(nomi) == 3


def test_pdf_real_contiene_javascript_beacon():
    from pypdf import PdfReader
    src_dir = os.path.dirname(generator.__file__)
    percorso = os.path.join(src_dir, '_test_beacon.pdf')
    try:
        with patch.object(generator.s3, 'upload_file'):
            generator.crea_e_carica_documento(
                '_test_beacon.pdf', 'Titolo Test', 'Contenuto test', 'REAL'
            )
        reader = PdfReader(percorso)
        root = reader.trailer['/Root']
        # pypdf decodifica le escape ottali — qui leggiamo la stringa JS decodificata
        js_names = root['/Names']['/JavaScript']['/Names']
        action = js_names[1]
        if hasattr(action, 'get_object'):
            action = action.get_object()
        js_code = str(action['/JS'])
        assert 'app.launchURL' in js_code
        assert 'http://localhost:8080/radar' in js_code
    finally:
        if os.path.exists(percorso):
            os.remove(percorso)


def test_pdf_honey_senza_javascript():
    from pypdf import PdfReader
    src_dir = os.path.dirname(generator.__file__)
    percorso = os.path.join(src_dir, '_test_honey.pdf')
    try:
        with patch.object(generator.s3, 'upload_file'):
            generator.crea_e_carica_documento(
                '_test_honey.pdf', 'Titolo Test', 'Contenuto test', 'HONEY'
            )
        reader = PdfReader(percorso)
        root = reader.trailer['/Root']
        # I PDF Honey non devono avere il blocco /JavaScript nel catalog
        has_js = (
            '/Names' in root
            and '/JavaScript' in root.get('/Names', {})
        )
        assert not has_js
    finally:
        if os.path.exists(percorso):
            os.remove(percorso)


def test_nomi_lotto_univoci():
    nomi = []

    def cattura(nome_file, *args, **kwargs):
        nomi.append(nome_file)

    with patch.object(generator, 'crea_e_carica_documento', side_effect=cattura), \
         patch.object(generator.multi_format, 'crea_documento_docx', side_effect=cattura), \
         patch.object(generator.multi_format, 'crea_documento_xlsx', side_effect=cattura), \
         patch.object(generator, 'crea_e_carica_honeytoken'):
        generator.genera_lotto(2, 1)

    assert len(nomi) == 3
    assert len(nomi) == len(set(nomi))
