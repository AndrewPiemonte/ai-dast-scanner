import boto3
import os
import hashlib
import logging
from config import settings
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# List of files to ignore (add filenames or patterns)
IGNORE_FILES = {"__init__.py", ".DS_Store"}  # Example files
IGNORE_EXTENSIONS = {".pyc", ".log",".md" }  # Example extensions to ignore

# Define directories to be created
DIRECTORIES_TO_CREATE = [
    "scan-status/",
    "scan-reports/",
    "scan-logs/",
]

def calculate_md5(file_path):
    """Calculate the MD5 hash of a local file."""
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):  # Read in chunks for efficiency
            hasher.update(chunk)
    return hasher.hexdigest()

def get_s3_file_etag(s3_client, bucket, key):
    """Retrieve the ETag (MD5 hash) of an S3 object."""
    try:
        response = s3_client.head_object(Bucket=bucket, Key=key)
        return response["ETag"].strip('"')  # Remove surrounding quotes
    except ClientError as e:
        if e.response['Error']['Code'] == "404":
            return None  # File does not exist in S3
        logger.error(f"Error checking {key} in S3: {e}")
        return None  # Handle other errors gracefully

def upload_files_to_s3(local_directory: str, s3_bucket: str, s3_prefix: str = "scan_scripts/"):
    """
    Uploads all files from the given local directory to the specified S3 bucket.
    If a file already exists in S3 with the same content (MD5 match), it is skipped.

    Args:
        local_directory (str): Path to the local directory containing files to upload.
        s3_bucket (str): Name of the S3 bucket.
        s3_prefix (str): S3 prefix (folder path inside the bucket).

    Raises:
        Exception: If an error occurs during file upload.
    """
    s3_client = boto3.client('s3')

    if not os.path.exists(local_directory):
        logger.error(f"Local directory {local_directory} does not exist.")
        return

    for root, _, files in os.walk(local_directory):
        for file in files:

            # Skip ignored files
            if file in IGNORE_FILES or any(file.endswith(ext) for ext in IGNORE_EXTENSIONS):
                logger.info(f"INGORE: {file}: in ignore list.")
                continue

            local_path = os.path.join(root, file)
            s3_key = f"{file}"  # Store file at the specified prefix in S3

            # Compute MD5 hash of the local file
            local_md5 = calculate_md5(local_path)

            # Get the S3 file's ETag (MD5 hash)
            s3_etag = get_s3_file_etag(s3_client, s3_bucket, s3_key)

            # Skip upload if hashes match (same file content)
            if s3_etag and s3_etag == local_md5:
                logger.info(f"UP-TO-DATE: {file}: already up-to-date in s3://{s3_bucket}/{s3_key}")
                continue

            # Upload the file if it does not exist or has changed
            try:
                s3_client.upload_file(local_path, s3_bucket, s3_key)
                logger.info(f"UPLOADED: Uploaded {local_path} to s3://{s3_bucket}/{s3_key}")
            except Exception as e:
                logger.error(f"FAILED: Failed to upload {local_path} to S3: {e}")

def s3_create_directories():
    """
    Ensures that directories exist in S3 by creating empty placeholder files.
    
    Returns:
        dict: Status report for each directory (created or already exists).
    """
    s3_client = boto3.client("s3")
    status = {}

    for directory in DIRECTORIES_TO_CREATE:
        try:
            # S3 does not have actual directories, so we check for a placeholder file
            key = f"{directory}placeholder.txt"

            # Check if the "directory" (placeholder file) already exists
            try:
                s3_client.head_object(Bucket=settings.BUCKET_NAME, Key=key)
                logger.info(f"Directory already exists in S3: {directory}")
                status[directory] = "Exists"
            except s3_client.exceptions.ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    # Directory doesn't exist, create it by uploading a placeholder file
                    s3_client.put_object(Bucket=settings.BUCKET_NAME, Key=key, Body="")
                    logger.info(f"Created directory in S3: {directory}")
                    status[directory] = "Created"
                else:
                    logger.error(f"Error checking directory {directory} in S3: {e}")
                    status[directory] = f"Error: {e}"

        except Exception as e:
            logger.error(f"Failed to create directory {directory} in S3: {e}")
            status[directory] = f"Error: {e}"

    return status
