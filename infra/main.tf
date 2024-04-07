terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"

}


# two lambda functions w/ function url
# one dynamodb table
# roles and policies as needed
# te functions (if you're going for the bonus marks)


resource "aws_dynamodb_table" "the-last-show-Kenzy" {
  name         = "the-last-show"
  billing_mode = "PROVISIONED"

  read_capacity = 1

  write_capacity = 1

  hash_key  = "id-obituary"

  attribute {
    name = "id-obituary"
    type = "S"
  }
}



# this IAM role for all 6 lambda functions
resource "aws_iam_role" "IAM-func" {
  name               = "IAM-func"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    },
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "states.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }

  ]
}
EOF
}



# IAM policy for all 6 lambda functions
resource "aws_iam_policy" "policy-another" {
  name        = "policy-another"
  description = "IAM policy for all lambda functions"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "states:StartExecution",
          "states:DescribeExecution",
          "lambda:*",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "s3:*",
          "ssm:GetParameters",
          "polly:SynthesizeSpeech"
      ],
      "Resource": [
        "*"
        ],
      "Effect": "Allow"
    }
  ]
}
EOF
}



# role - policy attachment for all 6 lambda functions
resource "aws_iam_role_policy_attachment" "role-policy-att-all" {
  role       = aws_iam_role.IAM-func.name
  policy_arn = aws_iam_policy.policy-another.arn
}




# archive file from main.py file for all 6 lambda functions
data "archive_file" "archive-create-obituary" {
  type        = "zip"
  source_dir = "../functions/create-obituary"
  output_path = "../functions/create-obituary/artifact.zip"
}


data "archive_file" "archive-get-obituaries" {
  type        = "zip"
  source_file = "../functions/get-obituaries/main.py"
  output_path = "../functions/get-obituaries/artifact.zip"
}






#lambda function creation for create-obituary orchestrator
resource "aws_lambda_function" "lambda-function-create-obituary" {
  role             = aws_iam_role.IAM-func.arn
  function_name    = "create-obituary"
  handler          = "main.lambda_handler"
  filename         = "../functions/create-obituary/artifact.zip"
  source_code_hash = data.archive_file.archive-create-obituary.output_base64sha256
  runtime          = "python3.9"
  timeout = 20
}

resource "aws_lambda_function_url" "create-obituary-url" {
  function_name      = aws_lambda_function.lambda-function-create-obituary.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "lambda_url_create_obituary" {
  value = aws_lambda_function_url.create-obituary-url.function_url
}




#lambda function creation for get-obituaries
resource "aws_lambda_function" "lambda-function-get-obituaries" {
  role             = aws_iam_role.IAM-func.arn
  function_name    = "get-obituaries"
  handler          = "main.lambda_handler"
  filename         = "../functions/get-obituaries/artifact.zip"
  source_code_hash = data.archive_file.archive-get-obituaries.output_base64sha256
  runtime          = "python3.9"
}

resource "aws_lambda_function_url" "get-obituaries-url" {
  function_name      = aws_lambda_function.lambda-function-get-obituaries.function_name
  authorization_type = "NONE"
  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

output "lambda_url_get_obituaries" {
  value = aws_lambda_function_url.get-obituaries-url.function_url
}

resource "aws_s3_bucket" "lambda" {}

# output the name of the bucket after creation
output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
  }




