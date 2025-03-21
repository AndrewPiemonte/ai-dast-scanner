# Security Scan Configuration

## Overview

This document provides an overview of the security scanning configuration files for OWASP ZAP and other security tools. These configurations define how scans are executed, which parameters are used, and how results are handled.

## Folder Structure

All configuration files are stored within the `config` directory. The main configurations are:

- **`scan_config.json`**: Defines scan settings, including tools and modes.
- **`settings.py`**: Manages environment variables and default parameters for AWS, S3, Kubernetes, and other system components.
- **`prompts.py`**: Contains predefined AI prompts for cybersecurity-related tasks.
- **`llm_config.json`**: Uses configuration settings to manage different interactions with AI through tailored prompts. It also trims security reports by removing unnecessary fields, improving efficiency, and preventing issues like model choking while keeping responses concise.

### **Scan Configuration (********`scan_config.json`********)**

This file serves two main purposes:

1. **Automates Code Execution**:
   - Generates a YAML file for each mode under each tool.
   - A single `values.yaml` file is generated initially and updated dynamically by the code.
   - Configuration files are generated for each mode and each tool to ensure proper execution.
   - Allows new modes and tools to be added seamlessly.
   - Generates a YAML file for each mode under each tool.
   - A single `values.yaml` file is generated initially and updated dynamically by the code.
   - Configuration files are generated for each mode and each tool to ensure proper execution.
2. **Frontend Integration**:
   - Allows the frontend to define and modify scan configurations dynamically.
   - Enables users to select tools, scan modes, and parameters before execution.
   - Ensures that scan settings align with the application's security needs and requirements.
   This file serves two main purposes:
   This file controls the **execution of security scans**, specifying:

#### **Example Scan Configuration**

```json
{
  "tools": {
    "OWASP": {
      "description": "Performs a comprehensive security assessment, including active and passive scanning, to identify vulnerabilities such as SQL Injection, Cross-Site Scripting (XSS), and Remote File Inclusion. Supports authentication, AJAX crawling, configurable attack strength, and detailed reporting. Ideal for full application security evaluations with customizable test selection.",
      "image": {
        "repository": "ghcr.io/zaproxy/zaproxy",
        "tag": "stable"
      },
      "modes": {
        "fullscan": {
          "description": "OWASP ZAP is an open-source web security scanner that detects vulnerabilities in web apps and APIs.",
          "config": {
            "ENABLE_ALPHA": {
              "type": "boolean",
              "display_to_user": true,
              "value": false,
              "enabled": false,
              "mandatory": false,
              "flag": "-a",
              "env_var": "",
              "description": "Enables experimental scan features (not recommended for production)."
            }
          }
        }
      }
    }
  }
}
```

### Explanation of Example Configuration

- **`tools`**: Defines available security tools for scanning.
- **`OWASP`**: Specifies the OWASP ZAP tool, including its description and container image.
- **`modes`**: Lists available scan modes, such as `fullscan` which is a script to run a scan.
- **`description`**: Provides a brief explanation of what each mode does.
- **`config`**: Defines configuration settings for the scan, such as enabling experimental features.
- **`ENABLE_ALPHA`**: A boolean setting that, if enabled, activates experimental OWASP ZAP scan features. The `display_to_user` property controls whether this option is shown in a UI.


### **Environment Variables (********`settings.py`********)**

This Python file centralizes all **configurations related to AWS, Kubernetes, and system settings**. It allows **dynamic updates** by loading values from **environment variables**.

Key configurations:

- **ZAP API URL** (`ZAP_BASE_URL`)
- **AWS Role & S3 Bucket** (`AWS_ROLE_ARN`, `BUCKET_NAME`)
- **Kubernetes Settings** (`K8S_NAMESPACE`)
- **Timeouts & Limits** (`DEFAULT_SCAN_TIMEOUT`, `PARALLELISM`)

### **LLM Configuration (`llm_config.json`)**

The **AI-powered security analysis** is configured in this file. It defines how the LLM processes cybersecurity reports and applies different prompts to specific use cases.

Each mode serves a distinct purpose, utilizing customized **prompt building** to tailor AI-generated responses. The configuration includes the following fields:

- **`prompt_key`**: Defines the specific AI prompt template used for this mode.
- **`fields_to_remove`**: Specifies unnecessary metadata fields that should be excluded from AI processing.
- **`required_inputs`**: Lists mandatory inputs needed for the AI to generate meaningful responses.

### **Example Configuration**
```json
{
  "tools": {
    "OWASP": {
      "modes": {
        "chat": {
          "prompt_key": "CYBERSECURITY_PROMPT_TEMPLATE_CHAT",
          "fields_to_remove": [
            "instances", "pluginid", "alertRef", "wascid",
            "sourceid", "cweid", "otherinfo", "sequences",
            "@programName", "@version", "@port", "@ssl"
          ],
          "required_inputs": ["input_text", "input_report"]
        },
      }
    }
  }
}
```

This setup allows dynamic adjustments based on evolving security analysis needs. Each mode uses a specific **prompt_key** to determine the AI response style, removes unnecessary fields to improve efficiency, and requires specific inputs to function correctly.

The **AI-powered security analysis** is configured in this file. It defines how the LLM processes cybersecurity reports and applies different prompts to specific use cases.

Each mode serves a distinct purpose, utilizing customized **prompt building** to tailor AI-generated responses. The configuration includes the following fields:

- **`prompt_key`**: Defines the specific AI prompt template used for this mode.
- **`fields_to_remove`**: Specifies unnecessary metadata fields that should be excluded from AI processing.
- **`required_inputs`**: Lists mandatory inputs needed for the AI to generate meaningful responses.

For example:
- A **chat-based interaction** may require both a user query (`input_text`) and a security report (`input_report`).
- A **structured security report summary** might only need the full report as input.

This flexible setup allows dynamic adjustments based on evolving security analysis needs.

The **AI-powered security analysis** is configured in this file. It defines how the LLM interprets and processes **cybersecurity reports**.

- **Chat Mode (********`chat`********)**

  - Uses predefined AI prompts (`CYBERSECURITY_PROMPT_TEMPLATE_CHAT`).
  - Filters unnecessary metadata from reports.
  - Requires `input_text` and `input_report`.

- **Report Mode (********`report`********)**

  - Uses `CYBERSECURITY_PROMPT_TEMPLATE_REPORT` for structured security reports.
  - Filters unnecessary fields from analysis.
  - Requires only `input_report`.

- **Defaults:**

  - `"prompt": "No valid prompt found for this mode."`
  - `"missing_inputs_message": "Missing required inputs: {missing_inputs}."`

### **AI Prompts (********`prompts.py`********)**

This file defines **structured prompts** for OWASP ZAP security reports. These prompts guide the AI in analyzing vulnerabilities, risk levels, and recommended actions.

- **Chat Prompt (********`CYBERSECURITY_PROMPT_TEMPLATE_CHAT`********)**
  - Guides AI in responding to security-related questions based on OWASP scan results.
- **Report Summary Prompt (********`CYBERSECURITY_PROMPT_TEMPLATE_REPORT`********)**
  - Extracts key vulnerabilities, risk factors, and security recommendations.

Example snippet:

```python
CYBERSECURITY_PROMPT_TEMPLATE_CHAT = """
You are a cybersecurity expert analyzing an OWASP security report...
"""
```

## Running a Scan

To execute a **full security scan**, use the following configuration in `scan_config.json`:

```json
{
  "run_scan": {
    "scanMode": {
      "tool": "OWASP",
      "mode": "fullscan"
    }
  }
}
```

## Advanced Settings

For detailed explanations of advanced configuration settings such as **scan timeouts**, **spider settings**, and **debugging options**, refer to **`advanced_settings.md`** to add new mode and tools.


