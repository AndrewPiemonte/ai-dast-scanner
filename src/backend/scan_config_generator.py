"""
zap_scan_config_generator.py

This script dynamically generates configuration files for owasp ZAP security scans 
based on `scan_config.json`. It automates the creation of:

1. **`config.py` for each tool and mode**  
   - Extracts scan flags and environment variables from `scan_config.json`.  
   - Saves configurations inside `scan_config/{tool}/config-{mode}.py`.  
   - Skips generating files if the tool directory does not exist.  

2. **`values.yaml` for Helm Deployment**  
   - Dynamically constructs `values.yaml` using scan tool settings.  
   - Runs `helm upgrade --install` after generating the configuration.  
   - Ensures `values.yaml` is formatted correctly for Helm execution.  

3. **`zap-scan-job.yaml` for Helm Scan Job Execution**  
   - Generates a Helm job YAML (`zap-scan-job/templates/{tool}-{mode}.yaml`).  
   - Injects Helm placeholders (`{{ .Values }}`) to allow dynamic configuration.  
   - Adds Helm conditions (`{{- if eq .Values.scan_settings.scanMode "mode" }}`)  
     so only the selected scan mode runs.  

### **Main Features**
 **Automated Configuration Generation** → Extracts relevant scan settings dynamically.  
 **Helm-Ready Deployment** → Generates Helm-compatible configurations.  
 **Environment Variable Injection** → Ensures dynamic runtime configurability.  
 **Error Handling & Logging** → Skips missing directories, prevents crashes, and logs operations.  

### **File Outputs**
- `scan_config/{tool}/config-{mode}.py` → **Python configs per tool/mode**  
- `zap-scan-job/values.yaml` → **Helm configuration for deployment**  
- `zap-scan-job/templates/{tool}-{mode}.yaml` → **Helm scan job template**  

### **Prerequisites**
- Ensure `scan_config.json` is properly structured.  
- Helm must be installed for deployment.  
- The tool directories (`scan_config/{tool}/`) must exist before running this script.  
"""

import json
import yaml
from app_resources import logger
import os
import subprocess
from pathlib import Path
from config.settings import settings  

# Configuration file
SCAN_CONFIG_JSON_PATH = settings.SCAN_CONFIG_JSON_PATH

# Configuration for config.py
OUTPUT_CONFIG_TEMPLATE = settings.OUTPUT_CONFIG_TEMPLATE
OUTPUT_CONFIG_PATH = settings.OUTPUT_CONFIG_PATH

# Global Default Configuration Values.yaml
VALUES_YAML_PATH_CONFIG = settings.VALUES_YAML_PATH_CONFIG
VALUES_YAML_PATH = settings.VALUES_YAML_PATH
DEFAULT_SCAN_TIMEOUT = settings.DEFAULT_SCAN_TIMEOUT
CHART_PATH = settings.CHART_PATH  
RELEASE_NAME = settings.RELEASE_NAME  

# Global Default Configuration zap-scan-job.yaml
TEMPLATE_YAML_PATH_TEMPLATE = settings.TEMPLATE_YAML_PATH_TEMPLATE
DEFAULT_NAMESPACE = settings.NAMESPACE
DEFAULT_AWS_REGION = settings.DEFAULT_AWS_REGION
DEFAULT_S3_BUCKET = settings.BUCKET_NAME
DEFAULT_SERVICE_ACCOUNT = settings.DEFAULT_SERVICE_ACCOUNT
DEFAULT_PARALLELISM = settings.DEFAULT_PARALLELISM
DEFAULT_COMPLETIONS = settings.DEFAULT_COMPLETIONS
DEFAULT_BACKOFF_LIMIT = settings.DEFAULT_BACKOFF_LIMIT
DEFAULT_TTL_SECONDS = settings.DEFAULT_TTL_SECONDS
DEFAULT_CONTAINER_NAME = settings.DEFAULT_CONTAINER_NAME
DEFAULT_MOUNT_PATH = settings.DEFAULT_MOUNT_PATH
DEFAULT_COMMAND = settings.DEFAULT_COMMAND
DEFAULT_VOLUME_NAME = settings.DEFAULT_VOLUME_NAME
DEFAULT_PVC_NAME = settings.DEFAULT_PVC_NAME



def generate_config_py() -> None:
    """
    Reads scan_config.json, extracts scan flags, and generates a config.py file 
    for each tool and mode. The config files are only created if the corresponding 
    tool directory exists.

    **Process:**
    1. Loads `scan_config.json` to retrieve available tools and their scan modes.
    2. Iterates through each tool and mode, extracting scan flags and environment variables.
    3. Formats the extracted data into a Python dictionary (`SCAN_FLAGS`).
    4. Writes the generated configuration to `config.py` inside the tool’s directory.
    5. Skips tools if their directory does not exist, ensuring no unnecessary errors.

    **Generated Files:**
    - `scan_config/{tool}/config-{mode}.py`
    
    **Example Output:**
    ```
    scan_config/
    ├── owasp/
    │   ├── config-fullscan.py   Created
    │   ├── config-quickscan.py   Created
    ├── SomeTool/  ❌ Not Created (Directory Missing)
    ```

    **Notes:**
    - This function does **not create missing directories**; it only processes existing ones.
    - If `config.py` already exists, it is **skipped** to prevent unnecessary overwrites.
    - If an error occurs, it is logged, and execution continues for other tools.

    Raises:
        Exception: If an error occurs while reading `scan_config.json` or writing files.
    """
    try:
        # Load scan_config.json
        with open(SCAN_CONFIG_JSON_PATH, "r") as file:
            config_data = json.load(file)

        # Iterate over all tools and modes
        for tool_name, tool_data in config_data.get("tools", {}).items():

            # Define the output path for the specific tool and mode
            output_config_path = OUTPUT_CONFIG_PATH.format(tool=tool_name)
            # Check if directory exists before processing
            if not os.path.exists(output_config_path) or not os.path.isdir(output_config_path):
                logger.warning(f"SKIPPED: Directory {output_config_path} does not exist. Skipping upload.")
                continue
            
            for mode_name, mode_data in tool_data.get("modes", {}).items():
                
                
                # Define the output path for the specific tool and mode
                output_config = OUTPUT_CONFIG_TEMPLATE.format(tool=tool_name, mode=mode_name)

                # Skip if the config file already exists
                if Path(output_config).exists():
                    logger.info(f"Skipping existing config: {output_config}")
                    continue  


                scan_flags = {}

                # Extract flags from the tool's mode configuration
                mode_config = mode_data.get("config", {})

                for key, details in mode_config.items():
                    flag = details.get("flag")
                    env_var = details.get("env_var", None)
                    mandatory = "true" if details.get("mandatory", False) else "false"

                    if flag:  # Include only items with flags
                        scan_flags[key] = {
                            "flag": flag,
                            "env_var": env_var,
                            "mandatory": mandatory
                        }

                # Step 1: Dump JSON with indentation
                raw_json = json.dumps(scan_flags, indent=4, sort_keys=True)

                # Step 2: Fix indentation (adjust spaces for SCAN_FLAGS)
                raw_json = "SCAN_FLAGS = {\n    " + raw_json.strip("{}") + "\n}\n"

                # Step 3: Prepare config.py content
                config_py_content = f'''"""
Dynamically generated config.py file for {tool_name} - {mode_name}.
Do not edit manually—this file is auto-generated.
"""

# Centralized flag configuration
{raw_json}
'''

                
                # Step 4: Write to the respective config.py file
                with open(output_config, "w") as file:
                    file.write(config_py_content)

                logger.info(f"Successfully generated {output_config}")

    except Exception as e:
        logger.error(f"Error generating config.py files: {e}")


def generate_values_yaml() -> None:
    """
    Generates a values.yaml file dynamically based on scan_config.json.

    **Process:**
    1. Loads `scan_config.json` to retrieve available tools and their scan modes.
    2. Initializes the `values.yaml` structure, including job details and scan settings.
    3. Iterates through each tool and mode:
       - Extracts image details and stores them in `values_yaml["job"]["image"]`.
       - Populates `scan_settings` with tool-specific flags and values.
       - Only includes enabled flags and configured values.
    4. Converts the structured data into YAML format with a proper comment header.
    5. Saves the generated YAML file at `VALUES_YAML_PATH_CONFIG`.
    6. Executes a Helm upgrade using the generated `values.yaml`.

    **Generated File:**
    - `values.yaml` (stores configuration for Helm deployment)

    **Example Output:**
    ```yaml
    job:
      name: ""
      namespace: default
      scanid: ""
      image:
        repository: "owasp/zap"
        tag: "latest"
      awsRegion: <DEFAULT REGION>
      s3Bucket: "my-s3-bucket"
      scanTimeout: 3600
    scan_settings:
      zapScanJobEnabled: False
      scanMode: ""
      scanTool: ""
      owasp:
        fullscan:
          flags:
            ENABLE_DEBUG: true
            ENABLE_TARGET_URL: true
          values:
            TARGET_URL: "https://example.com"
    ```

    **Notes:**
    - If `values.yaml` already exists, the function **skips generation**.
    - Ensures `values.yaml` structure matches Helm chart expectations.
    - Runs `helm upgrade` automatically after YAML generation.
    - Logs details of file generation and Helm execution.
    
    **Helm Upgrade Execution:**
    - Runs `helm upgrade --install` using the generated `values.yaml`.
    - Captures and logs `stdout` and `stderr` from the Helm process.
    
    **Error Handling:**
    - If `scan_config.json` is missing or invalid, logs an error.
    - If Helm upgrade fails, captures and logs the error output.
    - Handles unexpected exceptions to prevent script crashes.

    Raises:
        FileNotFoundError: If `scan_config.json` does not exist.
        json.JSONDecodeError: If `scan_config.json` has invalid JSON format.
        subprocess.CalledProcessError: If the Helm upgrade command fails.
        Exception: If any unexpected error occurs.
    """
    try:
        if Path(VALUES_YAML_PATH_CONFIG).exists():
            logger.info(f"Skipping values.yaml generation (already exists): {VALUES_YAML_PATH_CONFIG}")
            return 

        # Load scan_config.json
        with open(SCAN_CONFIG_JSON_PATH, "r") as f:
            scan_config = json.load(f)

        # Initialize values.yaml structure
        values_yaml = {
            "job": {
                "name": "",  # To be set dynamically
                "namespace": DEFAULT_NAMESPACE,
                "scanid": "",  # To be set dynamically
                "image": {
                    "repository": "", 
                    "tag": ""
                },
                "awsRegion": DEFAULT_AWS_REGION,
                "s3Bucket": DEFAULT_S3_BUCKET,
                "scanTimeout": DEFAULT_SCAN_TIMEOUT
            },
            "s3": {
                "bucketName": DEFAULT_S3_BUCKET
            },
            "scan_settings": {
                "zapScanJobEnabled": False,  
                "scanMode": "",  # To be set dynamically
                "scanTool": "",  # To be set dynamically
            }
        }

        # Iterate over all tools and modes to populate scan_settings
        for tool_name, tool_data in scan_config.get("tools", {}).items():
            values_yaml["scan_settings"][tool_name.lower()] = {}

            # Iterate over all modes
            for mode, mode_data in tool_data.get("modes", {}).items():

                # Extract tool config
                tool_config = mode_data["config"]
                image_info = tool_data["image"]

                # Update job image details from the last processed tool/mode
                values_yaml["job"]["image"]["repository"] = image_info["repository"]
                values_yaml["job"]["image"]["tag"] = image_info["tag"]

                # Initialize mode section under tool
                values_yaml["scan_settings"][tool_name.lower()][mode] = {
                    "flags": {},
                    "values": {}
                }

                # Populate flags and values dynamically
                for key, config in tool_config.items():
                    values_yaml["scan_settings"][tool_name.lower()][mode]["flags"][key] = config.get("enabled", False)
                    if config.get("type") == "dynamic":
                        continue  # Dynamic variables set in template.yaml
                    elif config.get("env_var"):
                        values_yaml["scan_settings"][tool_name.lower()][mode]["values"][config["env_var"]] = config.get("value", "")

        # Convert to YAML format
        yaml_comment = "# This file is dynamically generated for all active tools and modes. Do not edit manually.\n\n"
        yaml_content = yaml.dump(values_yaml, default_flow_style=False, sort_keys=False, width=float("inf"))

        # Save to YAML file
        with open(VALUES_YAML_PATH_CONFIG, "w") as yaml_file:
            yaml_file.write(yaml_comment)
            yaml_file.write(yaml_content)

        logger.info(f" Generated values.yaml at: {VALUES_YAML_PATH_CONFIG}")

        # Run upgrade helm
        helm_command = [
            "helm", "upgrade", "--install", RELEASE_NAME, CHART_PATH, "-f", VALUES_YAML_PATH_CONFIG, "--debug"
        ]

        subprocess.run(
           helm_command,
           check=True,
           text=True,
           capture_output=True  
        )

        logger.info(f" Helm upgrade successful")
      
    except subprocess.CalledProcessError as e:
        logger.error(f"Helm upgrade failed:\n{e.stderr}")
    except FileNotFoundError:
        logger.error(f"Error: The file {SCAN_CONFIG_JSON_PATH} was not found.")
    except json.JSONDecodeError:
        logger.error(f"Error: Failed to parse JSON in {SCAN_CONFIG_JSON_PATH}. Check the file format.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")


def generate_zap_scan_job_yaml() -> None:
    """
    Generates a zap-scan-job.yaml file dynamically for each tool and mode 
    based on scan_config.json.

    **Process:**
    1. Loads `scan_config.json` to retrieve available tools and their scan modes.
    2. Iterates through each tool and mode:
       - Extracts configuration settings.
       - Builds a structured YAML representation for the scan job.
       - Injects Helm placeholders (`{{ .Values }}`) where necessary.
    3. Dynamically appends relevant environment variables to the job definition.
    4. Writes the generated YAML to `zap-scan-job/templates/{tool}-{mode}.yaml` only if it does not already exist.
    5. Adds a Helm conditional (`{{- if eq .Values.scan_settings.scanMode "mode" }}`) 
       to ensure the job runs only when the selected scan mode is active.

    **Generated Files:**
    - `zap-scan-job/templates/{tool}-{mode}.yaml`

    **Example Output:**
    ```yaml
    # Dynamically generated for tool 'owasp', mode 'fullscan'. Do not edit manually.

    {{- if eq .Values.scan_settings.scanMode "fullscan" }}
    apiVersion: batch/v1
    kind: Job
    metadata:
      name: {{ .Values.job.name }}
      namespace: {{ .Values.job.namespace }}
    spec:
      parallelism: 1
      completions: 1
      backoffLimit: 0
      ttlSecondsAfterFinished: 600
      template:
        spec:
          serviceAccountName: backend-sa
          containers:
          - name: zap-baseline
            image: owasp/zap:latest
            command:
            - python3
            - /zap/wrk/run_scan.py
            env:
            - name: SCAN_TOOL
              value: "{{ .Values.scan_settings.scanTool }}"
            - name: SCAN_MODE
              value: "{{ .Values.scan_settings.scanMode }}"
            - name: SCAN_ID
              value: "{{ .Values.job.scanid }}"
            - name: ENABLE_DEBUG
              value: "{{ .Values.scan_settings.owasp.fullscan.flags.ENABLE_DEBUG }}"
            - name: TARGET_URL
              value: "{{ .Values.scan_settings.owasp.fullscan.values.TARGET_URL }}"
    {{- end }}
    ```

    **Notes:**
    - If a job YAML file already exists, the function **skips its generation**.
    - Dynamically injects values for Helm templates.
    - Uses `@` placeholders to replace dynamic values properly (`@` → `"`).
    - Ensures **only the selected scan mode runs** in Helm.

    **Error Handling:**
    - Logs a warning and **skips invalid configurations** (incorrect format).
    - If `scan_config.json` is missing, logs an error.
    - Handles unexpected exceptions to prevent crashes.

    Raises:
        FileNotFoundError: If `scan_config.json` does not exist.
        Exception: If any unexpected error occurs.
    """
    try:
        # Load scan_config.json
        with open(SCAN_CONFIG_JSON_PATH, "r") as f:
            scan_config = json.load(f)

        for tool_name, tool_data in scan_config.get("tools", {}).items():
            for mode, mode_data in tool_data.get("modes", {}).items():

                template_yaml_path = TEMPLATE_YAML_PATH_TEMPLATE.format(tool=tool_name.lower(), mode=mode)

                # Skip if template.yaml already exists
                if Path(template_yaml_path).exists():
                    logger.info(f"Skipping existing zap-scan-job.yaml for tool: {tool_name}, mode: {mode}")
                    continue

                # Extract tool config
                tool_config = mode_data["config"]
                image_info = tool_data["image"]

                # Construct YAML structure (Preserving Helm placeholders and adding direct image)
                job_yaml = {
                    "apiVersion": "batch/v1",
                    "kind": "Job",
                    "metadata": {
                        "name": "{{ .Values.job.name }}",
                        "namespace": "{{ .Values.job.namespace }}"
                    },
                    "spec": {
                        "parallelism": DEFAULT_PARALLELISM,
                        "completions": DEFAULT_COMPLETIONS,
                        "backoffLimit": DEFAULT_BACKOFF_LIMIT,
                        "ttlSecondsAfterFinished": DEFAULT_TTL_SECONDS,
                        "template": {
                            "spec": {
                                "serviceAccountName": DEFAULT_SERVICE_ACCOUNT,
                                "containers": [
                                    {
                                        "name": DEFAULT_CONTAINER_NAME,
                                        "image": f"{image_info['repository']}:{image_info['tag']}",  # Direct Image
                                        "command": DEFAULT_COMMAND,
                                        "env": [
                                            {"name": "SCAN_TOOL", "value": "@{{ .Values.scan_settings.scanTool }}@"},
                                            {"name": "SCAN_MODE", "value": "@{{ .Values.scan_settings.scanMode }}@"},
                                            {"name": "SCAN_ID", "value": "@{{ .Values.job.scanid }}@"},
                                        ],  # Environment variables will be appended dynamically
                                        "volumeMounts": [{"name": DEFAULT_VOLUME_NAME, "mountPath": DEFAULT_MOUNT_PATH}],
                                        "securityContext": {"runAsUser": 0, "runAsGroup": 0}
                                    }
                                ],
                                "volumes": [{"name": DEFAULT_VOLUME_NAME, "persistentVolumeClaim": {"claimName": DEFAULT_PVC_NAME}}],
                                "restartPolicy": "Never"
                            }
                        }
                    }
                }

                # Add environment variables dynamically
                for key, config in tool_config.items():
                    if not isinstance(config, dict):
                        logger.warning(f"Skipping invalid config for key: {key} in mode {mode}, tool {tool_name}")
                        continue

                    
                    
                    job_yaml["spec"]["template"]["spec"]["containers"][0]["env"].append(
                        {"name": key, "value": f"@{{{{ .Values.scan_settings.{tool_name.lower()}.{mode}.flags.{key} }}}}@"}
                    )

                    if config.get("env_var"):
                        if config.get("type") == "dynamic":
                            job_yaml["spec"]["template"]["spec"]["containers"][0]["env"].append(
                            {"name": config["env_var"], "value": f"@{config['value']}@"}
                        )
                        else:
                            job_yaml["spec"]["template"]["spec"]["containers"][0]["env"].append(
                            {"name": config["env_var"], "value": f"@{{{{ .Values.scan_settings.{tool_name.lower()}.{mode}.values.{config['env_var']} }}}}@"}
                        )

                # Convert to YAML and save with Helm conditional logic
                yaml_comment = f"# Dynamically generated for tool '{tool_name}', mode '{mode}'. Do not edit manually.\n\n"
                yaml_content = yaml.dump(job_yaml, default_flow_style=False, sort_keys=False, width=1000000)

                # Replace placeholders and clean formatting
                yaml_content = yaml_content.replace("'", "")  # Remove single quotes added by PyYAML
                yaml_content = yaml_content.replace("@", '"')  # Replace @ placeholders with actual quotes

                final_yaml = f"""{{{{- if and (eq .Values.scan_settings.scanMode "{mode}") (eq .Values.scan_settings.scanTool "{tool_name}") }}}}
{yaml_content}
{{{{- end }}}}"""


                with open(template_yaml_path, "w") as yaml_file:
                    yaml_file.write(yaml_comment)
                    yaml_file.write(final_yaml)

                logger.info(f" Generated zap-scan-job.yaml for tool: {tool_name}, mode: {mode}")

    except FileNotFoundError:
        logger.error(f"Error: The file {SCAN_CONFIG_JSON_PATH} was not found.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
