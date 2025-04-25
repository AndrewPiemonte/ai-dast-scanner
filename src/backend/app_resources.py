"""
app_resources.py

Centralized module for initializing and managing application-wide resources.
This includes:
- Kubernetes API clients
- AWS S3 client
- Logging configuration
- Future service integrations (e.g., databases, caching)
"""
import sys
import boto3
import logging
import os
from kubernetes import config, client
from kubernetes.config.config_exception import ConfigException

region_name: str = os.getenv("AWS_REGION")

# ------------------ Logging Configuration ------------------
def setup_logging():
    log_format = "[%(asctime)s +0000] [%(process)d] [%(levelname)s] [%(filename)s:%(lineno)d] %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    return logging.getLogger(__name__)

logger = setup_logging()

# ------------------ Initialize Kubernetes Clients ------------------
try:
    config.load_incluster_config()
    k8s_api = client.BatchV1Api()
    core_v1_api = client.CoreV1Api()
    logger.info("Kubernetes API clients initialized successfully.")
except ConfigException as e:
    logger.error(f"Failed to load Kubernetes configuration: {e}")
    sys.exit(1)  # Exit to allow Kubernetes to restart the pod on failure

# ------------------ Initialize AWS S3 Client ------------------
try:
    s3_client = boto3.client("s3", region_name=region_name)
    logger.info("S3 client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize S3 client: {e}")
    sys.exit(1) # Exit to allow Kubernetes to restart the pod on failure


# ------------------ Initialize Bedrock clients ------------------

try:
    bedrock_client = boto3.client("bedrock", region_name=region_name)
    bedrock_runtime_client = boto3.client("bedrock-runtime", region_name=region_name)
except Exception as e:
    logger.error(f"Failed to initialize AWS Bedrock clients: {e}")
    sys.exit(1)  # Exit to allow Kubernetes to restart the pod on failure

