<h1 style="margin: 0px;"> AI Enhanced Security Testing Platform </h1>
<h5 style="margin-bottom: 10px; margin-top: 0px; padding-left: 20px;"> By Andrew Piemonte, Alfredo A. del Rayo, Junsu An, and Ranbir Sharma in collaboration with the UBC CIC </h5>


This is an UBC Capstone Project of the faculty of Electrical and Computer Engineering built for the UBC Cloud Innovation Centre.

The solution, DAEST: AI-Enhanced Security Testing, provides a user-friendly interface for launching security tests, a detailed summary report enhanced by artificial intelligence, and assistance. The report highlights security issues while providing practical tips for implementation, and the chatbot answers questions regarding the report. By streamlining the security testing process, this platform makes web application security more efficient and approachable for developers, regardless of their technical security expertise.

## Cloud Architecture
As seen in Figure 1, users interact with the web application hosted on AWS Amplify, which uses AWS Cognito for authentication. Once a user creates a new test, the server side of the Next.js Application contacts an Elastic Load Balancer (ELB) which redirects the request to a Kubernetes Pod hosted on an EC2 server (by the AWS EKS) which then triggers a Job to run an OWASP ZAP Base Scan, detecting vulnerabilities in the web application. The scan results are processed and stored in Amazon S3 as raw reports. These reports are then passed to AWS Bedrock, which analyzes the findings and generates clear report-suggested solutions. The final report is stored and displayed through the web interface. For the chatbot functionality, the client side of the Next.js API handler will forward the user prompt and report (as context) to the Fast API backend, which responds with the answer of the LLM. The system uses AWS EKS Cluster to manage containerized workflows and AWS Elastic Load Balancer to efficiently handle requests, ensuring scalability, reliability, and a seamless user experience. 
<div align="center">

![Cloud Architecture Diagram](/docs/images/architectureDiagram.png)

  Figure 1. High-Level Architecture Diagram
 </div>

## Deployment Guide
The deployment is broken down into two parts, the Amplify Application (Frontend + Amplify backend) and the Kubernetes Backend. 

First deploy the Kubernetes backend using the following instructions:

[backend deployment documentation](/docs/backend/aws-cdk-deployment.md)

Then deploy the frontend:

[frontend deployment documentation](/docs/frontend/frontend-deployment.md)

## User Guide
Use the following guide to get familiar with launching a security test:

[User Guide](/docs/userGuide.md)

## User Workflow



## Estimated Budget
The monthly estimate can be found below:

[Cost Estimate](/docs/costEstimate.md)
 



