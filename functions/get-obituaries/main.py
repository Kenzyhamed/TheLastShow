# add your get-notes function here
import boto3
import json
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("the-last-show")




def lambda_handler(event,context):

    try:
        res = table.scan()
        if res["Count"]==0:
            return{
                "statusCode": 200,
                "body": json.dumps({"message":"empty table", "data":[]})
                
        }

        return{
            "statusCode": 200,
            "body": json.dumps(res["items"])
        }
    except Exception as exp:
        return{
            "statusCode": 500,
            "body": json.dumps(
            {
                "message": str(exp)
            })
        }
