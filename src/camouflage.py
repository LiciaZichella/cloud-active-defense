import random
from faker import Faker

CATEGORIE = ['contratto', 'bilancio', 'progetto', 'risorse_umane', 'comunicazione']

FORMATO_PER_CATEGORIA = {
    'contratto':     'docx',
    'bilancio':      'xlsx',
    'progetto':      'pdf',
    'risorse_umane': 'docx',
    'comunicazione': 'pdf',
}

_AZIENDE = ['Acme', 'Nexus', 'Sigma', 'Orion', 'Titan', 'Vega', 'Atlas', 'Apex']
_PROGETTI = ['Atlas', 'Sigma', 'Nexus', 'Orion', 'Titan', 'Vega', 'Pyro', 'Helios']


def genera_nome_documento(categoria, formato=None):
    if formato is None:
        formato = FORMATO_PER_CATEGORIA[categoria]
    trimestre = random.choice(['Q1', 'Q2', 'Q3', 'Q4'])
    nomi = {
        'contratto':     f"Contratto_Fornitura_{random.choice(_AZIENDE)}_2026.{formato}",
        'bilancio':      f"Bilancio_{trimestre}_2026.{formato}",
        'progetto':      f"Progetto_{random.choice(_PROGETTI)}_Specifiche.{formato}",
        'risorse_umane': f"Valutazione_Personale_{trimestre}.{formato}",
        'comunicazione': f"Report_Comunicazione_{trimestre}_2026.{formato}",
    }
    return nomi[categoria]


def genera_contenuto_documento(categoria, fake):
    contenuti = {
        'contratto': (
            f"Contratto di fornitura tra {fake.company()} e {fake.company()}.\n"
            f"Data stipula: {fake.date_this_year()}\n"
            f"Valore contratto: € {random.randint(10000, 500000):,}\n"
            f"Referente: {fake.name()}\n"
            f"Durata: 12 mesi con opzione di rinnovo.\n"
            f"Condizioni: pagamento a 30 giorni dalla fattura."
        ),
        'bilancio': (
            f"Rendiconto finanziario del trimestre.\n"
            f"Fatturato: € {random.randint(100000, 5000000):,}\n"
            f"Costi operativi: € {random.randint(50000, 2000000):,}\n"
            f"EBITDA: € {random.randint(20000, 1000000):,}\n"
            f"Approvato da: {fake.name()}\n"
            f"Data approvazione: {fake.date_this_year()}\n"
            f"Prossima revisione: {fake.date_this_year()}"
        ),
        'progetto': (
            f"Specifiche tecniche del progetto.\n"
            f"Responsabile: {fake.name()}\n"
            f"Budget allocato: € {random.randint(50000, 500000):,}\n"
            f"Scadenza: {fake.date_this_year()}\n"
            f"Team: {fake.name()}, {fake.name()}, {fake.name()}.\n"
            f"Milestone: completamento fase alpha entro {fake.date_this_year()}.\n"
            f"Stato: in corso secondo pianificazione."
        ),
        'risorse_umane': (
            f"Valutazione delle performance del personale.\n"
            f"Dipendente: {fake.name()}\n"
            f"Reparto: {fake.job()}\n"
            f"Valutatore: {fake.name()}\n"
            f"Periodo: {fake.date_this_year()} - {fake.date_this_year()}\n"
            f"Punteggio: {random.randint(60, 100)}/100\n"
            f"Note: prestazioni in linea con gli obiettivi aziendali."
        ),
        'comunicazione': (
            f"Report di comunicazione interna.\n"
            f"A: {fake.name()}\n"
            f"Da: {fake.name()}\n"
            f"Oggetto: Aggiornamento strategia Q{random.randint(1, 4)}.\n"
            f"Azienda partner: {fake.company()}\n"
            f"Data: {fake.date_this_year()}\n"
            f"Allegati: {random.randint(1, 5)} documenti riservati."
        ),
    }
    return contenuti[categoria]


def seleziona_autore(hr_data):
    chiave = random.choice(list(hr_data.keys()))
    dip = hr_data[chiave]
    parti = chiave.split('.')
    nome = f"{parti[0].capitalize()} {parti[1].capitalize()}"
    return f"{nome} - {dip['reparto']}"
