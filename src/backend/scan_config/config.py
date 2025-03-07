# Centralized flag configuration
SCAN_FLAGS = {
    "ENABLE_TARGET_URL": {"flag": "-t", "env_var": "TARGET_URL"},
    "ENABLE_SCAN_CONFIG": {"flag": "-c", "env_var": "SCAN_CONFIG"},
    "ENABLE_SCAN_TIMEOUT": {"flag": "-T", "env_var": "SCAN_TIMEOUT"},
    "ENABLE_REMOVE": {"flag": "--remove", "env_var": "REMOVE_VALUE"},
    "ENABLE_SPIDER_MAX_DURATION": {"flag": "-m", "env_var": "SPIDER_MAX_DURATION"},
    "ENABLE_PORT": {"flag": "-P", "env_var": "PORT_NUMBER"},
    "ENABLE_DELAY": {"flag": "-D", "env_var": "DELAY_TIME"},
    "ENABLE_OUTPUT_FILE_JSON": {"flag": "-J", "env_var": "OUTPUT_FILE_JSON"},

    # Standalone flags (boolean, do not require a value)
    "ENABLE_ALPHA": {"flag": "-a", "env_var": None},
    "ENABLE_IGNORE_WARNINGS": {"flag": "-I", "env_var": None},
    "ENABLE_AJAX_SPIDER": {"flag": "-j", "env_var": None},
    "ENABLE_SHORT_OUTPUT": {"flag": "-s", "env_var": None},
    "ENABLE_PASSIVE_SCAN": {"flag": "--disable-passive-scan", "env_var": None},
    "ENABLE_DEBUG": {"flag": "-d", "env_var": None},
}

# Mandatory environment variables
MANDATORY_ENV_VARS = ["SCAN_ID", "SCAN_MODE"]
