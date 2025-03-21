"""
bedrock_service.py

This module handles interactions with AWS Bedrock and security tool integrations. 
It is responsible for:
- Generating prompts for the LLM (Large Language Model) based on OWASP security reports.
- Invoking the AWS Bedrock model for text generation and processing the responses.
- Validating input data, ensuring proper JSON formatting, and dynamically constructing prompts.
- Handling errors gracefully and returning meaningful HTTP responses.

Key Features:
✅ Dynamic prompt generation based on tool & mode configuration.
✅ Secure upload of prompts to AWS S3.
✅ Integration with AWS Bedrock for text-based security insights.
✅ Comprehensive error handling for API failures, JSON parsing issues, and validation errors.

Dependencies:
- `app_resources.py` for centralized S3, Bedrock, and logging configurations.
- `config.prompts` for predefined prompt templates.
- `config.settings` for AWS model configurations.

Raises:
- `HTTPException`: If input validation fails or the Bedrock model returns an unexpected response.
- `RuntimeError`: If there is a failure in uploading prompts to S3.
- `ClientError`: For AWS-specific request failures.
"""

import json
import os
from app_resources import logger, bedrock_client, bedrock_runtime_client
from config import prompts
from fastapi import HTTPException
from botocore.exceptions import ClientError
from fastapi import HTTPException
from config.settings import settings


def invoke(tool, mode, input_report, input_text=None):
    """
    Generates a prompt based on tool and mode, and invokes the LLM.

    Args:
        tool (str): Security tool name (e.g., "OWASP").
        mode (str): Mode of operation for the prompt (e.g., "chat", "report").
        input_report (str): JSON-formatted security scan report.
        input_text (str, optional): Additional text input for prompt customization.

    Returns:
        dict: Response from the AWS Bedrock model.

    Raises:
        RuntimeError: If prompt upload to S3 fails.
        HTTPException: If the LLM invocation fails.
    """

    # Generate the appropriate prompt
    prompt = generate_prompt(tool=tool, mode=mode, input_text=input_text, input_report=input_report)

    try:
        # Invoke the model with the generated prompt
        response = invoke_bedrock_model(prompt)
        return {"response": response}  # Clean response format
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to invoke LLM: {str(e)}")


def clean_report(data, fields_to_remove):
    """
    Recursively removes specified fields from a JSON report.

    Args:
        data (dict | list): JSON-formatted data to be cleaned.
        fields_to_remove (list): List of field names to remove.

    Returns:
        dict | list: Cleaned JSON data.
    """
    if isinstance(data, dict):
        return {k: clean_report(v, fields_to_remove) for k, v in data.items() if k not in fields_to_remove}
    elif isinstance(data, list):
        return [clean_report(i, fields_to_remove) for i in data]
    return data

def remove_hidden_fields(data):
    """
    Recursively removes entries from JSON data if 'display_to_user' is False.

    Args:
        data (dict or list): The JSON data to process.

    Returns:
        dict or list: Cleaned JSON data.
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

def generate_prompt(tool: str, mode: str, **input_data):
    """
    Constructs a prompt based on the security tool and mode configuration.

    Args:
        tool (str): The security tool name (e.g., "OWASP").
        mode (str): The mode of prompt (e.g., "chat", "report").
        input_data (dict): Additional input data for prompt generation.

    Returns:
        str: Generated prompt.

    Raises:
        HTTPException: If tool/mode is invalid or required inputs are missing.
        RuntimeError: If the configuration file cannot be loaded.
    """

    # Load configuration from JSON file
    config_path = os.path.join(os.path.dirname(__file__), "config/llm_config.json")
    try:
        with open(config_path, "r") as file:
            config_data = json.load(file)
    except Exception as e:
        logger.error(f"Failed to load LLM configuration: {e}")
        raise RuntimeError("Failed to load LLM configuration.") from e
    
    # Validate the selected tool
    if tool not in config_data["tools"]:
        available_tools = list(config_data["tools"].keys())
        raise HTTPException(
            status_code=400,
            detail=f"Invalid tool '{tool}' specified for LLM. "
                f"Available tools: {available_tools}. Please update 'LLM_config.json' accordingly."
        )

    # Validate the selected mode
    if mode not in config_data["tools"][tool]["modes"]:
        available_modes = list(config_data["tools"][tool]["modes"].keys())
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode '{mode}' for tool '{tool}'. "
                f"Available modes: {available_modes}. Please update 'LLM_config.json' accordingly."
        )

    # Extract tool & mode-specific configurations
    tool_config = config_data["tools"][tool]["modes"][mode]
    fields_to_remove = tool_config["fields_to_remove"]
    prompt_key = tool_config["prompt_key"]
    required_inputs = tool_config["required_inputs"]

    # Dynamically validate required inputs from JSON
    missing_inputs = [key for key in required_inputs if key not in input_data or not input_data[key]]

    if missing_inputs:
        error_message = config_data["defaults"]["missing_inputs_message"].format(missing_inputs=", ".join(missing_inputs))
        logger.warning(error_message)
        raise HTTPException(status_code=400, detail=error_message)

    #TODO: make this more dynamic
    # Process JSON input report if required
    if "input_report" in required_inputs:
        try:
            clean_input_report = clean_report(json.loads(input_data["input_report"]), fields_to_remove)
            input_data["input_report"] = json.dumps(clean_input_report, indent=2)
        except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError: Invalid input_report - {e}")
            raise HTTPException(status_code=400, detail="Invalid input_report. Expected a JSON-formatted string.")

    # Retrieve the correct prompt dynamically
    prompt_template = getattr(prompts, prompt_key, config_data["defaults"]["prompt"])
    
    return prompt_template.format(**input_data)


def invoke_bedrock_model(input_text: str):
    """
    Calls AWS Bedrock to process the given input prompt.

    Args:
        input_text (str): The input prompt for the model.

    Returns:
        str: The generated response from the model.

    Raises:
        HTTPException: If the model invocation or response parsing fails.
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

        # Ensure the response contains the expected field
        if "generation" not in response_body:
            logger.error("Missing 'generation' field in Bedrock response.")
            raise HTTPException(status_code=500, detail="Invalid response from Bedrock model.")

        return response_body["generation"]

    except ClientError as e:
            logger.error(f"ClientError while invoking Bedrock model: {e}")
            raise HTTPException(status_code=500, detail="AWS Bedrock request failed.")
    except json.JSONDecodeError as e:
            logger.error(f"JSONDecodeError in response parsing: {e}")
            raise HTTPException(status_code=500, detail="Malformed response from Bedrock model.")
    except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail="Unexpected error while invoking Bedrock model.")

