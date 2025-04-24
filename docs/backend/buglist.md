# 🐞 Known Bugs & Technical Debt – AI-Enhanced Security Testing Platform

This list captures bugs, inconsistencies, and unverified assumptions that may impact reliability, extensibility, or correctness of the platform.

---

## 🐛 Known Bugs

### 1. `--remove` Flag Fails for Multiple Rule IDs
- **Status**: Reproducible bug
- **Cause**: The list of IDs is passed as plain text (e.g., `id1,id2`), which may be misinterpreted or improperly quoted inside the container when used as a CLI flag.
- **Observed Behavior**: Works only with a single rule ID; breaks when passing comma-separated values.
- **Fix Suggestions**:
  - Quote the `--remove` value when constructing the command.
  - Sanitize input to ensure correct string literal handling inside the scan script.
  - Add unit tests to validate list-based flags across multiple tools and modes.

---

## ❓ Untested Scenarios / Unknowns

### 2. No Integration Testing Beyond OWASP ZAP
- **Risk**: High
- **Details**: All current scan logic and configuration parsing is designed with OWASP in mind.
- **Impact**:
  - Other tools (e.g., Burp Suite, custom scanners) may break due to:
    - Different CLI formats
    - Different output file names/paths
    - Missing or incompatible flags
- **Action**:
  - Test each new tool in isolation.
  - Confirm Docker image paths, mount volumes, and output expectations match the current logic.
  - Document per-tool quirks in a compatibility matrix.

---

### 3. Path Mismatches Inside Containers
- **Risk**: Medium
- **Details**: Paths to scripts or config files in the `scan_config.json` may not resolve correctly inside the scan container if the internal directory layout differs from the local structure.
- **Symptoms**:
  - Job starts but immediately fails due to missing scripts.
  - Config file not found errors.
- **Fix Suggestions**:
  - Normalize scan script paths at runtime using container-specific base paths (e.g., `/scripts/`, `/config/`).
  - Consider adding `container_path_prefix` in `scan_config.json` per tool.
  - Validate existence of all files during container entrypoint execution (e.g., in `run_scan.py`).

---

## ⚠️ Technical Debt

### 4. Lack of Schema Validation for CLI Input Construction
- **Impact**: Flag misconfigurations can silently fail.
- **Examples**:
  - Boolean flags like `-I` or `-s` can be injected incorrectly if `"enabled": false` is not respected.
- **Action**:
  - Add strict validation of CLI construction logic.
  - Implement `dry-run` mode for script input preview before launch.

### 5. Inconsistent Flag Handling Across Modes
- **Problem**: Some config values are hardcoded in scripts, others are passed via flags or env vars.
- **Risk**: Increasing complexity and mismatch between `scan_config.json` and actual behavior.
- **Fix**:
  - Normalize all input delivery through flags or envs (not mixed).
  - Ensure that `run_scan.py` reads all required values consistently using the generated `config-<mode>.py`.

---

Let me know if you want this converted into GitHub Issues with labels like `bug`, `investigation`, `infra`, or if you'd like a `bug_template.md` to report future issues.