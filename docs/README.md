# AI-Enhanced Application Security Testing Platform

Welcome to the documentation for the **AI-Enhanced Application Security Testing Platform**, developed by the UBC Cloud Innovation Centre. This system combines OWASP ZAP-based security testing with AI-driven report summarization and a cloud-native architecture built on AWS.

Use this page as your central guide to explore the design, usage, and deployment of the platform.

---

## Documentation Index

### Getting Started
- [User Guide](./guides/userGuide.md)  
  How to launch a test, read reports, and use the chatbot interface.

### Deployment
- [Frontend Deployment Guide](./frontend/frontend-deployment.md)  
  Set up the Amplify-hosted React UI with environment variables and GitHub integration.  

- [Backend Deployment Guide](./backend/aws-cdk-deployment.md)  
  Use AWS CDK, Docker, ECR, and Helm to deploy the FastAPI backend on EKS.

### Design & Architecture
- [System Architecture Diagrams](./design/project_design.docx)  
  Visuals of the high-level system, web flow, and database schema.  

- [Estimated Monthly Cost](./guides/costEstimate.md)  
  AWS usage cost estimate for moderate team workloads.

### Reports & Data
- [Sample Reports](./reports/sample-report-1.pdf)  
  Example AI-enhanced security test output for reference.
