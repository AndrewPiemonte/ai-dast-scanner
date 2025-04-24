import llm.tool_mode_registry #Need this to update the registry
import json
import bedrock_service
import owasp_client
import s3_utils
import os
import scan_config_generator
from app_resources import logger
from config.settings import settings 
from app import app
from fastapi import HTTPException, Body
from llm.bedrock_utils import (
    remove_hidden_fields,
    clean_report,
)
from exceptions import (
    TokenLimitExceeded,
    LLMInvocationError,
    ConfigLoadError,
    InvalidToolError,
    InvalidModeError,
    MissingRequiredFieldsError,
    InvalidJSONInputError,
    BedrockClientError,
    BedrockResponseError,
    BedrockUnexpectedError,
)


# Configuration file
SCAN_CONFIG_JSON_PATH = settings.SCAN_CONFIG_JSON_PATH
BUCKET_NAME = settings.BUCKET_NAME
MAX_RUNNING_JOBS = 3

#TODO: FIX so not all events start with every pods/release
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
                "allDependenciesAvailable",
                "policyId",
                "cweId",
                "alertThreshold",
                "wascId",
                "quality",
                "status",
                "dependencies"
                }
            config_data = remove_hidden_fields(data=config_data)
            config_data = clean_report(data=config_data, fields_to_remove=fields_to_remove)
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

    scan_tool = payload.get("tool", "").strip() if payload.get("tool") else None
    scan_mode = payload.get("mode", "").strip().lower() if payload.get("mode") else None
    input_text = payload.get("input_text") if payload.get("input_text") else None
    input_report = payload.get("input_report") if payload.get("input_report") else None


    # Validate if tool and mode are provided
    if not scan_tool:
        error_msg = "Scan tool is required but not provided."
        logger.warning(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)

    if not scan_mode:
        error_msg = f"Scan mode is required for tool '{scan_tool}' but not provided."
        logger.warning(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    try:

        if isinstance(input_report, dict):  
            report_data = input_report  # Already a JSON object
        elif isinstance(input_report, str):  
            report_data = json.loads(input_report)  # Convert string to JSON
        else:
            raise InvalidJSONInputError("input_report must be a valid JSON object or JSON string.")

        input_report_str = json.dumps(report_data, indent=2)

        # Invoke AI analysis
        return await bedrock_service.invoke(
            tool=scan_tool, 
            mode=scan_mode, 
            input_text=input_text, 
            input_report=input_report_str
        )
    
    except (InvalidToolError, InvalidModeError, json.JSONDecodeError, 
        MissingRequiredFieldsError, InvalidJSONInputError, TokenLimitExceeded,
        InvalidJSONInputError) as e:
        error_msg=f"Client input validation failed: {e}"
        logger.warning(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    except ConfigLoadError as e:
        error_msg=f"Internal error with config files: {e}"
        logger.critical(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)    
    except LLMInvocationError as e:
        error_msg=f"Error invoking LLM model: {e}"
        logger.critical(error_msg)
        raise HTTPException(status_code=502, detail=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error while invoking LLM model: {e}"
        logger.critical(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)


@app.post(
    "/zap/basescan",
    summary="Initiate a Security Scan",
    description=(
        "Starts a security scan using the specified tool and scan mode.\n\n"
        "**Request Body:**\n"
        "- `config.run_scan` (dict, required): Contains the selected scan tool and mode.\n"
        "- `config.tools` (dict, required): Contains the scan configuration overrides.\n\n"
        "**Behavior:**\n"
        "Loads the base configuration from the local file, applies valid overrides from the frontend, and initiates the scan.\n\n"
        "**Responses:**\n"
        "- `200 OK`: Scan successfully started and returns the scan ID.\n"
        "- `400 Bad Request`: Missing or invalid parameters.\n"
        "- `404 Not Found`: Config file or base configuration not found.\n"
        "- `500 Internal Server Error`: Unexpected error while initiating the scan."
    )
)
async def zap_basescan(scan_request: dict):
    """
    API entrypoint to start a ZAP-based security scan using a specific tool and scan mode.
    Dynamically updates in-memory scan configuration based on frontend input.
    """
    try:
        active_pods = owasp_client.count_active_pods()

        logger.info(f"Active pods count: {active_pods}")

        if active_pods >= MAX_RUNNING_JOBS:
            error_msg = (
                f"Server is currently overloaded: {active_pods} active pods "
                f"(limit: {MAX_RUNNING_JOBS}). Cannot schedule new scan. Try again in a few minutes."
                "If you require more concurrent scans, consider increasing node capacity or enabling autoscaling."
            )
            logger.warning(error_msg)
            raise HTTPException(status_code=503, detail=error_msg)
    except Exception as e:
        error_msg = f"Failed to check current active pods: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    
    try:
        # Extract the scan tool and scan mode from the request payload
        scan_config_request = scan_request.get("config", {})
        scan_tool = scan_config_request.get("run_scan", {}).get("scanMode", {}).get("tool")
        scan_mode = scan_config_request.get("run_scan", {}).get("scanMode", {}).get("mode")

        # Validate required parameters
        if not scan_tool:
            error_msg = "Scan tool is required but not provided."
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)

        if not scan_mode:
            error_msg = f"Scan mode is required for tool '{scan_tool}' but not provided."
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)

        # Retrieve the user-supplied config overrides from the request
        incoming_config = (
            scan_config_request.get("tools", {})
            .get(scan_tool, {})
            .get("modes", {})
            .get(scan_mode, {})
            .get("config", {})
        )

        # Validate that override config is provided
        if not incoming_config:
            error_msg = f"No override config provided for tool '{scan_tool}' and mode '{scan_mode}'."
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        #TODO:REMOVE FOR DEBUGGING
        logger.warning(f"Incoming config: {incoming_config}")

         # Load the base configuration from the static config JSON file
        if not os.path.exists(SCAN_CONFIG_JSON_PATH):
            logger.error(f"Config file not found: {SCAN_CONFIG_JSON_PATH}")
            raise HTTPException(status_code=404, detail="Configuration file not found")

        #TODO: Raise exeception?
        with open(SCAN_CONFIG_JSON_PATH, "r", encoding="utf-8") as file:
            local_config = json.load(file)

        # Extract the relevant config block based on tool and mode
        base_config = (
            local_config.get("tools", {})
            .get(scan_tool, {})
            .get("modes", {})
            .get(scan_mode, {})
        )

        # Validate that the config structure exists and contains a 'config' section
        if not base_config or "config" not in base_config:
            error_msg = f"Provided configuration for tool '{scan_tool}' and mode '{scan_mode}' not found in local file."
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)

        # Apply frontend-provided overrides to the in-memory scan configuration.
        #
        # This logic:
        # - Validates that only known keys (already present in the local config) are updated.
        # - Ensures structure integrity by only modifying 'value' and 'enabled' fields.
        # - Does NOT persist changes to disk — only updates the config in memory for the current scan run.
        #
        # This provides dynamic config customization while protecting against malformed or unauthorized input.
        for key, override in incoming_config.items():
            if (
                key in base_config["config"]
                and isinstance(base_config["config"][key], dict)
                and isinstance(override, dict)
            ):
                # ✅ Check all required fields exist
                required_fields = {"value", "enabled", "mandatory"}
                missing_fields = required_fields - override.keys()
                if missing_fields:
                    error_msg = f"config.'{key}' missing required field(s): {', '.join(missing_fields)}"
                    logger.warning(error_msg)
                    raise HTTPException(status_code=400, detail=error_msg)

                # ✅ Enforce: if mandatory is true, enabled must also be true
                if override["mandatory"] is True and override["enabled"] is False:
                    error_msg = "'{key}' is mandatory, but enabled is false"
                    logger.warning(error_msg)
                    raise HTTPException(status_code=400, detail=error_msg)

                # ✅ Apply values to base_config
                base_config["config"][key]["value"] = override["value"]
                base_config["config"][key]["enabled"] = override["enabled"]

            else:
                error_msg = "Unknown or invalid configuration key: '{key}' not found in local file "
                logger.warning(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)


        # Start the scan using the dynamically updated configuration
        scan_id = await owasp_client.start_zap_basescan(
            scan_tool=scan_tool,
            scan_mode=scan_mode,
            scan_config=base_config  
        )

        logger.info(f"Scan initiated for tool '{scan_tool}', mode '{scan_mode}'.")
        return {"scan_id": scan_id, "status": "initiated", "message": "Scan started successfully"}

    #TODO: DO WE NEED THIS
    except json.JSONDecodeError:
        logger.error(f"Config file is not valid JSON: {SCAN_CONFIG_JSON_PATH}")
        raise HTTPException(status_code=400, detail="Invalid JSON format in configuration file")

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
    