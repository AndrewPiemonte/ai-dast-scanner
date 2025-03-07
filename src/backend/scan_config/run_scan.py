import os
import subprocess
import logging
import json
from config import SCAN_FLAGS, MANDATORY_ENV_VARS


# ✅ Global logger (initialized later in `main()`)
LOGGER = None

# Configure logging
LOG_DIR = "/zap/wrk/scan-logs"
os.makedirs(LOG_DIR, exist_ok=True)


def execute_zap_scan():
    """Execute the ZAP scan and handle output logging."""
    try:
        command, scan_id, scan_mode = build_scan_command()
        print("Executing ZAP scan with command:", " ".join(command))

        env_vars = os.environ.copy()
        env_vars["PYTHONPATH"] = "/zap:/zap/wrk"

        print(command)

        result = subprocess.run(command, check=True, capture_output=True, text=True, env=env_vars)
        print("Scan Output:", result.stdout)

        # Ensure OUTPUT_FILE_JSON is not None and properly joins the path
        report_filename = os.getenv("OUTPUT_FILE_JSON")  # Provide a default filename
        report_path = os.path.join("/zap/wrk", report_filename)
        if not os.path.exists(report_path):
            raise FileNotFoundError(f"Scan report not found: {report_path}")

        print(f"Scan completed successfully. Report saved at {report_path}")

    except (subprocess.CalledProcessError, FileNotFoundError, ValueError) as e:
        print("Scan error:", str(e))
        #log_failure(scan_id, str(e), "Failure")


def build_scan_command():
    """Generates the scan command dynamically based on enabled flags and their values."""

    env_vars = {}

    # Ensure mandatory variables are set
    for var in MANDATORY_ENV_VARS:
        value = os.getenv(var)
        if not value:
            raise ValueError(f"Missing required environment variable: {var}")
        env_vars[var] = value

    # Extract scan mode (must be set in the environment)
    scan_mode = env_vars["SCAN_MODE"]
    scan_id = env_vars["SCAN_ID"]

    command = ["python3", f"/zap/wrk/{scan_mode}.py"]
    
    # Process flags dynamically
    for flag, config in SCAN_FLAGS.items():
        is_enabled = os.getenv(flag, "False").lower() == "true"
        if is_enabled:
            command.append(config["flag"])
            if config["env_var"]:  # If it requires a value
                value = os.getenv(config["env_var"])
                if not value:
                    raise ValueError(f"Missing required value for {config['env_var']} when {flag} is enabled")
                command.append(value)
                env_vars[config["env_var"]] = value

    #command.append(" || true")
    return command, scan_id, scan_mode

def get_env_var(name, default=None, cast_type=None, scan_id=None):
    """Fetch an environment variable, detect its stored type, and apply type conversion.
    
    Logs an error if a flag is enabled but no value is set.
    """
    value = os.getenv(name)

    # Log an error if the variable is missing but should be set
    if value is None:
        #log_failure(scan_id, f"Expected environment variable '{name}", "Warning")
        print("WARNING")
        return default

    # Handle boolean conversion explicitly
    if cast_type == bool:
        return value.lower() == "true" if isinstance(value, str) else bool(value)

    # Automatically detect type: Convert if numeric, else keep as string
    if value.isdigit():
        return int(value)

    return value  # Default: return as string


def setup_logger():
    """
    Configures logging for the scan, creating a separate log file per scan.
    
    Returns:
        logger: Configured logger instance.
    """
    scan_id = os.getenv("SCAN_ID")
    scan_mode = os.getenv("SCAN_MODE")

    if not scan_id:
        raise ValueError("Missing required environment variable: SCAN_ID")

    if not scan_mode:
        raise ValueError("Missing required environment variable: SCAN_MODE")

    # ✅ Generate unique log file name
    log_file = os.path.join(LOG_DIR, f"{scan_id}-{scan_mode}.log")  # Corrected file name

    # ✅ Set up logger
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    # Remove existing handlers to prevent duplicates
    if logger.hasHandlers():
        logger.handlers.clear()

    # Create file handler (saves logs to file)
    file_handler = logging.FileHandler(log_file, mode="a")  # Append mode
    file_handler.setLevel(logging.DEBUG)

    # Create console handler (prints logs to terminal)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # Define log format
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Attach handlers
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    logger.info(f"Logging initialized for Scan ID: {scan_id}, Scan Mode: {scan_mode}")

    return logger  # ✅ Return the logger instance

def log_failure(scan_id, error_message, error_type):
    """Log scan failure details to a JSON file with error handling."""
    global LOGGER

    failure_data = {
        "scan_status": error_type,
        "error": error_message,
        "timestamp": scan_id
    }

    try:
        # ✅ Log structured JSON for machine-readable logs
        LOGGER.error(json.dumps(failure_data, indent=4))

    except Exception as e:
        # Fallback in case logging fails (e.g., log file is locked, logger crashes)
        print(f"Logging failure encountered: {e}")
        print(f"Scan Failure: {failure_data}")

if __name__ == "__main__":
    LOGGER = setup_logger()
    execute_zap_scan()
