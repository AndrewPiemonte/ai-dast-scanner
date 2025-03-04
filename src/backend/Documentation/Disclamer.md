# Disclaimer

This prototype provides an automated security assessment using OWASP ZAP. While most tests can be executed without additional configuration, some **security tests may require additional user input** to be fully effective. These include tests that depend on **custom payloads, authentication, session handling, or specific user-provided data** to simulate realistic attack scenarios.

At this stage, this implementation **does not yet support an automated way to provide such inputs dynamically**. Additional research and future development efforts are required to **identify tests that need extra configuration** and to build mechanisms for users to specify necessary inputs before running the scans.

**Next Steps:**
- Further research is needed to map which tests require user input.
- Future versions should implement interactive input options or predefined configurations.
- Enhanced automation features can improve coverage for tests requiring **custom authentication, form submission data, and payload customization**.

Until these features are fully developed, **users should manually review scan results and determine whether additional input is required for accurate security testing**.
