import boto3

# Connettiamo il servizio SNS al nostro Cloud locale (LocalStack)
sns = boto3.client('sns', endpoint_url='http://localhost:4566', region_name='us-east-1')

print("🛠️ Creazione del Canale di Allarme (SNS Topic)...")
# Creiamo il megafono
topic_response = sns.create_topic(Name='Allarme-Intrusione-Radar')
topic_arn = topic_response['TopicArn']
print(f"Topic creato! ARN: {topic_arn}")

print(" Iscrizione dell'Analista di Sicurezza (Email)...")
# Iscriviamo la nostra finta email aziendale per ricevere le allerte
sns.subscribe(
    TopicArn=topic_arn,
    Protocol='email',
    Endpoint='security.admin@azienda.local' 
)
print("Iscrizione completata. Il megafono è pronto!")