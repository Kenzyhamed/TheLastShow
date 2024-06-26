# add your create-obituary function here
import time
import boto3
import json
import base64
import hashlib
import requests 
from requests_toolbelt.multipart import decoder
import os

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table('the-last-show')

ssm = boto3.client('ssm')
response = ssm.get_parameters(
    Names=["chatgptkeyF", "cloudinarySecret"],
    WithDecryption=True
)

keys = {item['Name']: item['Value'] for item in response['Parameters']}



def get_parameter(parameter_name):
    return keys[parameter_name]

def chatGPT_response(prompt):
    chatGPTkey = get_parameter("chatgptkeyF")
    url = "https://api.openai.com/v1/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {chatGPTkey}"
    }
    body = {
        "model": "text-curie-001",
        "prompt": prompt,
        "max_tokens": 600,
        "temperature": 0.2
    }
    res = requests.post(url, headers=headers, json=body)
    response_json = res.json()
    print(response_json)
    return response_json["choices"][0]["text"]

# can pass in "raw" instead of image to upload mp3 file
def upload_to_cloudinary(filename, resource_type = "image", fields={}):

    cloudinary_key = get_parameter('cloudinarySecret')
    api_key = "427775682132549"
    cloud_name = "dndo9t5ix"

    # # you need to read this from Parameter Store 
    # api_secret = os.getenv("C_API_SECRET")
    # timestamp = int(time.time())
    # body["timestamp"] = timestamp
    
    body = {
        "api_key": api_key
    }

    files = {
        "file": open(filename, "rb")
    }

    
    body.update(fields)

    body["signature"] = create_signature(body, cloudinary_key)

    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload" 
    res = requests.post(url, files=files, data=body)
    return res.json()

def create_signature(body, api_secret):
    exclude = ["api_key", "resource_type", "cloud_name"] #these should not be in signature
    timestamp = int(time.time())
    body["timestamp"] = timestamp

    sorted_body = sort_dictionary(body, exclude)
    query_string = create_query_string(sorted_body)
    
    query_string_appended = f"{query_string}{api_secret}"
    hashed = hashlib.sha1(query_string_appended.encode())
    signature = hashed.hexdigest()
    return signature

def sort_dictionary(dictionary, exclude):
    return {k: v for k, v in sorted(dictionary.items(), 
            key=lambda item:item[0]) if k not in exclude}

def create_query_string(body):
    query_string = ""
    for idx, (k, v) in enumerate(body.items()):
        query_string = f"{k}={v}" if idx == 0 else f"{query_string}&{k}={v}"
    
    return query_string

def lambda_handler(event, context):
    body = event['body']
    if event["isBase64Encoded"]:
        body = base64.b64decode(body)
    
    content_type = event["headers"]["content-type"]
    data = decoder.MultipartDecoder(body, content_type)

    binary_data = [part.content for part in data.parts]
    name = binary_data[1].decode()
    born = binary_data[2].decode()
    died = binary_data[3].decode()
    id = binary_data[4].decode()

    key = "/tmp/obituary.png"
    with open(key, "wb") as f:
        f.write(binary_data[0])
    
    img = upload_to_cloudinary(key, fields={"eager": "e_art:zorro"})

    chatgpt_response = chatGPT_response(f"write an obituary about a fictional character named {name} who was born on {born} and died on {died}. Keep it to 8 sentences max.")

    # NESSMA
    voice_response = polly_speech(chatgpt_response)
        
    body = {
        "id-obituary": id,
        "deadName": name,
        "deadBirth": born,
        "deadDeath": died,
        "imageDeath": img["eager"][0]["secure_url"],
        "description": chatgpt_response,
        "voice": voice_response["secure_url"]
    }
    
    try:
        table.put_item(Item=body)
        return {
            "isBase64Encoded": "false",
            'statusCode': 200,
            'body': json.dumps(body)
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }

def polly_speech(speech):
    print(speech)
    client = boto3.client('polly')
    speaking = client.synthesize_speech(
        Engine = 'standard', 
        LanguageCode = 'en-US',
        OutputFormat = 'mp3',
        Text = speech, 
        TextType = 'text', 
        VoiceId = 'Joanna' 
    )

    filename = os.path.join("/tmp", "AmazonPollyfile.mp3")

    with open(filename, "wb") as f:
        f.write(speaking["AudioStream"].read())
    
    return upload_to_cloudinary(filename, resource_type="raw")
    