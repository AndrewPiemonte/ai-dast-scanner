import asyncio
import logging
import boto3
import os
import json
import bedrock_client
import owasp_client
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from kubernetes import client, config
from config import settings  # TODO: temp comment out. Please uncomment me if needed @Andrew!
from urllib.parse import urlparse
import sys

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Allow all origins for now for local testing (prevents CORS errors)
# TODO: Review and update origins once we are ready to deploy
origins = [
    "http://localhost:3000",  # Frontend local testing
    "http://localhost:8000",  # FastAPI local testing
    "http://localhost",  # Default http
    "https://localhost",  # Default https
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware to handle long-running requests
# This is needed since our scans can take a long time to complete
class TimeoutMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await asyncio.wait_for(call_next(request), timeout=1800)
            return response
        except asyncio.TimeoutError:
            return Response(
                content=json.dumps({
                    "detail": "Request timeout exceeded"
                }),
                status_code=504,
                media_type="application/json"
            )

app.add_middleware(TimeoutMiddleware)


# Load Kubernetes config
config.load_incluster_config()
k8s_api = client.BatchV1Api()
core_v1_api = client.CoreV1Api()
s3_client = boto3.client("s3", region_name="us-west-2")


#TODO: Add an event where all pscan and ascan is generated 
#TODO: these parameers can be different for each scan script, maybe have a json file where
#TODO: developres can add new configuration for scans for their scans configuration py files
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up")
    
    # Only run this upload function once
    if os.getenv("UPLOAD_ONCE", "true") == "true":
        os.environ["UPLOAD_ONCE"] = "false"  # Prevent duplicate execution
        owasp_client.upload_files_to_s3("scan_scripts", settings.BUCKET_NAME)


#Testing connection..
@app.get("/")
async def root():
    return {"message": "Hello, world!!"}


@app.post("/bedrock/invoke")
async def invoke_model(payload: dict = Body(...)):
    """Unified function for cybersecurity Q&A, security report summarization, and future modes."""

    mode = payload.get("mode", "").strip().lower()
    input_text = payload.get("input_text", "").strip()
    input_report = payload.get("input_report", "").strip()

    try:
        return bedrock_client.invoke(mode, input_text, input_report) 
    except HTTPException as e:
        raise e  # Reraise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/zap/basescan")
async def zap_basescan(scan_request: dict):
    """
    Starts a ZAP baseline scan with configurable parameters provided in a dictionary.

    Args:
        scan_request (dict): Dictionary containing scan parameters, including:
            - scanMode (str, optional): The mode of the scan (e.g., "zap-scan").
            - flags (dict, optional): Dictionary of scan flags (e.g., ENABLE_DEBUG, ENABLE_AJAX_SPIDER, etc.).
            - values (dict, optional): Dictionary of configurable scan values (e.g., SCAN_CONFIG, TIMEOUT, etc.).
            - target_url (str, optional): The target URL for scanning (not mandatory).

    Returns:
        dict: A response containing the scan_id, status, and message.

    Raises:
        HTTPException: If scan initiation fails.
    """

    try:
        # Start the scan with extracted parameters
        scan_id = await owasp_client.start_zap_basescan(
            scan_mode=scan_request.get("scanMode", "zap-scan"),
            flags = scan_request.get("flags", {}),
            values = scan_request.get("values", {}),
        )
        logger.info(f"Scan initiated with ID: {scan_id}")
        return {"scan_id": scan_id, "status": "initiated", "message": "Scan started successfully"}
    except Exception as e:
        logger.error(f"Error starting ZAP scan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start ZAP scan: {str(e)}")

    
@app.get("/zap/scan-status/{scan_id}")
async def get_scan_status(scan_id: str):
    """Check the status of a ZAP scan and return the report if available"""
    logger.info(f"Checking status for scan ID: {scan_id}")
    try:
        result = await owasp_client.check_scan_status(scan_id)
        return result
    except Exception as e:
        logger.error(f"Error checking scan status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to check scan status: {str(e)}")
    




