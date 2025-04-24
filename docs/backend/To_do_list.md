# 🧠 AI-Enhanced Security Testing Platform – To-Do List & Improvements

This document outlines critical tasks and recommended improvements based on the current architecture, codebase, and `Milestone 4` design document.

---

## ✅ Core Refactoring

### 1. Modularize Tool Integration
- [ ] Move `run_scan.py` logic into per-tool subfolders inside `security_tools/<tool>/` to isolate logic.
- [ ] Introduce a strategy pattern or base interface for scan mode execution (`BaseScanExecutor`) to minimize redundancy across tools.

### 2. Strengthen Configuration Validation
- [ ] Implement `validate_config()` for each tool/mode to enforce runtime schema checks.
- [ ] Add startup validation to ensure `scan_config.json` is schema-compliant and contains required fields (`TARGET_URL`, `OUTPUT_FILE_JSON`).
- [ ] Use `pydantic` or `jsonschema` to enforce config integrity.

---

## ⚙️ Backend Enhancements

### 3. Enhance Logging and Observability
- [ ] Replace print-based logs with structured logs using `loguru` or `structlog`.
- [ ] Add scan_id, user_id, tool, and mode as context in logs.
- [ ] Stream logs to CloudWatch with service-separated log groups.

### 4. Harden Error Handling
- [ ] Replace any remaining `HTTPException` usages with project-level custom exceptions.
- [ ] Add specific exception types for `S3UploadError`, `JobLaunchError`, `LLMInvocationError`, etc.
- [ ] Ensure fallback and retry logic for critical flows like report generation and LLM invocation.

---

## 🧠 LLM Optimization

### 5. Expand Tool Mode Registry
- [ ] Add per-tool/mode prompt control with fallback logic in `tool_mode_registry.py`.
- [ ] Support both `report` and `chat` modes, each with its own prompt key and validator.

### 6. Improve AI UX
- [ ] Add user feedback feature to flag poor AI responses.
- [ ] Cache AI responses based on `input_report` hash and reuse for identical prompts to reduce Bedrock usage.

---

## 🧠 RAG Integration (Retrieval-Augmented Generation)

### 7. Add RAG for LLM Summarization
- [ ] Add `rag_handler.py` to:
  - Embed chunks from reports.
  - Store them in FAISS or Weaviate.
  - Perform vector-based retrieval before invoking the LLM.
- [ ] Index post-scan alerts in a background task for all completed scans.
- [ ] Toggle `use_rag` per tool/mode in `tool_mode_registry.py`.

**Benefits:**
| Feature             | Without RAG       | With RAG        |
|--------------------|-------------------|-----------------|
| Prompt Token Cost   | High (full report) | Low (top-k)     |
| Accuracy            | Medium             | Higher          |
| Hallucination Risk  | Higher             | Lower (grounded context) |

---

## 🛠️ CI/CD and DevOps

### 8. Improve Development Tooling
- [ ] Add GitHub Actions to:
  - Test LLM prompt formatting.
  - Validate `scan_config.json`.
  - Lint and test Helm chart integrity.

### 9. Helm Chart Modularization
- [ ] Refactor `/helm/values.yaml` into:
  - `base-values.yaml`
  - `tools-values.yaml`
  - `env-values.yaml`
- [ ] Add `smoke_scan_on_startup` flag for automatic validation after deployment.

---

## 📊 Report & Dashboard Improvements

### 10. Report Features
- [ ] Add export buttons to download AI-enhanced reports in:
  - JSON
  - PDF
  - SARIF
- [ ] Add hyperlinks inside chatbot responses to highlight vulnerabilities in report view.

### 11. Dashboard UX
- [ ] Add filters by:
  - Tool
  - Mode
  - Date
  - Status
- [ ] Show scan summary (duration, risk breakdown) as preview in dashboard table row.

---

## 🧪 Testing & Future Proofing

### 12. Add Comprehensive Tests
- [ ] Unit tests for all `tool_mode_handler.py` and `prompt.py` logic.
- [ ] End-to-end tests for:
  - Scan launch
  - LLM invocation
  - Report enhancement

### 13. Future Tool Support
- [ ] Refactor scan execution to support hybrid scans (e.g., API + web, multi-tool).
- [ ] Add first-party integration support for Burp Suite or custom internal tools.

---

## 📦 Optional: Cost & Deployment Optimization

### 14. Serverless POC
- [ ] Run a Proof-of-Concept comparing:
  - AWS EKS (current)
  - AWS Fargate
  - AWS Step Functions + Lambda
- [ ] Compare performance and cost at 50 concurrent scans with LLM enabled.

---

## 🧾 Documentation

### 15. Improve Developer Docs
- [ ] Add `README.md` per major folder (`llm/`, `security_tools/`, `config/`).
- [ ] Add “How to Add a New Tool” tutorial with screenshots.
- [ ] Auto-generate API reference with FastAPI docs and OpenAPI.

---

**Let me know if you’d like this exported as a project board, Notion page, or GitHub issue list.**