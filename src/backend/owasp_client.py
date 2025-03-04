import datetime
import json
import subprocess
import asyncio
import logging
import boto3
import uuid
import os
import sys
from fastapi import HTTPException
from kubernetes import client, config
from urllib.parse import urlparse
import bedrock_client

# Load Kubernetes config
config.load_incluster_config()
k8s_api = client.BatchV1Api()
core_v1_api = client.CoreV1Api()

# Initialize S3 client
s3_client = boto3.client("s3", region_name="us-west-2")
BUCKET_NAME = "s3stack-aestbucket11161ed0-oyzazupebp7h"

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


#TODO: only returns: "status": "error",
#TODO: Fix to check status instead of checking if file exits 
#TODO: otherwise will keep triggering the same functions for mutiple checks

# Remove the running_scans dictionary
# Instead, we'll track scan state in S3 and through Kubernetes jobs

async def start_zap_basescan(target_url: str):
    """
    Initiates a ZAP baseline security scan as a background task and returns a scan ID immediately.

    This function performs the following steps:
    1. Generates a unique scan ID based on the current timestamp and a UUID and other parameters for the scan.
    2. Verifies the existence of the required chart path for deployment.
    3. Stores the initial scan metadata in an S3 bucket.
    4. Starts the ZAP scan asynchronously without blocking execution.
    5. Attaches an error-handling callback to capture scan failures.

    The scan runs in the background while execution continues, and the function returns the scan ID immediately.

    Args:
        target_url (str): The target URL to be scanned.

    Returns:
        str: The unique scan ID assigned to this scan.

    Raises:
        HTTPException: If the chart path does not exist or if storing the scan metadata in S3 fails.
    """

    #Generate parameters for the scan
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID for brevity
    scan_id = f"{timestamp}-{unique_id}"
    values_job_name = "zap-basescan-job"
    release_name = f"zap-basescan-{scan_id}"
    job_name = f"{values_job_name}-{scan_id}"
    namespace = "default"
    chart_path = "/app/zap-scan-job"
    
    # Verify the chart path exists
    if not os.path.exists(chart_path):
        logger.error(f"Chart path does not exist: {chart_path}")
        # Try to list files in the /app directory to see what's available
        try:
            app_files = os.listdir("/app")
            logger.info(f"Files in /app directory: {app_files}")
        except Exception as e:
            logger.error(f"Could not list files in /app: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ZAP chart path not found: {chart_path}")
    
    logger.info(f"Starting ZAP scan for {target_url} with ID {scan_id}")
    
    # Store initial scan status in S3
    status_data = {
        "scan_id": scan_id,
        "status": "initiated",
        "target_url": target_url,
        "timestamp": timestamp,
        "unique_id": unique_id,
        "job_name": job_name,
        "release_name": release_name,
        "created_at": datetime.datetime.now().isoformat()
    }
    
    # Upload initial status to S3
    status_key = f"scan-status/{scan_id}.json"
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=status_key,
            Body=json.dumps(status_data),
            ContentType="application/json"
        )
        logger.info(f"Uploaded initial status to S3 for scan ID: {scan_id}")
    except Exception as e:
        logger.error(f"Failed to upload status to S3: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize scan in S3: {str(e)}")
    
    # Start the scan process in the background without awaiting completion
    background_task = asyncio.create_task(
        execute_zap_scan(
            scan_id=scan_id,
            target_url=target_url,
            timestamp=timestamp,
            job_name=job_name,
            release_name=release_name,
            namespace=namespace,
            chart_path=chart_path
        )
    )
    
    # Add error handler to the background task
    background_task.add_done_callback(lambda t: handle_task_result(t, scan_id))
    
    return scan_id

def handle_task_result(task, scan_id):
    """Handle results from background tasks to ensure errors are logged"""
    try:
        # Check if the task raised an exception
        exception = task.exception()
        if exception:
            logger.error(f"Background task for scan {scan_id} failed with exception: {exception}")
            # We could also update the scan status in S3 here, but the execute_zap_scan function
            # should already handle that if possible
    except asyncio.CancelledError:
        logger.warning(f"Background task for scan {scan_id} was cancelled")
    except Exception as e:
        logger.error(f"Error handling background task result for scan {scan_id}: {str(e)}")

async def execute_zap_scan(scan_id, target_url, timestamp, job_name, release_name, namespace, chart_path):
    """
    Executes a ZAP baseline security scan as a background task.

    This function performs the following steps:
    1. Updates the scan status to "running" in S3.
    2. Validates that the required chart path exists.
    3. Triggers a Helm release to deploy the ZAP scan job.
    4. Monitors the scan job until completion.
    5. Updates the scan status in S3 based on success or failure.

    If an error occurs at any stage, the scan status is updated to "failed" and logged.

    Args:
        scan_id (str): Unique identifier for the scan.
        target_url (str): The URL to be scanned.
        timestamp (str): Timestamp indicating when the scan was initiated. #TODO:Not being used
        job_name (str): The name of the Kubernetes job running the scan.
        release_name (str): Helm release name associated with the scan.
        namespace (str): The Kubernetes namespace where the job is deployed.
        chart_path (str): Path to the Helm chart used to deploy the scan.

    Raises:
        Exception: If there is a failure in executing the scan.
    """
    try:

        #TODO: maybe update to running after checking for error for less logic? do need to twice in cases it fail, if keep check
        # Update status to running in S3
        await update_scan_status(scan_id, "running")
        

        #TODO: need to check this again? this is only called after start_zap_basescan which already checks for this... 
        #TODO: If we plan calling this from another place then might need it, but for now i dont think we need to check twice
        # First, check if the chart path exists
        if not os.path.exists(chart_path):
            error_msg = f"Chart path does not exist: {chart_path}"
            logger.error(error_msg)
            await update_scan_status(scan_id, "failed", error=error_msg)
            return
            
        logger.info(f"Starting ZAP scan for {target_url} with ID {scan_id}")
        logger.info(f"Using chart path: {chart_path}")
        
        # Trigger Helm release with explicit job name
        helm_command = [
            "helm", "install", release_name, chart_path,
            "--namespace", namespace,
            "--set", f"targetUrl={target_url}",
            "--set", "scan_settings.zapScanJobEnabled=true",
            "--set", f"job.name={job_name}",  # Use job.name instead of job.fullName to match the Helm template
            "--set", f"job.scanid={scan_id}"   
        ]
        #TODO: this is a bit confusing setting timestamp as scan id, got me a bit confused
        
        logger.info(f"Executing Helm command: {' '.join(helm_command)}")
        
        result = subprocess.run(
            helm_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            error_msg = f"Helm release failed: {result.stderr}"
            logger.error(error_msg)
            await update_scan_status(scan_id, "failed", error=error_msg)
            return

        logger.info(f"Helm release triggered successfully for {scan_id}. Output:\n{result.stdout}")

        # Wait for job completion
        try:
            await wait_for_job_registration(job_name, namespace)
            await wait_for_job_to_complete(job_name, namespace, scan_id)
            
            # Update status to completed
            await update_scan_status(scan_id, "completed")
            
        except Exception as e:
            error_msg = f"Job execution failed: {str(e)}"
            logger.error(error_msg)
            await update_scan_status(scan_id, "failed", error=error_msg)

    except Exception as e:
        error_msg = f"Scan execution failed: {str(e)}"
        logger.error(error_msg)
        await update_scan_status(scan_id, "failed", error=error_msg)

async def update_scan_status(scan_id, status, error=None):
    """
    Updates the scan status in an S3 bucket.

    This function retrieves the existing scan status from S3 (if available), updates it with the 
    new status and timestamp, and then writes the updated status back to S3.

    - If no existing status file is found, a new one is created.
    - The function logs an error if updating the status fails but does not interrupt execution.

    Args:
        scan_id (str): Unique identifier for the scan.
        status (str): New status of the scan (e.g., "in_progress", "completed", "failed").
        error (str, optional): Error message if the scan failed. Defaults to None.

    Returns:
        dict: The updated scan status dictionary.
    """
    try:
        # First, try to get existing status
        print(f"UPDATED:{status}")
        status_key = f"scan-status/{scan_id}.json"
        try:
            response = s3_client.get_object(Bucket=BUCKET_NAME, Key=status_key)
            status_data = json.loads(response['Body'].read().decode('utf-8'))
        except s3_client.exceptions.NoSuchKey:
            # Create a new status object if one doesn't exist
            status_data = {
                "scan_id": scan_id,
                "created_at": datetime.datetime.now().isoformat()
            }
        
        # Update the status
        status_data["status"] = status
        status_data["updated_at"] = datetime.datetime.now().isoformat()
        
        if error:
            status_data["error"] = error
        
        # Write back to S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=status_key,
            Body=json.dumps(status_data),
            ContentType="application/json"
        )
        
        return status_data
    except Exception as e:
        print(f"Failed to update scan status in S3: {str(e)}")
        # Continue execution even if status update fails

#TODO: better to check status to see, maybe new status for ai phase
async def check_scan_status(scan_id: str):
    """
    Retrieves the status of a ZAP scan and returns the report if available.

    This function checks the status of a scan by:
    1. **Checking S3 for the final scan report**:
       - If the report exists, it retrieves and returns it as JSON.
    2. **If no report is found, checking the scan status in S3**:
       - If the status is "failed", it returns an error message.
       - If the scan is "initiated" or "running", it checks the Kubernetes job status.
    3. **Verifying the Kubernetes job status** (if applicable):
       - If the job has succeeded but no report exists, it returns `"processing"`.
       - If the job has failed, it updates the status in S3 and returns `"failed"`.
       - If the job is still active, it returns `"in progress"`.
    4. **If no report or status is found, returning `"not_found"`**.

    Args:
        scan_id (str): The unique identifier for the scan.

    Returns:
        dict: A dictionary containing the scan status, message, and report (if available).

    Possible Return Values:
        - **"completed"** → Scan and report available in S3.
        - **"processing"** → Scan job completed, report is still being generated.
        - **"running" / "initiated"** → Scan is still in progress.
        - **"failed"** → Scan failed (with error details if available).
        - **"not_found"** → No scan report or status was found in S3.
        - **"error"** → Unexpected error occurred.

    Raises:
        None: This function handles all exceptions internally and returns error messages in the response.
    """

    # First, check if the report exists in S3
    report_key = f"{scan_id}.json"
    status_key = f"scan-status/{scan_id}.json"
    
    try:
        # Check if the final report exists
        try:
            s3_client.head_object(Bucket=BUCKET_NAME, Key=report_key)
            # If we're here, the report exists
            report_response = s3_client.get_object(Bucket=BUCKET_NAME, Key=report_key)
            report_data = json.loads(report_response['Body'].read().decode('utf-8'))
            report_string = json.dumps(report_data, indent=2)
            
            #logger.info(f"{report_string}")
            type_check = type(report_string)
            logger.info(f"{type_check}")
            
            #! In case we want to bind AI from here
            # # Process with Bedrock for AI analysis
            #TODO:Problem if we can checking the file it will try to generate everytime, maybe change status to generating
            #so we dont do this multiple times, which causes an error
            ai_analysis =  bedrock_client.invoke(mode="report" , input_text="", input_report=report_string)

            return {
                "scan_id": scan_id,
                "status": "completed",
                "message": "Scan completed successfully",
                "report": report_data,
                "ai_analysis": ai_analysis
            }

        except s3_client.exceptions.NoSuchKey:
            # Report doesn't exist yet, check the status file
            logger.info("NOT FOUND")
            pass
        
        #TODO: Debug this Never got status besides "Error retrieving scan status"
        # Check the status file
        try:
            logger.info("RETRIEVING!!!")
            status_response = s3_client.get_object(Bucket=BUCKET_NAME, Key=status_key)
            status_data = json.loads(status_response['Body'].read().decode('utf-8'))
            
            status = status_data.get("status", "unknown")
            
            if status == "failed":
                return {
                    "scan_id": scan_id,
                    "status": status,
                    "message": "Scan failed",
                    "error": status_data.get("error", "Unknown error")
                }
            elif status in ["initiated", "running"]:
                # Also check Kubernetes job status for more accurate information
                job_name = status_data.get("job_name")
                if job_name:
                    try:
                        job = k8s_api.read_namespaced_job(name=job_name, namespace="default")
                        job_status = "unknown"
                        
                        if job.status.succeeded:
                            job_status = "succeeded"
                            # If job succeeded but no report yet, it's still processing
                            return {
                                "scan_id": scan_id,
                                "status": "processing",
                                "message": "Scan completed, generating report"
                            }
                        elif job.status.failed:
                            job_status = "failed"
                            await update_scan_status(scan_id, "failed", error="Kubernetes job failed")
                            return {
                                "scan_id": scan_id,
                                "status": "failed",
                                "message": "Scan job failed in Kubernetes"
                            }
                        elif job.status.active:
                            job_status = "active"
                    except client.exceptions.ApiException:
                        # Job might not exist yet
                        job_status = "pending"
                        
                    return {
                        "scan_id": scan_id,
                        "status": status,
                        "job_status": job_status,
                        "message": "Scan is in progress"
                    }
                
                return {
                    "scan_id": scan_id,
                    "status": status,
                    "message": "Scan is in progress"
                }
            else:
                return {
                    "scan_id": scan_id,
                    "status": status,
                    "message": f"Scan status: {status}"
                }
                
        except s3_client.exceptions.NoSuchKey:
            # Neither report nor status file exists
            return {
                "scan_id": scan_id,
                "status": "not_found",
                "message": "Scan not found"
            }
            
    except Exception as e:
        return {
            "scan_id": scan_id,
            "status": "error",
            "message": f"Error retrieving scan status: {str(e)}"
        }

async def wait_for_job_registration(job_name: str, namespace: str):
    """
    Waits for a Kubernetes Job to be registered in the specified namespace.

    This function repeatedly queries the Kubernetes API to check if the job has been created.
    It retries a maximum number of times with a delay between attempts. If the job is not
    found within the allowed retries, an HTTPException is raised.

    Steps:
    1. Queries the Kubernetes API for the job.
    2. If the job exists, logs the job name and exits successfully.
    3. If the job does not exist, retries up to `max_retries` times, waiting `delay_seconds` between attempts.
    4. If the job is still not found after all retries, raises an HTTP 500 exception.

    Args:
        job_name (str): The name of the Kubernetes Job to wait for.
        namespace (str): The namespace in which the Job is expected to be registered.

    Raises:
        HTTPException: If the job is not registered within the expected time.
        client.exceptions.ApiException: If an API error occurs other than a 404 (Not Found).
    """
    max_retries = 15
    delay_seconds = 5

    for attempt in range(max_retries):
        try:
            print(f"Attempting to find job '{job_name}' in namespace '{namespace}'")
            jobs = k8s_api.list_namespaced_job(namespace=namespace)
            print(f"Found jobs: {[job.metadata.name for job in jobs.items]}")
            
            job = k8s_api.read_namespaced_job(name=job_name, namespace=namespace)
            print(f"Job '{job_name}' registered in Kubernetes: {job.metadata.name}")
            return
        except client.exceptions.ApiException as e:
            if e.status == 404:
                print(f"Attempt {attempt + 1}: Job '{job_name}' not found. Retrying in {delay_seconds} seconds...")
                await asyncio.sleep(delay_seconds)
                continue
            raise

    raise HTTPException(status_code=500, detail=f"Job '{job_name}' was not registered in Kubernetes within the expected time.")

async def get_pod_for_job(job_name: str, namespace: str) -> str:
    """
    Retrieves the name of the pod associated with a specific Kubernetes Job.

    This function queries the Kubernetes API to find a pod that matches the given job name.
    It retries multiple times with a delay, allowing time for the pod to be created and become ready.

    Steps:
    1. **Query Kubernetes for pods matching the job name** using a label selector.
    2. **If a pod is found**, check its status:
       - If the pod is `"Running"` or `"Succeeded"`, return its name.
       - If the pod exists but is not yet `"Running"`, retry until the max attempts are reached.
    3. **If no pod is found**, retry up to `max_retries` times, waiting `delay_seconds` between attempts.
    4. **If no pod is found after all retries**, raise an `HTTPException`.

    Args:
        job_name (str): The name of the Kubernetes Job whose pod should be retrieved.
        namespace (str): The Kubernetes namespace where the Job is running.

    Returns:
        str: The name of the pod associated with the Job if found.

    Raises:
        HTTPException: If no pod is found within the expected time.
    """
    max_retries = 10  # Retry up to 10 times
    delay_seconds = 5  # Start with a 5-second delay

    for attempt in range(max_retries):
        pods = core_v1_api.list_namespaced_pod(
            namespace=namespace,
            label_selector=f"job-name={job_name}"
        )
        if pods.items:
            pod_name = pods.items[0].metadata.name
            pod_status = pods.items[0].status.phase
            if pod_status in ("Running", "Succeeded"):
                print(f"Pod for job '{job_name}' found: {pod_name}")
                return pod_name
            else:
                print(f"Pod '{pod_name}' for job '{job_name}' is in state '{pod_status}'. Retrying...")
        
        print(f"Attempt {attempt + 1}: Pod for job '{job_name}' not found. Retrying in {delay_seconds} seconds...")
        await asyncio.sleep(delay_seconds)

    raise HTTPException(status_code=500, detail=f"No pod found for job '{job_name}' within the expected time.")


async def wait_for_job_to_complete(job_name: str, namespace: str, scan_id: str):
    """
    Waits for a Kubernetes Job to complete and verifies the ZAP scan report.

    This function continuously checks the status of the specified Kubernetes Job until 
    it reaches a terminal state (`Succeeded` or `Failed`). It also retrieves logs from 
    the associated Pod to verify if the ZAP scan report was successfully generated.

    Steps:
    1. Retrieves the Job status and associated Pod.
    2. If the Pod's phase is `Succeeded` or `Failed`, fetches logs to check for the report.
    3. If the expected report filename is found in logs, confirms scan completion.
    4. If no valid report is found, raises an `HTTPException` with log details.
    5. If the job is still running, retries up to `max_retries` with a `delay_seconds` interval.
    6. If the job does not complete within the timeout, raises an `HTTPException`.

    Args:
        job_name (str): The name of the Kubernetes Job to monitor.
        namespace (str): The Kubernetes namespace where the Job is running.
        scan_id (str): The unique scan ID associated with the Job.

    Raises:
        HTTPException: If the job fails, does not generate a valid report, or exceeds the timeout.
        Exception: If an unexpected error occurs during job monitoring.
    """

    max_retries = 60
    delay_seconds = 10

    for attempt in range(max_retries):
        try:
            job_status = k8s_api.read_namespaced_job_status(name=job_name, namespace=namespace) #TODO: Not used
            pod_name = await get_pod_for_job(job_name, namespace)
            pod = core_v1_api.read_namespaced_pod(name=pod_name, namespace=namespace)

            # Check pod phase
            if pod.status.phase in ["Succeeded", "Failed"]:
                logs = core_v1_api.read_namespaced_pod_log(
                    name=pod_name,
                    namespace=namespace
                )
                
                # Check for successful report generation with correct filename
                report_filename = f"{scan_id}.json"
                if f"Scan completed successfully. Report saved at /zap/wrk/{report_filename}" in logs:
                    print(f"ZAP scan completed and report generated for job '{job_name}'")
                    
                    # Sleep for 2 seconds to ensure the file is fully written
                    await asyncio.sleep(2)
                    
                    if "FAIL-NEW: 0" in logs:
                        print("ZAP scan completed with no failures")
                    else:
                        print("ZAP scan completed with warnings (but no failures)")
                    
                    return
                else:
                    raise HTTPException(
                        status_code=500,
                        detail={
                            "message": "ZAP scan failed to generate report",
                            "logs": logs,
                            "job_name": job_name,
                            "pod_name": pod_name
                        }
                    )

            print(f"Attempt {attempt + 1}: Job is still running. Retrying in {delay_seconds} seconds...")
            await asyncio.sleep(delay_seconds)
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "message": f"Failed to check job status: {str(e)}",
                    "job_name": job_name
                }
            )

    raise HTTPException(
        status_code=500,
        detail=f"Job '{job_name}' did not complete within the expected time."
    )


################################################################################
#       OLD STUFF
################################################################################
async def get_zap_report(report_filename: str):
    max_retries = 3
    delay_seconds = 5
    
    for attempt in range(max_retries):
        try:
            report_path = f"/reports/{report_filename}"
            with open(report_path, 'r') as f:
                report_data = json.loads(f.read())
            
            # # Clean up report file after successful read, or we can set S3 to remove files after a certain time
            # try:
            #     os.remove(report_path)
            #     print(f"Deleted report file: {report_path}")
            # except Exception as cleanup_error:
            #     print(f"Failed to delete report file (non-fatal): {cleanup_error}")
                
            return report_data
                
        except (FileNotFoundError, json.JSONDecodeError) as e:
            if attempt < max_retries - 1:
                await asyncio.sleep(delay_seconds)
                continue
            raise HTTPException(
                status_code=500,
                detail=f"Error reading report: {str(e)}"
            )
    

async def zap_basescan(target_url: str):
    """Legacy synchronous ZAP scan function (kept for compatibility)"""
    # This function remains unchanged for backward compatibility
    # but we'll redirect it to use the new async approach

    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID for brevity
    scan_id = f"{timestamp}-{unique_id}"
    values_job_name = "zap-basescan-job"
    release_name = f"zap-basescan-{scan_id}"
    job_name = f"{values_job_name}-{scan_id}"
    namespace = "default"
    chart_path = "/app/zap-scan-job"

    try:
        print("Triggering job")
        # Trigger Helm release with timestamp
        helm_command = [
            "helm", "install", release_name, chart_path,
            "--namespace", namespace,
            "--set", f"targetUrl={target_url}",
            "--set", "zapScanJobEnabled=true",
            "--set", f"job.name={job_name}",
            "--set", f"job.scanid={scan_id}"
        ]
        print("setting job")
        result = subprocess.run(
            helm_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Helm release failed: {result.stderr}")

        print(f"Helm release triggered. Output:\n{result.stdout}")

        # Wait for job completion
        await wait_for_job_registration(job_name, namespace)
        await wait_for_job_to_complete(job_name, namespace, scan_id)  # Use scan_id instead of timestamp

        # Get report
        pod_name = await get_pod_for_job(job_name, namespace)
        report_filename = f"{scan_id}.json"  # Use scan_id for report filename
        
        scan_results = await get_zap_report(report_filename)
        return scan_results # TODO: For now , leave it as it is since I'll turn off LLM frequently

        # ai_analysis = await llm_service.analyze_zap_report(scan_results)

        # return {
        #     "ai_analysis": ai_analysis,
        #     "scan_results": scan_results,
        #     "metadata": {
        #         "timestamp": timestamp,
        #         "target_url": target_url,
        #     }
        # }

        # # File clean up. Not enabled atm.
        # finally:
        #     # File deletion
        #     report_path = f"/reports/{report_filename}"
        #     if os.path.exists(report_path):
        #         os.remove(report_path)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": f"Scan failed: {str(e)}",
                "job_name": job_name,
                "timestamp": timestamp,
                "target_url": target_url
            }
        )