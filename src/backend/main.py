import asyncio
import logging
import boto3
import json
import bedrock_client
import owasp_client
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from kubernetes import client, config
from config import settings
from urllib.parse import urlparse

app = FastAPI()
logging.basicConfig(level=logging.INFO)

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


@app.get("/")
async def root():
    return {"message": "Hello, world!!"}


@app.post("/bedrock/invoke")
async def invoke_model(payload: dict = Body(...)):
    """Unified function for cybersecurity Q&A, security report summarization, and future modes."""

    mode = payload.get("mode", "").strip().lower()
    input_text = payload.get("input_text", "").strip()
    input_report = payload.get("input_report", "").strip()

   # Generate the appropriate prompt
    prompt = bedrock_client.generate_prompt(mode, input_text, input_report)

    try:
        # Invoke the model with the generated prompt
        response = bedrock_client.invoke_bedrock_model(prompt)
        return {"response": response}  # Clean response format
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invoke LLM: {str(e)}")


@app.post("/zap/basescan")
async def zap_basescan(target_url: str):
    # Validate URL
    try:
        result = urlparse(target_url)
        if not all([result.scheme, result.netloc]):
            raise HTTPException(
                status_code=400, 
                detail="Invalid URL format. Must include scheme (http/https)"
            )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format")

    return await owasp_client.zap_basescan(target_url)