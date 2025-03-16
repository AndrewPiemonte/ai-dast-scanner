import asyncio
import json
import bedrock_client
import owasp_client
import s3_utils
import os
import scan_config_generator
from app_resources import logger
from config.settings import settings 
from app import app
from botocore.exceptions import ClientError
from fastapi import HTTPException, Body


# Configuration file
SCAN_CONFIG_JSON_PATH = settings.SCAN_CONFIG_JSON_PATH
BUCKET_NAME = settings.BUCKET_NAME

#TODO: FIX so not all events start with every pods
#TODO: Add an event where all pscan and ascan is generated 
@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up")
    logger.info("Creating Directories..")
    s3_utils.s3_create_directories() #No need to do with every pod
    logger.info("Generating Config...")
    scan_config_generator.generate_config_py()
    scan_config_generator.generate_values_yaml() #No need to do with every pod
    scan_config_generator.generate_zap_scan_job_yaml()
    logger.info("Coping config files..")
    s3_utils.upload_files_to_s3("security_tools", BUCKET_NAME) #No need to do with every pod
   

@app.get("/", summary="Health Check", description="Checks if the API is running successfully.")
async def root():
    """
    Root endpoint for health check.

    Returns:
        dict: A message confirming that the API is operational.
    """
    return {"status": "success", "message": "API is running successfully."}


@app.get(
    "/config",
    summary="Retrieve Configuration File",
    description=(
        "Fetches the static configuration file stored in the container's local directory.\n\n"
        "**Responses:**\n"
        "- `200 OK`: Returns the configuration file contents.\n"
        "- `404 Not Found`: If the file does not exist.\n"
        "- `400 Bad Request`: If the file is not a valid JSON format.\n"
        "- `500 Internal Server Error`: If an unexpected error occurs."
    )
)
async def get_config_file():
    """Fetches the configuration file from the container."""
    if not os.path.exists(SCAN_CONFIG_JSON_PATH):
        logger.error(f"Config file not found: {SCAN_CONFIG_JSON_PATH}")
        raise HTTPException(status_code=404, detail="Configuration file not found")
    try:
        with open(SCAN_CONFIG_JSON_PATH, "r", encoding="utf-8") as file:
            config_data = json.load(file)
            fields_to_remove = {
                "flag",
                "env_var",
                "image",
                "display_to_user",
                }
            config_data = bedrock_client.remove_hidden_fields(data=config_data)
            config_data = bedrock_client.clean_report(data=config_data, fields_to_remove=fields_to_remove)
        return {"config": config_data}

    except json.JSONDecodeError:
        logger.error(f"Config file is not valid JSON: {SCAN_CONFIG_JSON_PATH}")
        raise HTTPException(status_code=400, detail="Invalid JSON format in configuration file")

    except Exception as e:
        logger.error(f"Error reading config file: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching config file")


@app.post(
    "/bedrock/invoke",
    summary="Invoke AI Model for Cybersecurity Analysis",
    description=(
        "Processes cybersecurity-related queries, report summarization, and additional AI-driven security modes.\n\n"
        "**Request Parameters:**\n"
        "- `tool` (str, required): The security tool being used (e.g., OWASP, owasp).\n"
        "- `mode` (str, required): The mode of operation (e.g., 'summarization', 'q&a').\n"
        "- `input_text` (str, optional): User-provided input text for the model.\n"
        "- `input_report` (JSON or str, optional): A JSON-formatted security report.\n\n"
        "**Responses:**\n"
        "- `200 OK`: Successfully processed request and invoked AI model.\n"
        "- `400 Bad Request`: Invalid JSON format in `input_report`.\n"
        "- `500 Internal Server Error`: Unexpected error or AWS ClientError."
    )
)
async def invoke_model(payload: dict = Body(...)):
    "Unified API endpoint for cybersecurity-related AI functionalities, including"

    #TODO: check if mode,config and tools exitis in the local file for safety
    #TODO: fix consistency OWASP vs owasp for instance
    tool = payload.get("tool", "").strip() if payload.get("tool") else None
    mode = payload.get("mode", "").strip().lower() if payload.get("mode") else None
    input_text = payload.get("input_text") if payload.get("input_text") else None
    input_report = payload.get("input_report") if payload.get("input_report") else None

    try:

        if isinstance(input_report, dict):  
            report_data = input_report  # Already a JSON object
        elif isinstance(input_report, str):  
            report_data = json.loads(input_report)  # Convert string to JSON
        else:
            raise ValueError("input_report must be a valid JSON object or JSON string.")

        input_report_str = json.dumps(report_data, indent=2)

        # Invoke AI analysis
        return await asyncio.to_thread(
            bedrock_client.invoke, tool=tool, mode=mode, input_text=input_text, input_report=input_report_str
        )
    
    except ClientError as e:
        logger.error(f"AWS S3 ClientError: {e}")
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from S3: {e}")
    except Exception as e:
        logger.error(f"Unexpected error while updating report: {e}")


@app.post(
    "/zap/basescan",
    summary="Initiate a Security Scan",
    description=(
        "Starts a security scan using the specified tool and scan mode.\n\n"
        "**Request Parameters:**\n"
        "- `run_scan` (dict, required): Contains scan mode and tool selection.\n"
        "  - `scanMode` (dict, required): Specifies the security tool and scan mode.\n"
        "    - `tool` (str, required): The security tool (e.g., 'OWASP').\n"
        "    - `mode` (str, required): The scanning mode (e.g., 'fullscan', 'baseline').\n"
        "- `tools` (dict, required): Contains configurations for available security tools.\n\n"
        "**Responses:**\n"
        "- `200 OK`: Scan successfully started, returning a scan ID.\n"
        "- `400 Bad Request`: Missing or invalid parameters.\n"
        "- `500 Internal Server Error`: Unexpected error while initiating the scan."
    )
)
async def zap_basescan(scan_request: dict):
    "API entrypoint to start a security scan with the specified tool and mode."
    try:
        scan_request.get("configurations")
        scan_tool=scan_request.get("run_scan", {}).get("scanMode", {}).get("tool")
        scan_mode=scan_request.get("run_scan", {}).get("scanMode", {}).get("mode")

        #TODO: VALIDATE RESQUEST TO MAKE SURE DID NOT INTRODUCE WEIRD STUFF like weird input and so on
        #TODO: check if mode,config and tools exitis in the local file for safety
        #TODO: fix consistency OWASP vs owasp for instance

        # Validate if tool and mode are provided
        if not scan_tool:
            message = "Scan tool is required but not provided."
            logger.warning(message)
            return {"status": "error", "message": message}

        if not scan_mode:
            message = f"Scan mode is required for tool '{scan_tool}' but not provided."
            logger.warning(message)
            return {"status": "error", "message": message}

        # Retrieve scan configuration
        scan_config = scan_request.get("tools", {}).get(scan_tool, {}).get("modes", {}).get(scan_mode)

        # Validate scan configuration existence
        if not scan_config:
            message = f"Configuration for scan tool '{scan_tool}' and scan mode '{scan_mode}' not found. Please verify your selection."
            logger.warning(message)
            return {"status": "error", "message": message}  

        # Start the scan with extracted parameters
        scan_id = await owasp_client.start_zap_basescan(
            scan_tool=scan_tool,
            scan_mode=scan_mode,
            scan_config=scan_config,
        )

        logger.info(f"Scan initiated for tool '{scan_tool}', mode '{scan_mode}'.")  
        return {"scan_id": scan_id, "status": "initiated", "message": "Scan started successfully"}
    except Exception as e:
        logger.error(f"Error starting ZAP scan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start ZAP scan: {str(e)}")


@app.get(
    "/zap/scan-status/{scan_id}",
    summary="Retrieve the status of a ZAP security scan",
    description=(
        "Fetches the current status of a running ZAP security scan and returns the report if available.\n\n"
        "**Path Parameter:**\n"
        "- `scan_id` (str, required): The unique identifier of the security scan.\n\n"
        "**Responses:**\n"
        "- `200 OK`: Successfully retrieved the scan status and report.\n"
        "- `404 Not Found`: Scan ID not found or does not exist.\n"
        "- `500 Internal Server Error`: Unexpected error while checking scan status."
    )
)  
async def get_scan_status(scan_id: str):
    """Retrieves the status of an ongoing scan and returns the report if available."""
    logger.info(f"Checking status for scan ID: {scan_id}")
    try:
        result = await owasp_client.check_scan_status(scan_id)
        return result
    except Exception as e:
        logger.error(f"Error checking scan status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to check scan status: {str(e)}")
    




