"""
bedrock_service.py

This module manages interaction with AWS Bedrock and integrates with security tools
like OWASP to generate AI-driven insights based on scan reports.

Responsibilities:
- Load and validate configuration for tools and modes.
- Generate prompts dynamically using predefined templates.
- Preprocess input reports, including field filtering and formatting.
- Perform token count validation to avoid exceeding model limits.
- Invoke AWS Bedrock and handle responses robustly.
- Raise consistent domain-specific exceptions for clean API integration.

Key Features:
- Token length validation before invoking models.
- Handles malformed JSON, missing fields, and AWS failures.
- Clean separation between business logic and infrastructure.

Dependencies:
- `app_resources.py` for Bedrock client, logger, and settings.
- `config.prompts` for reusable prompt templates.
- `config.settings` for token/model configuration.
- `exceptions.py` for custom exception classes.

Raises:
- TokenLimitExceeded: If prompt exceeds the allowed token window.
- LLMInvocationError: General failure during LLM invocation.
- ConfigLoadError: Failure to load LLM config JSON.
- InvalidToolError: Specified tool not found in config.
- InvalidModeError: Specified mode not found under tool in config.
- MissingRequiredFieldsError: Required input fields are missing.
- InvalidJSONInputError: Malformed input JSON for reports.
- BedrockClientError: AWS SDK (boto3) request failure.
- BedrockResponseError: Bedrock returned malformed response.
- BedrockUnexpectedError: Other unexpected runtime errors.
"""

import json
from config import prompts
from llm.tool_mode_resolver import resolve_tool_mode_config
from botocore.exceptions import ClientError
from config.settings import settings
from exceptions import (

    MissingRequiredFieldsError,
    InvalidJSONInputError,
    BedrockClientError,
    BedrockResponseError,
    BedrockUnexpectedError,
)
from app_resources import (
    logger, 
    bedrock_client, 
    bedrock_runtime_client,
)

# ---------------------------------------
# FUNCTIONS
# ---------------------------------------

def generate_prompt(tool: str, mode: str, **input_data):
    """
    Builds a text prompt using tool and mode configs.

    Args:
        tool (str): Tool name (e.g., "OWASP").
        mode (str): Prompt mode (e.g., "chat", "report").
        input_data (dict): Payload values.

    Returns:
        str: Fully constructed prompt string.

    Raises:
        ConfigLoadError, InvalidToolError, InvalidModeError, MissingRequiredFieldsError,
        InvalidJSONInputError
    """
    
    # Extract the tool/mode-specific config entry
    entry = resolve_tool_mode_config(tool, mode)
    fields_to_remove = entry["fields_to_remove"]
    prompt_key = entry["prompt_key"]
    required_inputs = entry["required_inputs"]

    # Dynamically validate required inputs from JSON
    missing_inputs = [key for key in required_inputs if key not in input_data or not input_data[key]]

    if missing_inputs:
        error_message = f"Missing required inputs: {', '.join(missing_inputs)}."
        logger.warning(error_message)
        raise MissingRequiredFieldsError(error_message)

    #TODO: make this more dynamic, or write that it shoudl be input_report for the report
    # Process JSON input report if required
    if "input_report" in required_inputs:
        try:
            clean_input_report = clean_report(json.loads(input_data["input_report"]), fields_to_remove)
            input_data["input_report"] = json.dumps(clean_input_report, indent=2)
        except json.JSONDecodeError as e:
            error_msg = f"Invalid input_report. Expected a JSON-formatted string. JSONDecodeError: {e}"
            logger.error(error_msg)
            raise InvalidJSONInputError(error_msg)

    # Retrieve the correct prompt dynamically
    prompt_template = getattr(prompts, prompt_key)
    
    return prompt_template.format(**input_data)


def invoke_bedrock_model(input_text: str):
    """
    Sends input to AWS Bedrock and retrieves model response.

    Args:
        input_text (str): The prompt string.

    Returns:
        str: Generated text from Bedrock.

    Raises:
        BedrockClientError, BedrockResponseError, BedrockUnexpectedError
    """
    try:
        # Prepare the request payload
        body = json.dumps({
            "prompt": input_text,  
            "temperature": 0.7,
            "top_p": 0.9,
            "max_gen_len": 1500
        })

        # Invoke the model
        response = bedrock_runtime_client.invoke_model(
            modelId=settings.BASE_MODEL_ID,
            accept="application/json",
            body=body
        )

        # Parse the response
        response_body = json.loads(response["body"].read())

    except ClientError as e:
        error_msg = f"ClientError while invoking Bedrock model: {e}"
        logger.error(error_msg)
        raise BedrockClientError(error_msg)

    except json.JSONDecodeError as e:
        error_msg = f"JSONDecodeError in response parsing: {e}"
        logger.error(error_msg)
        raise BedrockResponseError(error_msg)

    except Exception as e:
        error_msg = f"Unexpected error while invoking Bedrock model: {e}"
        logger.error(error_msg)
        raise BedrockUnexpectedError(error_msg)
    
    # Ensure the response contains the expected field
    if "generation" not in response_body:
        error_msg = "Missing 'generation' field in Bedrock response."
        logger.error(error_msg)
        raise BedrockResponseError(error_msg)

    return response_body["generation"]

# ---------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------
def clean_report(data, fields_to_remove):
    """
    Recursively removes specified keys from JSON.

    Args:
        data (dict | list): Input JSON.
        fields_to_remove (list): Keys to be removed.

    Returns:
        dict | list: Cleaned JSON.
    """
    if isinstance(data, dict):
        return {k: clean_report(v, fields_to_remove) for k, v in data.items() if k not in fields_to_remove}
    elif isinstance(data, list):
        return [clean_report(i, fields_to_remove) for i in data]
    return data

def remove_hidden_fields(data):
    """
    Removes keys with `display_to_user: False` recursively.

    Args:
        data (dict | list): Input JSON.

    Returns:
        dict | list: Filtered JSON.
    """
    if isinstance(data, dict):
        return {
            key: remove_hidden_fields(value)
            for key, value in data.items()
            if not (isinstance(value, dict) and value.get('display_to_user') is False)
        }
    elif isinstance(data, list):
        return [remove_hidden_fields(item) for item in data]
    return data
