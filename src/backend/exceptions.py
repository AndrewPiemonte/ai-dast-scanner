class TokenLimitExceeded(Exception):
    pass

class ConfigLoadError(Exception):
    """Raised when a configuration file fails to load."""
    pass

class LLMInvocationError(Exception):
    pass

class InvalidToolError(Exception):
    """Raised when an invalid tool is provided for LLM configuration."""
    pass

class InvalidModeError(Exception):
    """Raised when an invalid scan mode is selected for a tool."""
    pass


class MissingRequiredFieldsError(Exception):
    """Raised when required fields are missing or empty in a configuration-driven input."""
    pass


class InvalidJSONInputError(Exception):
    """Raised when a JSON-formatted string input fails to parse."""
    pass

class BedrockClientError(Exception):
    """Raised when the AWS Bedrock API returns a client-side error."""
    pass

class BedrockResponseError(Exception):
    """Raised when the Bedrock response is missing expected fields or is malformed."""
    pass

class BedrockUnexpectedError(Exception):
    """Raised when an unknown error occurs while invoking the Bedrock model."""
    pass

class S3UploadError(Exception):
    """Raised when an S3 upload operation fails."""
    pass

class IncompleteFlagConfigurationError(Exception):
    """Raised when a required field is missing or improperly set in a flag configuration."""
    pass

class KubernetesJobRegistrationError(Exception):
    """Raised when a Kubernetes job is not registered within the expected time."""
    pass

class KubernetesPodLookupError(Exception):
    """Raised when the pod associated with a Kubernetes job cannot be found in time."""
    pass

class KubernetesJobTimeoutError(Exception):
    """Raised when a Kubernetes Job does not complete within the expected timeout period."""
    pass


class KubernetesJobReportMissingError(Exception):
    """Raised when a Kubernetes Job completes but the expected scan report is not found in the pod logs."""
    pass


class KubernetesJobMonitorError(Exception):
    """Raised when an unexpected error occurs while monitoring a Kubernetes Job or retrieving pod logs."""
    pass

class LlmHandlerInitializationError(Exception):
    """
    Raised when a chunking handler declared in the registry cannot be resolved during initialization.
    """
    pass

class ChunkingCoverageError(Exception):
    """Raised when not all alerts are processed during chunking."""
    pass

class NoAlertsFoundError(Exception):
    """Raised when an OWASP report contains no alerts across all sites."""
    pass
