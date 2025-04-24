"""
tool_mode_invoke_handlers.py

Purpose:
This module defines (tool, mode)-specific handlers for generating and invoking prompts 
against AWS Bedrock. It supports both single-prompt execution and fallback chunking strategies 
for large reports.

Key Responsibilities:
- Generate structured prompts using tool/mode-aware logic.
- Validate prompt length against model token limits.
- Automatically fall back to chunked execution when prompts exceed safe limits.
- Return standardized response formats for frontend/API consumption.

Supported Functionality:
- Default single-prompt flow (`owasp_default_handler`)
- OWASP report handler with chunked fallback (`owasp_report_handler`)
- Chunked prompt generation (`generate_chunked_owasp_prompts`)

Exceptions Raised:
- TokenLimitExceeded: Raised when prompt or chunk exceeds model limits.
- LLMInvocationError: Raised on model execution failure.
- InvalidJSONInputError: Raised when input report JSON is malformed.
- ChunkingCoverageError: Raised if not all alerts are included after chunking.

Modification Guidelines:
- To add a new tool or mode:
  1. Define a handler function: `<tool>_<mode>_handler(...)`
  2. Register it in `invoke_handler_registry.py` under `_raw_invoke_registry`
- Use `owasp_default_handler()` for simple tools that don't require custom chunking.
- For chunking, follow the OWASP example to estimate token cost and slice input intelligently.
- Keep chunking thresholds and constants local unless dynamic config is required.

Notes:
- Constants like `SINGLE_ALERT` and `MIN_ALERTS_PER_CHUNK` protect against edge cases
  (e.g., empty chunks, divide-by-zero). These are defensive fallbacks and not expected
  under normal conditions.
"""


import copy
import warnings
import time
import json
from config import prompts
from llm.tool_mode_resolver import resolve_tool_mode_config
import llm.bedrock_utils as bedrock_utils
from config.settings import settings
from transformers import AutoTokenizer
from exceptions import (
    TokenLimitExceeded,
    LLMInvocationError,
    InvalidJSONInputError,
    NoAlertsFoundError,
)
from app_resources import (
    logger, 
)

warnings.filterwarnings("ignore", category=FutureWarning, module="huggingface_hub.file_download")
warnings.filterwarnings(
    "ignore",
    message=".*TensorFlow >= 2.0.*",
    category=UserWarning,
)

# ---------------------------------------
# Tokenizer & Prompt Size Config
# ---------------------------------------
TOKENIZER = AutoTokenizer.from_pretrained(settings.LOCAL_TOKENIZER_MODEL_ID)
MAX_PROMPT_TOKENS = settings.MAX_INPUT_TOKENS - settings.MAX_GENERATED_TOKENS - settings.TOKEN_BUFFER

# ---------------------------------------
# Constants (Local fallback thresholds)
# ---------------------------------------

# -------- OWASP-Specific Logic --------

# Used when simulating a report with exactly one alert (for token cost estimation).
# Only applies to OWASP reports structured around "alerts".
SINGLE_ALERT = 1

# Ensures each OWASP chunk includes at least one alert.
# Prevents empty slices — fallback for rare edge conditions.
MIN_ALERTS_PER_CHUNK = 1

# Prevents divide-by-zero when calculating per-alert token delta.
# Defensive fallback — if triggered, it likely indicates a bug in prompt logic.
MIN_TOKEN_COST = 1

# -------- General Defensive Defaults --------

# Used to maintain consistent response structure when only one prompt is needed.
# Applies to any tool/mode using chunked or unchunked logic.
SINGLE_CHUNK = 1


# ---------------------------------------
# Helper Functions
# ---------------------------------------

MAX_RETRIES = 3
RETRY_DELAY = 10  # seconds

VALIDATORS = {
    ("owasp", "report"): lambda r: isinstance(r, str) and r.strip().startswith("###"),
    # future entries here...
}

def is_valid_response(response, tool: str, mode: str) -> bool:
    """
    Validates the response from the LLM based on the tool and mode context.

    Args:
        response (Any): The raw response returned by the LLM.
        tool (str): The name of the security tool (e.g., "owasp").
        mode (str): The mode of operation (e.g., "report", "baseline").

    Returns:
        bool: True if the response meets expected format/criteria, False otherwise.
    """

    # Default base check for empty or non-string
    if not isinstance(response, str) or not response.strip():
        return False

    # Get the validator function for the given tool/mode
    validator = VALIDATORS.get((tool, mode))

    if validator:
        return validator(response)

    logger.debug(f"No validator registered for ({tool}, {mode}). Using fallback validation.")
    # Default fallback if no specific validator is registered
    return True

def safe_invoke_model(prompt, tool: str, mode: str):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = bedrock_utils.invoke_bedrock_model(prompt)
            if is_valid_response(response=response,tool=tool,mode=mode):
                return response
            else:
                logger.warning(f"Invalid response format on attempt {attempt}")
        except Exception as e:
            logger.error(f"Bedrock model invocation failed on attempt {attempt}: {e}")
        
        time.sleep(RETRY_DELAY * attempt)  # exponential backoff

    raise RuntimeError("Failed to get valid response from Bedrock after retries.")


# ---------------------------------------
# OWASP HANDLER FUNCTIONS
# ---------------------------------------

def owasp_default_handler(tool, mode, input_report, input_text=None):
    """
    Default prompt handler for tools that do not require chunking.
    Handles prompt generation, token validation, and LLM invocation.
    """

    # Generate the appropriate prompt
    prompt = bedrock_utils.generate_prompt(
        tool=tool, 
        mode=mode, 
        input_text=input_text, 
        input_report=input_report
    )

    # Validation, Calculate safe prompt limit
    token_count = len(TOKENIZER.encode(prompt))

    if token_count > MAX_PROMPT_TOKENS:
        error_msg = f"Prompt too long: {token_count} tokens (limit is {MAX_PROMPT_TOKENS})"
        logger.error(error_msg)
        raise TokenLimitExceeded(error_msg)
    try:
        response = safe_invoke_model(prompt=prompt,tool=tool,mode=mode)
        if mode.lower() == "report":
            #Keep same format
            return {
                "total_reports": SINGLE_CHUNK,
                "response": [
                    {
                        "response": response,
                        "report": input_report,
                    }
                ]
            }
        else:
            return {"response": response}
    except Exception as e:
        error_msg = f"LLM invocation failed: {e}"
        logger.error(error_msg)
        raise LLMInvocationError(error_msg)

def owasp_report_handler(tool, mode, input_report, input_text=None):
    """
    Default prompt handler for tools that do not require chunking.
    Handles prompt generation, token validation, and LLM invocation.
    """

    # TODO: FOR DEBUG REMOVE THIS
    logger.error(f"{len(TOKENIZER.encode(input_report))}")

    try:
        # Try normal flow using owasp_default_handler (single-prompt path)
        return owasp_default_handler(tool, mode, input_report, input_text)

    except (TokenLimitExceeded, LLMInvocationError) as e:
        logger.warning(f"Default handler failed for tool '{tool}' mode '{mode}': {e}")
        if mode.lower() == "report":
            logger.info("Proceeding to fallback chunked handler for 'report' mode.")
            # proceed to chunked
        else:
            logger.error(f"Fallback not allowed for mode '{mode}'. Re-raising exception.")
            raise

    except Exception as e:
        logger.critical(f"Unexpected error during default handler: {e}")
        raise
            
    try:
        # Step 3: Chunked execution if prompt is too long
        chunked_prompts = generate_chunked_owasp_prompts(
            input_report=input_report,
            tool=tool,
            mode=mode,
            input_text=input_text,
        )
    except NoAlertsFoundError:  
        # No alerts found, No need to invoke model 
        return {
            "total_reports": SINGLE_ALERT,
            "response": prompts.CYBERSECURITY_PROMPT_NO_ISSUES_FOUND
        }

    # Step 5: Run model on each chunk and collect responses
    try:
        responses = []
        for i, chunk_prompt in enumerate(chunked_prompts):
            logger.info(f"Invoking model on chunk {i + 1}/{len(chunked_prompts)}")

            # Extract the prompt and report from the chunk
            prompt = chunk_prompt["prompt"]
            report = chunk_prompt["report"]
            response = safe_invoke_model(prompt=prompt,tool=tool,mode=mode)
            responses.append({
                "response": response,
                "report": report,
            })
            # Introduce a short delay between consecutive Bedrock LLM calls to reduce 
            # formatting drift and hallucinated output (e.g., extra markdown or headers).
            # This function runs inside a background thread (via asyncio.to_thread),
            # so using time.sleep() here is safe and will NOT block the event loop
            time.sleep(10) 
        return {
            "total_reports": len(chunked_prompts),
            "response": responses
        }
    except Exception as e:
        error_msg = f"LLM invocation failed: {e}"
        logger.error(error_msg)
        raise LLMInvocationError(error_msg)
    
    
# ---------------------------------------
# Chunker Functions
# ---------------------------------------
    
def generate_chunked_owasp_prompts(input_report, tool, mode, input_text):
    """
    Efficiently chunks OWASP report data for LLM consumption using token-aware grouping.

    Strategy:
    - Pack multiple small sites into a chunk.
    - For oversized sites, group alerts using the same strategy.

    Returns:
        List[Dict[str, str]]: Each item is { "prompt": str, "report": str }
    """
    # Step 0a: Parse input JSON if passed as a string
    if isinstance(input_report, str):
        try:
            input_report = json.loads(input_report)
        except json.JSONDecodeError as e:
            error_msg = f"Malformed input_report JSON: {e}"
            logger.error(error_msg)
            raise InvalidJSONInputError(error_msg) from e
        
    # Step 0b: Clean report from uncessary fields
    entry = resolve_tool_mode_config(tool, mode)       
    input_report = bedrock_utils.clean_report(input_report, entry["fields_to_remove"])
        
    # Step 1: Remove empty sites
    all_sites = input_report.get("site", [])
    if not all_sites:
        raise NoAlertsFoundError("No sites found in OWASP report.")

    valid_sites = [site for site in all_sites if site.get("alerts")]
    if not valid_sites:
        raise NoAlertsFoundError("All sites are empty (no alerts).")

    # Step 2: Calculate base token cost (empty report)
    base_report = {**input_report, "site": []}
    base_token_count = len(TOKENIZER.encode(json.dumps(base_report)))
    logger.critical(f"base_token_count: {base_token_count}")

    # Step 3: Categorize sites into 'small' (fit in a chunk) and 'oversized' (must be split)
    small_sites = []
    oversized_sites = []

    for site in valid_sites:
        site_token_count = len(TOKENIZER.encode(json.dumps(site)))
        logger.critical(f"site_token_count: {site_token_count}")
        if site_token_count + base_token_count > MAX_PROMPT_TOKENS:
            oversized_sites.append(site)
        else:
            small_sites.append({
                "site": site,
                "token_count": site_token_count,
            })

    prompt_chunks = []

    # Step 4: Greedily pack small sites into chunks
    while small_sites:
        current_chunk = []
        current_tokens = base_token_count

        for entry in small_sites[:]:
            if current_tokens + entry["token_count"] <= MAX_PROMPT_TOKENS:
                current_chunk.append(entry["site"])
                current_tokens += entry["token_count"]
                small_sites.remove(entry)

        if current_chunk:
            full_report = json.dumps({**input_report, "site": current_chunk})

            prompt = bedrock_utils.generate_prompt(
                tool=tool, 
                mode=mode, 
                input_text=input_text, 
                input_report=full_report
            )

            prompt_chunks.append({
                "prompt": prompt,
                "report": full_report,
            })

    # Step 5: Greedily pack alerts from oversized sites
    for site in oversized_sites:
        logger.info("Chunking oversized site by alerts.")

        # Calculate base token cost for the site without alerts
        site_base = copy.deepcopy(site)
        site_base["alerts"] = []
        base_tokens = len(TOKENIZER.encode(json.dumps(site_base)))

        # Precompute token size of each alert
        alerts = site.get("alerts", [])
        alert_entries = []
        for alert in alerts:
            alert_tokens = len(TOKENIZER.encode(json.dumps(alert)))
            alert_entries.append({
                "alert": alert,
                "token_count": alert_tokens,
            })

            # Check if the alert can ever fit on its own
            if alert_tokens + base_tokens > MAX_PROMPT_TOKENS:
                error_msg = (
                    "Individual alert exceeds maximum token budget (This case has no been handled proprely yet)"
                    f"({alert_tokens + base_tokens} > {MAX_PROMPT_TOKENS})."
                )
                logger.critical(error_msg)
                raise TokenLimitExceeded(error_msg)
            

        # Greedily group alerts into chunks
        while alert_entries:
            current_alerts = []
            current_tokens = base_tokens

            for entry in alert_entries[:]:
                if current_tokens + entry["token_count"] <= MAX_PROMPT_TOKENS:
                    current_alerts.append(entry["alert"])
                    current_tokens += entry["token_count"]
                    alert_entries.remove(entry)

            # Finalize chunk
            if current_alerts:
                site_chunk = copy.deepcopy(site)
                site_chunk["alerts"] = current_alerts
                full_report = json.dumps({**input_report, "site": [site_chunk]})
                prompt = bedrock_utils.generate_prompt(
                    tool=tool, 
                    mode=mode, 
                    input_text=input_text, 
                    input_report=full_report
                )
                
                prompt_chunks.append({
                    "prompt": prompt,
                    "report": full_report,
                })

    return prompt_chunks
