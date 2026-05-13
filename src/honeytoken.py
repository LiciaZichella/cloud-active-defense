"""ATTENZIONE: tutti i valori generati sono FAKE e non funzionanti,
pensati esclusivamente come esca per attaccanti (honeytoken)."""

import random
import string
import secrets


def genera_aws_credentials(beacon_id):
    akia_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))
    access_key = f"AKIA{akia_suffix}"
    secret_chars = string.ascii_letters + string.digits + '/+'
    secret_key = ''.join(random.choices(secret_chars, k=40))
    return (
        f"[default]\n"
        f"aws_access_key_id = {access_key}\n"
        f"aws_secret_access_key = {secret_key}\n"
        f"region = us-east-1\n"
        f"# Account: prod-finance-{beacon_id}"
    )


def genera_env_file(beacon_id):
    db_password = secrets.token_hex(16)
    db_host = f"db-prod-{secrets.token_hex(4)}.internal"
    redis_password = secrets.token_hex(12)
    jwt_secret = secrets.token_hex(32)
    stripe_suffix = secrets.token_urlsafe(32)
    sg_key = f"SG.{secrets.token_urlsafe(22)}.{secrets.token_urlsafe(43)}"
    return (
        f"DATABASE_URL=postgres://admin:{db_password}@{db_host}:5432/production\n"
        f"REDIS_URL=redis://:{redis_password}@redis-prod.internal:6379/0\n"
        f"JWT_SECRET={jwt_secret}\n"
        f"STRIPE_API_KEY=sk_live_{stripe_suffix}\n"
        f"SENDGRID_API_KEY={sg_key}\n"
        f"# Honeytoken ID: {beacon_id}"
    )


def genera_config_devops(beacon_id):
    db_password = secrets.token_hex(16)
    vault_token = f"hvs.{secrets.token_urlsafe(43)}"
    k8s_token = secrets.token_urlsafe(86)
    return (
        f"# generated for {beacon_id}\n"
        f"database:\n"
        f"  host: db-prod.internal\n"
        f"  port: 5432\n"
        f"  password: {db_password}\n"
        f"vault:\n"
        f"  token: {vault_token}\n"
        f"kubernetes:\n"
        f"  cluster_token: {k8s_token}\n"
    )


def genera_ssh_key(beacon_id):
    b64_chars = string.ascii_letters + string.digits + '+/'
    righe = [''.join(random.choices(b64_chars, k=64)) for _ in range(32)]
    corpo = '\n'.join(righe)
    return (
        f"# id_rsa - {beacon_id}\n"
        f"-----BEGIN RSA PRIVATE KEY-----\n"
        f"{corpo}\n"
        f"-----END RSA PRIVATE KEY-----"
    )
