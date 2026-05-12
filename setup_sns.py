import boto3
from config import CONFIG

sns = boto3.client(
    'sns',
    endpoint_url=CONFIG['localstack']['endpoint'],
    aws_access_key_id=CONFIG['localstack']['access_key'],
    aws_secret_access_key=CONFIG['localstack']['secret_key'],
    region_name=CONFIG['localstack']['region']
)

print("Creazione del Canale di Allarme (SNS Topic)...")
topic_response = sns.create_topic(Name=CONFIG['sns']['topic_name'])
topic_arn = topic_response['TopicArn']
print(f"Topic creato! ARN: {topic_arn}")

print(" Iscrizione dell'Analista di Sicurezza (Email)...")
sns.subscribe(
    TopicArn=topic_arn,
    Protocol='email',
    Endpoint=CONFIG['sns']['admin_email']
)
print("Iscrizione completata. Il megafono è pronto!")
