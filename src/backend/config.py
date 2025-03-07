import os

ENDPOINT_NAME = "mistral-endpoint"

class Settings:
    ZAP_BASE_URL = os.getenv("ZAP_BASE_URL", "http://zap-service:8080")
    #BASE_MODEL_ID = "meta.llama3-1-405b-instruct-v1:0"
    BASE_MODEL_ID = "meta.llama3-1-70b-instruct-v1:0"
    BUCKET_NAME = "s3stack-aestbucket11161ed0-oyzazupebp7h"

    AWS_ROLE_ARN = os.getenv("AWS_ROLE_ARN", "EksStack-AestEksBackendServiceAccountRoleBC23901D-EDMDGaHmKF1C")

settings = Settings()

class Settings:
    """
    Configuration settings for the application, including ZAP, AWS, and S3 parameters.

    This class centralizes configuration management, allowing environment variables
    to override default values for better flexibility and scalability.
    """
    
    ZAP_BASE_URL = os.getenv("ZAP_BASE_URL", "http://zap-service:8080")
    
    # AI Model Configuration
    BASE_MODEL_ID = "meta.llama3-1-70b-instruct-v1:0"
    #BASE_MODEL_ID = "meta.llama3-1-405b-instruct-v1:0"

    # S3 Storage Configuration
    BUCKET_NAME = "s3stack-aestbucket11161ed0-oyzazupebp7h"
    # AWS Configuration
    AWS_ROLE_ARN = os.getenv("AWS_ROLE_ARN", "EksStack-AestEksBackendServiceAccountRoleBC23901D-EDMDGaHmKF1C")

    # Kubernetes Configuration
    NAMESPACE = "default"       # Namespace where the ZAP job runs
    CHART_PATH = "/app/zap-scan-job"   # Path to the Helm chart

settings = Settings()
