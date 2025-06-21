<p align="center">
  <img src="./docs/images/logo.png" alt="Banner">
</p>

<p align="center">
    <em>Run AI-enhanced security scans in the cloud with zero setup. Launch tests, analyze results, and get remediation advice in one interface. No local tools, no manual triage, fully automated and accessible from anywhere.
    </em>
</p>

<p align="center">
    <em> This project was developed through a collaboration between the UBC Cloud Innovation Centre (CIC) and Amazon Web Services (AWS)
    </em>
</p>

<p align="center">
    <a href="./LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
    </a>
    <a href="https://www.python.org/downloads/">
        <img src="https://img.shields.io/badge/python-3.7%2B-blue.svg" alt="Python Version">
    </a>
    <a href="https://aws.amazon.com"    target="_blank">
      <img src="https://img.shields.io/badge/AWS-Cloud%20Infrastructure-F0910A?logo=amazon-aws&logoColor=white" alt="AWS Badge">
    </a>
</p>
<p align="center">
  <a href="https://cic.ubc.ca" target="_blank">
    <img src="https://img.shields.io/badge/UBC%20CIC-Powered%20by%20AWS-blue?logo=ubisoft&logoColor=white" alt="UBC CIC Badge">
  </a>
</p>

<p align="center">
   <a href="./docs/README.md" target="_blank">
   <img src="https://img.shields.io/badge/Documentation-Read-green?style=for-the-badge" alt="Documentation">
   </a>
<a href="https://youtu.be/69zGO0BYB2A" target="_blank">
  <img src="https://img.shields.io/badge/Watch%20Demo-Video-blue?style=for-the-badge" alt="Watch Demo Video">
</a>
</p>




## **What is DAEST?**

DAEST is an AI-enhanced security testing platform for web applications. It automates vulnerability scanning using OWASP ZAP and layers on AI-driven analysis to generate clear, actionable security reports. Built on AWS infrastructure with containerized workflows and LLM integration, DAEST streamlines the entire testing process from scan execution to result interpretation through a unified, scalable web interface.

You can think of DAEST as a modern interface for automated security testing workflows enhanced with LLM reasoning. It provides a secure frontend for launching tests, integrated chat-based reporting, and a modular backend architecture designed for cloud-native deployment.

DAEST is especially useful when:

- You want to simplify black-box security testing without losing transparency
- You need to generate human-readable vulnerability reports from raw scan data
- Your team lacks deep security expertise but needs clear mitigation guidance
- You are building developer-facing security workflows that need to scale
- You want to combine OWASP ZAP with AI in a controlled and maintainable way


## Use Cases

**Developers running pre-deployment scans**  
Quickly test staging environments for OWASP vulnerabilities without setting up security tooling or writing scan scripts.

**Security engineers managing vulnerability workflows**  
Automate recurring scans, receive AI-prioritized summaries, and maintain an organized archive of results for compliance tracking.

**Startups without a dedicated security team**  
Use the platform to scan, interpret, and fix vulnerabilities without needing deep security expertise or custom infrastructure.


**Cloud engineers deploying secure apps**  
Integrate security testing into AWS-based CI/CD pipelines and use Bedrock-powered analysis to flag critical issues before release.


## **Core Capabilities**

### Infrastructure

- **Cloud-native:** Deploys with AWS EKS, Bedrock, S3, and Cognito for scalability and security  
- **Code-defined:** Infrastructure and scan logic managed through IaC and containerization  
- **Local control:** Keeps scan configuration, report storage, and access policies within your cloud  
  
<p align="center">
  <img src="./docs/images/architectureDiagram.png" alt="Banner">
</p>

### AI/ML Pipeline

- **AI-enhanced:** Summarizes results with large language models for clarity and actionability  
- **ML-ready pipeline:** Supports prompt tuning, output validation, and modular LLM integration for evolving AI workflows  

### Security & Testing

- **Interactive UI:** Includes a web-based dashboard and integrated chatbot for report Q&A 
- **Security-focused:** Automates black-box web scans using OWASP ZAP  
- **Composable reports:** Combines raw scan data, OWASP guidance, and AI insight in one place  

 




