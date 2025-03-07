import os
import subprocess
import json
from config import SCAN_FLAGS, MANDATORY_ENV_VARS


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

        report_path = f"/zap/wrk/{scan_mode}-{scan_id}.json"
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

def log_failure(scan_id, error_message, error_type):
    """Log scan failure details to a JSON file with error handling."""
    
    log_dir = "/zap/wrk/logs"
    log_path = f"{log_dir}/{scan_id}-{error_type}.json"

    # Ensure the logs directory exists
    try:
        os.makedirs(log_dir, exist_ok=True)
    except OSError as e:
        print(f"Error creating log directory '{log_dir}': {e}")
        return  # If directory creation fails, stop execution

    failure_data = {
        "scan_status": error_type,
        "error": error_message,
        "timestamp": scan_id
    }

    # Attempt to write the failure log
    try:
        with open(log_path, "w") as log_file:
            json.dump(failure_data, log_file)

        # Verify the file was created successfully
        if not os.path.exists(log_path):
            print(f"Error: Log file was not created at {log_path}")
        else:
            print(f"Failure log saved at {log_path}")

    except (OSError, IOError) as e:
        print(f"Error writing to log file '{log_path}': {e}")


if __name__ == "__main__":
    execute_zap_scan()
