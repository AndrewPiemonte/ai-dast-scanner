# Custom Scans Folder

## Purpose
This folder is dedicated to custom scan implementations in `scans.py`. Each added scan must be properly configured to ensure smooth integration with the ZAP scanning process.

## Configuration Steps
### 1. **Update Values in `values.yaml`**
For each new scan:
- Define any necessary **flags** and **inputs** in `values.scan_settings`.

### 2. **Modify `zap-scan-zap.yaml` Command**
- Ensure that the `zap-scan-zap.yaml` command in the relevant script is updated to verify and apply the new configurations.

### 3. **Future Enhancements (In Progress)**
- All configurations must be added to a **JSON file**.
- This JSON file should include:
  - **Scan Name**
  - **Parameters**
  - **Description**
- The JSON data will be used to **feed the front-end** with available scan options and descriptions.

### 4. **Upload to S3 for Job Access**
- The program will automatically upload these configuration and script files to **S3**, where the jobs are mounted.
- This allows jobs to have access to necessary **scripts** and **config files** during execution.
- These configuration and script files will be uploaded to **S3**, where the jobs are mounted.
- This allows jobs to have access to necessary **scripts** and **config files** during execution.

This structured approach ensures maintainability and future scalability of custom scans within the system.

