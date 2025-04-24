from llm.tool_mode_registry_data import TOOL_MODE_REGISTRY, ToolModeEntry
from exceptions import InvalidToolError, InvalidModeError
from app_resources import logger


def resolve_tool_mode_config(tool: str, mode: str) -> ToolModeEntry:
    """
    Resolves and returns the configuration entry for a given tool and mode.

    Automatically normalizes input (lowercase) and validates against the tool/mode registry.

    Args:
        tool (str): The name of the security tool (e.g., 'owasp')
        mode (str): The mode name (e.g., 'report')

    Returns:
        ToolModeEntry: A dictionary containing:
            - invoke_handler (Callable)
            - prompt_key (str)
            - fields_to_remove (List[str])
            - required_inputs (List[str])
            - validator (Optional[Callable])
            - config (Optional[dict])

    Raises:
        InvalidToolError: If the tool name is not in the registry.
        InvalidModeError: If the mode is not defined for the tool.
    """
    tool = tool.lower()
    mode = mode.lower()

    if tool not in TOOL_MODE_REGISTRY:
        available_tools = list(TOOL_MODE_REGISTRY.keys())
        error_msg = (
            f"Invalid tool '{tool}' specified for LLM. "
            f"Available tools: {available_tools}."
        )
        logger.error(error_msg)
        raise InvalidToolError(error_msg)

    if mode not in TOOL_MODE_REGISTRY[tool]:
        available_modes = list(TOOL_MODE_REGISTRY[tool].keys())
        error_msg = (
            f"Invalid mode '{mode}' for tool '{tool}'. "
            f"Available modes: {available_modes}."
        )
        logger.error(error_msg)
        raise InvalidModeError(error_msg)

    return TOOL_MODE_REGISTRY[tool][mode]
