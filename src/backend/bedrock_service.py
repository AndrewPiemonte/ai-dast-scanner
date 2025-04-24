import asyncio
import time
from llm.tool_mode_resolver import resolve_tool_mode_config

# Semaphore to limit concurrent Bedrock thread invocations
MAX_CONCURRENT_BEDROCK_CALLS = 3
_bedrock_semaphore = asyncio.Semaphore(MAX_CONCURRENT_BEDROCK_CALLS)


async def invoke(tool: str, mode: str, input_report: str, input_text: str = None) -> dict:
    """
    Selects the correct prompt handler from the registry and delegates execution.

    Args:
        tool (str): Name of the security tool (e.g., "owasp").
        mode (str): Mode of the prompt (e.g., "report").
        input_report (str): Raw JSON string of the security report.
        input_text (str, optional): Optional user input text.

    Returns:
        dict: AI-generated response.

    Raises:
        InvalidJSONInputError, TokenLimitExceeded, LLMInvocationError
    """
    tool = tool.lower()
    mode = mode.lower()

    entry = resolve_tool_mode_config(tool, mode)
    handler_fn = entry["invoke_handler"]

    async with _bedrock_semaphore:
        result = await asyncio.to_thread(
            handler_fn,
            tool=tool,
            mode=mode,
            input_report=input_report,
            input_text=input_text,
        )
        time.sleep(5)  # Throttle to prevent overload
        return result


