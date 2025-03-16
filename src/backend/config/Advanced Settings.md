# Advanced Settings

## Adding New Modes and Tools

This guide outlines the steps required to add new scanning modes and tools to the security scanning system. Follow these steps to ensure the new configurations are properly integrated.

---

### Step 1: Update `scan_config.json`

This file defines the configuration settings for each tool and scan mode.

#### Adding a New Tool

Under the `tools` key, add a new entry containing:
- **Description**: Clearly explains the tool's functionality.
- **Docker image**: Repository and tag details.
- **Supported scan modes**.

### Example (Adding a New Tool - `NewTool`):

```json
"NewTool": {
  "description": "Detailed description of the new tool.",
  "image": {
    "repository": "dockerhub.com/newtool",
    "tag": "latest"
  },
  "modes": {}
}
```

### Adding a New Mode

Inside your tool definition, add new modes with:
- **Description**: Explains what the scan mode does.
- **Configuration settings**: Parameters users can adjust.

### Example (Adding a New Mode - `quickscan`):

```json
"quickscan": {
  "description": "Executes a rapid security check with minimal intrusive checks.",
  "config": {
    "ENABLE_VERBOSE": {
      "type": "boolean",
      "value": false,
      "enabled": false,
      "mandatory": false,
      "flag": "-v",
      "env_var": "",
      "description": "Enables verbose logging."
    }
  }
```

---

## Step 2: Define AI Processing in `llm_config.json`

For AI-driven analysis, update `llm_config.json`:
- Create a new tool entry.
- Define prompt template keys, fields to remove, and required inputs.

### Example:

```json
"NewTool": {
  "modes": {
    "quickscan": {
      "prompt_key": "NEWTOOL_PROMPT_TEMPLATE",
      "fields_to_remove": ["metadata", "debug_logs"],
      "required_inputs": ["scan_results"]
    }
  }
```

---

## Step 3: Directory Structure

Ensure each tool and mode has a corresponding script within `security_test`:

```
security_test/
├── NewTool/
│   └── quickscan.py
└── AnotherTool/
    └── fullscan.py
```

### Additional Steps (if needed):

- Ensure each script file follows Python standards and matches the mode name defined in `scan_config.json`.
- Scripts should handle inputs and outputs as per the configuration settings.

---

## Step 4: Define AI Prompts in `prompts.py`

Add clearly defined prompts for AI analysis in `prompts.py`.

### Example:

```python
NEWTOOL_PROMPT_TEMPLATE = """
Analyze scan results and identify key security vulnerabilities...
"""
```

---

## Step 5: Validate & Deploy

Before deployment:
1. Validate JSON files (`scan_config.json`, `llm_config.json`).
2. Ensure environment variables are set correctly in `settings.py`.
3. Conduct a test scan to verify integration.

---

## Troubleshooting

**Scan Configuration Issues:**
- Verify JSON formatting and required fields.
- Confirm consistency between script filenames and tool/mode names.

**AI Integration Issues:**
- Check correctness of prompt references in `llm_config.json`.
- Review prompt formatting in `prompts.py`.

**Scan Execution Issues:**
- Confirm Docker images are accessible and properly tagged.
- Review logs for missing environment variables or script errors.

