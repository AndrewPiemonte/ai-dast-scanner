"""
run_scan.py

This script is responsible for executing an security scan dynamically.
It builds the command based on environment variables and scan configurations, 
allowing execution of different scan types using different scripts.

Main Features:
- Dynamically constructs the command to execute different scan modes.
- Ensures required environment variables are set before execution.
- Runs the security scan and logs outputs.
- Handles errors, logs failures, and ensures scan reports are generated.
"""

import os
import subprocess
import logging
import importlib.util
import sys


# initialized later in `main()`
LOGGER = None
SCAN_FLAGS = ""

#TODO: fix "/zap/wrk" will not work with different containers for different tools 
#TODO: MAKE THIS BE INITALIZED BY MAIN
WORKING_DIR = "/zap/wrk"


def get_scan_config():
    """
    Retrieves and validates the necessary environment variables for the scan.

    Steps:
    1. Fetches required variables from environment variables.
    2. Ensures that they are set.
    3. Logs an error and raises an exception if required variables are missing.
    4. Returns the scan mode, scan ID, and report filename.

    Returns:
        tuple: (mode, scan_id, report_filename)

    Raises:
        ValueError: If mode or SCAN_ID is missing.
    """


    mode = os.getenv("SCAN_MODE")
    tool = os.getenv("SCAN_TOOL")
    scan_id = os.getenv("SCAN_ID")
    report_filename = os.getenv("OUTPUT_FILE_JSON")

    if not report_filename:
        LOGGER.warning("The required environment variable 'OUTPUT_FILE_JSON' is missing. As a result, the tool will not generate a structured report. However, the console output from the tool execution will be saved as a report.")
        
    if not mode or not scan_id or not tool:
        LOGGER.error("Missing required environment variable: mode or SCAN_ID or tool")
        raise ValueError("Missing required environment variable: mode or SCAN_ID or tool")
    
    return mode, scan_id, report_filename, tool


def load_tool_config(tool):
    """
    Loads the configuration module for a given scan tool from `{tool}/config.py`.

    Args:
        tool (str): The name of the scan tool.

    Returns:
        module: The imported configuration module.

    Raises:
        FileNotFoundError: If the config file does not exist.
        ImportError: If the module cannot be imported.
    """

    # ✅ Generate unique log file name
    config_path = os.path.join(WORKING_DIR, f"{tool}/config-{mode}.py") 

    if not os.path.exists(config_path):
        LOGGER.error(f"Config file not found: {config_path}")
        raise FileNotFoundError(f"Config file not found: {config_path}")

    try:
        spec = importlib.util.spec_from_file_location("config", config_path)
        config_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(config_module)

        LOGGER.info(f"Loaded config from {config_path}")
        return config_module

    except Exception as e:
        LOGGER.error(f"Error loading configuration: {e}")
        raise ImportError(f"Failed to import config from {config_path}")

def execute_zap_scan(mode,tool , report_filename):
    """
    Executes the security scan by dynamically building the command and running it.

    Steps:
    1. Calls `build_scan_command(mode)` to generate the appropriate command.
    2. Sets the necessary environment variables.
    3. Executes the scan as a subprocess and captures output.
    4. Validates if the scan report was generated.
    5. Logs results and errors, ensuring errors are only raised if no report is found.

    Args:
        mode (str): The scan mode (script) to execute.
        report_filename (str): The name of the expected scan report file.

    Raises:
        FileNotFoundError: If the scan report is not found after execution.
        Exception: For any unexpected errors.
    """

    try:
        command = build_scan_command(mode=mode,tool=tool)

        
        env_vars = os.environ.copy()
        env_vars["PYTHONPATH"] = f"/zap:{WORKING_DIR}"


        LOGGER.info(f"Executing ZAP scan with command: {' '.join(command)}")
        
        
        # Run the scan process
        result = subprocess.run(
            command,
            stdout=sys.stdout,  # Redirects stdout to console
            #stderr=sys.stderr,  # Redirects stderr to console
            text=True,
            env=env_vars
        )


        if result.returncode != 0:
            error_msg = result.stderr.strip() or "No error message"
            LOGGER.info(f"Current Working Directory: {os.getcwd()}")
            LOGGER.error(f"Scan failed with return code {result.returncode}: {error_msg}")

        report_filename_path = os.path.join(WORKING_DIR, os.getenv("OUTPUT_FILE_JSON"))   
        #Only raise a execption if report was not generated
        if not os.path.exists(report_filename_path):
            LOGGER.error(f"Scan report not found: {report_filename}")
            raise FileNotFoundError(f"Scan report not found: {report_filename}")
        LOGGER.info(f"Scan completed successfully. Report saved at {report_filename}")

    except Exception as e:
        LOGGER.critical(f"Unexpected error: {str(e)}")


def build_scan_command(mode, tool):
    """
    Dynamically constructs the scan command based on environment variables.

    Steps:
    1. Builds the base command to execute the specified scanning script.
    2. Iterates through SCAN_FLAGS, checking enabled flags and appending them to the command.
    3. If a flag requires a value, retrieves it from environment variables.
    4. Ensures mandatory flags are enabled and have required values.
    5. Returns the fully constructed command.

    Args:
        mode (str): The scanning script to be executed.

    Returns:
        list: The command list to execute.

    Raises:
        ValueError: If any mandatory flag is not enabled or lacks a required value.
    """

    script_path = os.path.join(WORKING_DIR, f"{tool}/{mode}.py") 

    command = ["python3", script_path]

    # Process flags dynamically
    for flag, config in SCAN_FLAGS.items():
        is_enabled = os.getenv(flag, "False").lower() == "true"

        if is_enabled:
            command.append(config["flag"])

            # Check if the flag requires a value
            if config["env_var"] != "":
                value = os.getenv(config["env_var"])
                if not value and config["mandatory"]:
                    raise ValueError(f"Missing required value for {config['env_var']} when {flag} is enabled")
                if value:
                    command.append(value)

        # Ensure mandatory flags are set even if not explicitly enabled
        elif str(config["mandatory"]).lower() == "true":
            raise ValueError(f"Mandatory flag {flag} must be enabled.")

    return command

def setup_logger(mode, scan_id):
    """
    Configures logging for the scan, creating a separate log file per scan.

    Steps:
    1. Generates a unique log file name based on scan_id and mode.
    2. Sets up a logger with a DEBUG level.
    3. Clears existing handlers to prevent duplicate log entries.
    4. Adds a console handler for terminal logging.
    5. Adds a file handler to store logs in a file.
    6. Logs initialization details and returns the configured logger.

    Args:
        mode (str): The scan mode.
        scan_id (str): Unique scan identifier.

    Returns:
        logger: Configured logger instance.
    """

    # ✅ Generate unique log file name
    log_file = os.path.join(WORKING_DIR, f"scan-logs/{scan_id}-{mode}.log") 

    # ✅ Set up logger
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG) 

     # Define log format
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
 
    # Remove existing handlers to prevent duplicates
    if logger.hasHandlers():
        logger.handlers.clear()


    # Create console handler (prints logs to terminal)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Create file handler (saves logs to file)
    file_handler = logging.FileHandler(log_file, mode="a")  # Append mode
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    logger.info(f"Logging initialized for Scan ID: {scan_id}, Scan Mode: {mode}")

    return logger  # ✅ Return the logger instance

if __name__ == "__main__":
    """
    Main execution entry point.

    Steps:
    1. Retrieves scan configuration by calling `get_scan_config()`.
    2. Initializes logging by calling `setup_logger(mode, scan_id)`.
    3. Executes the scan by calling `execute_zap_scan(mode, report_filename)`.
    """

    mode, scan_id, report_filename, tool = get_scan_config()
    LOGGER = setup_logger(mode=mode, scan_id=scan_id)
    config = load_tool_config(tool)
    SCAN_FLAGS = config.SCAN_FLAGS
    execute_zap_scan(mode=mode, tool=tool, report_filename=report_filename)
