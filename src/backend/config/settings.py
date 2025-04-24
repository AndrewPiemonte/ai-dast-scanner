import os

class Settings:
    """
    Configuration settings for the application, including ZAP, AWS, S3, and Kubernetes parameters.

    This class centralizes configuration management, allowing environment variables
    to override default values for better flexibility and scalability.
    """

    # -------------------- ZAP Configuration --------------------
    ZAP_BASE_URL = os.getenv("ZAP_BASE_URL", "http://zap-service:8080")
    """Base URL for OWASP ZAP service, used to interact with the security scanner API."""

    # -------------------- AI Model Configuration --------------------
    BASE_MODEL_ID = "meta.llama3-1-70b-instruct-v1:0"
    """ID of the AI model used for analysis, defaulting to Meta Llama 3-70B."""

    MAX_INPUT_TOKENS = 8192
    """Maximum number of tokens accepted as input for this model (prompt context window)."""

    MAX_GENERATED_TOKENS = 1500
    """Maximum number of tokens allowed for the model to generate in a single response."""

    TOKEN_BUFFER = 128  
    """Safety margin to avoid hitting exact limit."""

    LOCAL_TOKENIZER_MODEL_ID = "NousResearch/Llama-2-70b-chat-hf"
    """Tokenizer model used locally to estimate token counts before sending prompts to Bedrock.

    We use a publicly available tokenizer (LLaMA 2 70B) because Meta's LLaMA 3 tokenizer requires gated access via Hugging Face.
    LLaMA 2's tokenizer provides a very close approximation of token count for LLaMA 3, making it suitable for validating input length.
    """
    # -------------------- S3 Storage Configuration --------------------
    BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "s3stack-aestbucket11161ed0-oyzazupebp7h")
    """AWS S3 bucket name used for storing scan reports and other relevant data."""

    # -------------------- AWS Configuration --------------------
    AWS_ROLE_ARN = os.getenv("AWS_ROLE_ARN", "EksStack-AestEksBackendServiceAccountRoleBC23901D-EDMDGaHmKF1C")
    """IAM Role ARN used for assuming AWS permissions when accessing cloud resources."""

    DEFAULT_AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
    """Default AWS region where cloud resources (e.g., S3, EKS) are deployed."""

    # -------------------- Kubernetes Configuration --------------------
    NAMESPACE = os.getenv("K8S_NAMESPACE", "default")
    """Kubernetes namespace where the ZAP scan job runs."""

    CHART_PATH = os.getenv("HELM_CHART_PATH", "./zap-scan-job")
    """Path to the Helm chart used for deploying the ZAP scan job."""

    RELEASE_NAME = os.getenv("HELM_RELEASE_NAME", "zap-scan-job")
    """Helm release name assigned to the ZAP scan deployment."""

    DEFAULT_SERVICE_ACCOUNT = os.getenv("K8S_SERVICE_ACCOUNT", "backend-sa")
    """Kubernetes service account used for running the ZAP scan job."""

    K8S_JOB_REGISTRATION_RETRIES = int(os.getenv("K8S_JOB_REGISTRATION_RETRIES", "15"))
    """Maximum number of retries while waiting for job registration."""

    K8S_JOB_REGISTRATION_DELAY = int(os.getenv("K8S_JOB_REGISTRATION_DELAY", "5"))
    """Delay (in seconds) between retries while polling for job registration."""

    K8S_JOB_POD_RETRIES = int(os.getenv("K8S_JOB_POD_RETRIES", "10"))
    """Maximum number of retries while waiting for a pod to appear for a job."""

    K8S_JOB_POD_DELAY = int(os.getenv("K8S_JOB_POD_DELAY", "5"))
    """Delay (in seconds) between polling attempts for pod readiness."""

    K8S_JOB_COMPLETION_RETRIES = int(os.getenv("K8S_JOB_COMPLETION_RETRIES", "60"))
    """Maximum number of retry attempts to wait for a Kubernetes Job to complete."""

    K8S_JOB_COMPLETION_DELAY = int(os.getenv("K8S_JOB_COMPLETION_DELAY", "10"))
    """Delay in seconds between each retry while polling for Kubernetes Job completion."""


    # -------------------- Configuration File Paths --------------------
    SCAN_CONFIG_JSON_PATH = "config/scan_config.json"
    """Path to the JSON configuration file defining scan settings and tool parameters."""

    OUTPUT_CONFIG_TEMPLATE = "security_tools/{tool}/config-{mode}.py"
    """Template path for dynamically generated configuration files for specific scan tools and modes."""

    OUTPUT_CONFIG_PATH = "security_tools/{tool}"
    """Base directory for storing generated configuration files per scan tool."""

    VALUES_YAML_PATH_CONFIG = "zap-scan-job/values.yaml"
    """Path to the global default values.yaml file containing Helm configuration settings."""

    VALUES_YAML_PATH = "./zap-scan-job/values.yaml"
    """Absolute path to the Helm values.yaml file used for deploying the scan job."""

    # -------------------- Scan Job Configuration --------------------
    DEFAULT_SCAN_TIMEOUT = int(os.getenv("SCAN_TIMEOUT", 3600))
    """Timeout value (in seconds) before the ZAP scan job is forcefully stopped."""

    TEMPLATE_YAML_PATH_TEMPLATE = "zap-scan-job/templates/zap-scan-job-{tool}-{mode}.yaml"
    """Template path for Helm deployment YAML files, customized per tool and scan mode."""

    # -------------------- Parallelism & Resource Limits --------------------
    DEFAULT_PARALLELISM = int(os.getenv("PARALLELISM", 1))
    """Number of concurrent ZAP scan jobs that can run in parallel."""

    DEFAULT_COMPLETIONS = int(os.getenv("COMPLETIONS", 1))
    """Number of times each ZAP scan job must successfully complete before termination."""

    DEFAULT_BACKOFF_LIMIT = int(os.getenv("BACKOFF_LIMIT", 0))
    """Maximum retry attempts before a failed ZAP scan job is permanently marked as failed."""

    DEFAULT_TTL_SECONDS = int(os.getenv("TTL_SECONDS", 600))
    """Time (in seconds) before Kubernetes cleans up completed scan jobs."""

    # -------------------- Container Configuration --------------------
    DEFAULT_CONTAINER_NAME = "zap-baseline"
    """Name of the ZAP scanner container used in Kubernetes pods."""

    DEFAULT_MOUNT_PATH = "/zap/wrk"
    """Mount path inside the container where scan-related files are stored."""

    DEFAULT_COMMAND = ["python3", f"{DEFAULT_MOUNT_PATH}/run_scan.py"]
    """Default command executed within the ZAP container to start the scan process."""

    # -------------------- Persistent Volume Configuration --------------------
    DEFAULT_VOLUME_NAME = "zap-reports"
    """Kubernetes Persistent Volume (PV) name used for storing scan results."""

    DEFAULT_PVC_NAME = "zap-reports-pvc"
    """Persistent Volume Claim (PVC) name associated with the scan reports volume."""

    # -------------------- S3 File & Directory Handling --------------------

    # Files to ignore when files under security_tools when uploading to S3
    IGNORE_FILES = {
        "__init__.py",  # Common module initialization file
        ".DS_Store",    # macOS system metadata file
        "__pycache__.py"  # Python cache file
    }
    """Set of filenames to be ignored during S3 uploads."""

    # File extensions to under security_tools when uploading to S3
    IGNORE_EXTENSIONS = {
        ".pyc",  # Compiled Python files
        ".log",  # Log files
        ".md"    # Markdown files (typically documentation)
    }
    """Set of file extensions to be ignored during S3 uploads."""

    # Directories to be created in S3 (Stored as placeholder files)
    DIRECTORIES_TO_CREATE = [
        "scan-status/",   # Directory to store scan progress/status
        "scan-reports/",  # Directory to store generated scan reports
        "scan-logs/",     # Directory to store logs related to scan execution
    ]
    """List of directories that should exist in S3, managed by placeholder files."""

# Initialize the settings object
settings = Settings()
