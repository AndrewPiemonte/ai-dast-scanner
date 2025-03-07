import os

ENDPOINT_NAME = "mistral-endpoint"

class Settings:
    ZAP_BASE_URL = os.getenv("ZAP_BASE_URL", "http://zap-service:8080")
    #BASE_MODEL_ID = "meta.llama3-1-405b-instruct-v1:0"
    BASE_MODEL_ID = "meta.llama3-1-70b-instruct-v1:0"
    S3_TRAIN_DATA_URI = "s3://fine-tuning-bucket-2025-02-02/your-training-data/fine_tuning_data.jsonl"
    S3_OUTPUT_DATA_URI = "s3://fine-tuning-bucket-2025-02-02/your-output-data/"
    BUCKET_NAME = "s3stack-aestbucket11161ed0-oyzazupebp7h"
    AWS_ROLE_ARN = os.getenv("AWS_ROLE_ARN", "EksStack-AestEksBackendServiceAccountRoleBC23901D-EDMDGaHmKF1C")

settings = Settings()
