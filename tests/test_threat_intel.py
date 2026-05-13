import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

import threat_intel

_TOR_TESTO = """\
# Commento da ignorare
185.220.100.240
192.42.116.16   # con commento inline
199.249.230.119
"""

_VPN_TESTO = """\
# CIDR VPN
185.159.157.0/24    # ProtonVPN
45.83.91.0/24       # NordVPN
"""


def test_ip_tor_riconosciuto():
    tor_set = threat_intel.parse_tor_nodes(_TOR_TESTO)
    assert threat_intel.classifica_ip('185.220.100.240', tor_set, []) == 'tor'


def test_ip_vpn_in_cidr():
    vpn_ranges = threat_intel.parse_vpn_ranges(_VPN_TESTO)
    assert threat_intel.classifica_ip('185.159.157.100', set(), vpn_ranges) == 'vpn'


def test_ip_normale():
    tor_set = threat_intel.parse_tor_nodes(_TOR_TESTO)
    vpn_ranges = threat_intel.parse_vpn_ranges(_VPN_TESTO)
    assert threat_intel.classifica_ip('8.8.8.8', tor_set, vpn_ranges) == 'normale'


def test_ip_invalido_ritorna_normale():
    assert threat_intel.classifica_ip('not-an-ip', set(), []) == 'normale'


def test_parsing_da_stringa_diretta():
    tor_set = threat_intel.parse_tor_nodes("# header\n185.220.100.240\n  192.42.116.16  \n")
    assert '185.220.100.240' in tor_set
    assert '192.42.116.16' in tor_set
    assert len(tor_set) == 2

    vpn_ranges = threat_intel.parse_vpn_ranges("# header\n185.159.157.0/24    # ProtonVPN\n")
    assert len(vpn_ranges) == 1
    import ipaddress
    assert ipaddress.ip_address('185.159.157.100') in vpn_ranges[0]
