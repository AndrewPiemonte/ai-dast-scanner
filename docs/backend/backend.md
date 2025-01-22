# FastAPI ZAP Base Scan Service

This service provisions and monitors OWASP Zed Attack Proxy (ZAP) scans in a Kubernetes environment using Helm. This doc is to describe how the code is organized, how it operates, and how to modify or extend it for your own use cases.

## Overview

This service allows you to:
1. Trigger a ZAP scan job via Helm (deploying a Kubernetes Job).
2. Wait for the job to register, complete, and generate a security report.
3. Retrieve the final report from the container.

It uses FastAPI for the web service, asynchronous operations to handle long-running tasks, and AWS S3 (optional) for storing artifacts in the future.

Technology Stack
• FastAPI (Python) — A high-performance Python web framework.
• Kubernetes Python Client — To interact with your K8s cluster (create Jobs, read statuses, etc.).
• Helm — Used to install a custom chart that runs the ZAP scan job.
• AWS Boto3 (optional) — Provided for future S3 integration (currently used for potential storage or logs).
• Python Asyncio — Handles concurrency and enforces a timeout on long-running tasks.

## Code Structure

```
.
├── app.py            # Main FastAPI application (shown in your snippet)
├── config.py         # Configuration and settings
├── requirements.txt  # Python dependencies
├── llm_service.py    # (Commented out) Optional LLM integration
└── zap-scan-job/     # Helm chart folder for ZAP scanning
```

## Important Sections

1. CORS Middleware
Configured to allow specific origins during development.
2. Timeout Middleware (TimeoutMiddleware)
Wraps each request in a timeout context, returning a 504 Gateway Timeout if the job takes too long.
3. Kubernetes Clients
    - k8s_api (BatchV1Api) — For creating and reading Jobs.
    - core_v1_api (CoreV1Api) — For listing pods and reading pod logs.
4. Endpoints
    - GET / (root) — Simple health check or greeting.
    - POST /zap/basescan — Main endpoint that orchestrates the Helm chart install and monitors the ZAP scan job.

## Configuration

1. Kubernetes Config

```
config.load_incluster_config()
```

This is loading the in-cluster configuration, meaning the code is designed to run inside a Kubernetes environment with the required service account permissions. If you’re developing locally, you may switch this to:

```
config.load_kube_config()
```

to load your local ~/.kube/config.

2. AWS Boto3

```
s3_client = boto3.client("s3", region_name="us-west-2")
```

If you intend to use AWS S3, ensure your credentials are configured properly in your environment.

3. Helm Chart Path

```
chart_path = "/app/zap-scan-job"
```

This indicates the path to your Helm chart used to run the scan job.

## Endpoints

GET /
    - Description: Basic health-check endpoint or greeting route.
    - Response: Returns a JSON object with a message.

Example Usage (cURL):

curl http://localhost:8000/

Example Response:

{
  "message": "Hello, world!"
}

POST /zap/basescan
    - Description:
        - Triggers a new ZAP base scan job against the provided target_url.
        - Validates the target URL.
        - Generates a unique timestamp-based Job name.
        - Installs a Helm release (which in turn creates a Kubernetes Job).
        - Waits for the Job to register and complete.
        - Reads the final report from the container’s file system.
    - Request Body:

```
{
  "target_url": "<string, required>"
}
```

    - Response:
        - Returns the parsed ZAP report as JSON if successful.
        - Returns a 500 error if the scan job fails.

Example Usage (cURL):

```
curl -X POST http://localhost:8000/zap/basescan \
     -H "Content-Type: application/json" \
     -d '{"target_url":"https://example.com"}'
```

Example Response:

```
{
  "site": [
    {
      "@name": "https://example.com",
      "alerts": [
        {
          "alert": "Some Alert Title",
          "risklevel": "High",
          ...
        }
      ]
    }
  ]
}
```

(The exact structure depends on your ZAP configuration.)

## Main Workflow

1. Receive Request
The service receives a POST /zap/basescan request with the target_url.
2. Validate URL
Uses Python’s urllib.parse to check if the scheme and netloc exist.
3. Helm Chart Installation
The service constructs the Helm CLI command to install a chart (zap-scan-job) with custom values (like targetUrl and timestamp).
4. Wait for Job Registration
Calls wait_for_job_registration(), which queries the K8s API to see if the Job has appeared in the cluster.
5. Wait for Job Completion
Calls wait_for_job_to_complete(), which checks the Job and Pod statuses. Once the Pod logs indicate that the report has been generated, it proceeds.
6. Retrieve ZAP Report
The code calls get_zap_report() to read the resulting JSON report from a shared volume or local path (/reports/<timestamp>-report.json).
7. Return Results
The final JSON is sent back to the client.

## Custom Use Cases

1. Modifying the Response

If you want to change the response returned from the /zap/basescan endpoint (for example, to add additional metadata or filter out certain fields), you can modify the final return statement in POST /zap/basescan.

```
@app.post("/zap/basescan")
async def zap_basescan(target_url: str):
    ...
    scan_results = await get_zap_report(report_filename)
    
    # Original:
    # return scan_results

    # Custom response example:
    return {
        "status": "completed",
        "timestamp": timestamp,
        "target_url": target_url,
        "report_summary": parse_report_summary(scan_results),
        "full_report": scan_results
    }
```

In this example, parse_report_summary could be a helper function that extracts only high-level data (like number of alerts found, risk levels, etc.) from the raw JSON.

2. Adding Validation or Pre-Processing

Suppose you want to do additional validation on target_url (e.g., check if it’s in a whitelist). You might add a helper function before installing the Helm chart:

```
def validate_custom_rules(url: str):
    # Some domain check or regex
    if not url.endswith(".example.com"):
        raise HTTPException(
            status_code=400, 
            detail="URL must be a subdomain of example.com"
        )

@app.post("/zap/basescan")
async def zap_basescan(target_url: str):
    validate_custom_rules(target_url)
    ...
```

3. Sending Results to External APIs

If you want to push the scan results to an external API or a webhook, you can add a section after the final scan results are retrieved:

scan_results = await get_zap_report(report_filename)

Send to external API

```
try:
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "https://external-api.example.com/scan-results",
            json=scan_results
        ) as resp:
            if resp.status != 200:
                print("Failed to push results to external API.")
except Exception as e:
    print(f"Error sending results to external API: {str(e)}")
    
return scan_results
```

## Troubleshooting

1. Helm Release Fails
    - Check that your Helm chart path (chart_path) is correct.
    - Ensure the chart itself is valid (run helm template to debug).
    - Verify that the Kubernetes service account or permissions are sufficient to create Jobs in the namespace.

2. Job Stuck in Pending
    - Ensure the cluster has enough resources (CPU/memory) and that your Helm chart sets correct resources.
    - Check for image pull issues (e.g., correct repository credentials).

3. No Pod Found
    - Verify that the label selector job-name={job_name} matches your Helm chart’s metadata.labels.
