from typing import Callable, Dict, Optional, TypedDict

class ToolModeEntry(TypedDict, total=False):
    invoke_handler: Callable
    prompt_key: str
    fields_to_remove: list[str]
    required_inputs: list[str]
    validator: Optional[Callable]
    config: Optional[dict]

ToolModeRegistry = Dict[str, Dict[str, ToolModeEntry]]

# Mutable registry shared across the system
TOOL_MODE_REGISTRY: ToolModeRegistry = {
    "default": {
        "default": {
            "invoke_handler": lambda *args, **kwargs: None,
            "prompt_key": "No valid prompt found for this mode.",
            "fields_to_remove": [],
            "required_inputs": [],
        }
    }
}
