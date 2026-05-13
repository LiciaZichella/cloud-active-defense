import ipaddress
from pathlib import Path

_BASE = Path(__file__).parent.parent / 'data'


def parse_tor_nodes(testo):
    nodes = set()
    for riga in testo.splitlines():
        riga = riga.strip()
        if riga and not riga.startswith('#'):
            nodes.add(riga.split('#')[0].strip())
    return nodes


def parse_vpn_ranges(testo):
    ranges = []
    for riga in testo.splitlines():
        riga = riga.strip()
        if riga and not riga.startswith('#'):
            cidr = riga.split('#')[0].strip()
            try:
                ranges.append(ipaddress.ip_network(cidr, strict=False))
            except ValueError:
                pass
    return ranges


def carica_tor_nodes():
    path = _BASE / 'tor_exit_nodes.txt'
    if not path.exists():
        return set()
    return parse_tor_nodes(path.read_text(encoding='utf-8'))


def carica_vpn_ranges():
    path = _BASE / 'vpn_cidr_ranges.txt'
    if not path.exists():
        return []
    return parse_vpn_ranges(path.read_text(encoding='utf-8'))


def classifica_ip(ip, tor_set, vpn_ranges):
    if ip in tor_set:
        return 'tor'
    try:
        ip_obj = ipaddress.ip_address(ip)
        for rete in vpn_ranges:
            if ip_obj in rete:
                return 'vpn'
    except ValueError:
        pass
    return 'normale'
