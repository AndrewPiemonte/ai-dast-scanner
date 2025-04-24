from llm.tool_mode_registry_data import TOOL_MODE_REGISTRY
from llm.tool_mode_handlers import owasp_report_handler, owasp_default_handler

# Populate the registry
TOOL_MODE_REGISTRY.update({
    "owasp": {
        "chat": {
            "invoke_handler": owasp_default_handler,
            "prompt_key": "CYBERSECURITY_PROMPT_TEMPLATE_CHAT",
            "fields_to_remove": [
                "instances", "pluginid", "alertRef", "wascid",
                "sourceid", "cweid", "otherinfo", "sequences",
                "@programName", "@version", "@port", "@ssl"
            ],
            "required_inputs": ["input_text", "input_report"],
        },
        "report": {
            "invoke_handler": owasp_report_handler,
            "prompt_key": "CYBERSECURITY_PROMPT_TEMPLATE_REPORT",
            "fields_to_remove": [
                "instances", "pluginid", "alertRef", "wascid",
                "sourceid", "cweid", "otherinfo", "sequences",
                "@programName", "@version", "@port", "@ssl"
            ],
            "required_inputs": ["input_report"],
        }
    }
})
