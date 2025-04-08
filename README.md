# AI Enhanced Security Testing Platform
This is an ECE Capstone Project built for the UBC Cloud Innovation Centre.

The solution, DAEST: AI-Enhanced Security Testing, provides a user-friendly interface for launching security tests, a detailed summary report enhanced by artificial intelligence, and assistance. The report highlights security issues while providing practical tips for implementation, and the chatbot answers questions regarding the report. By streamlining the security testing process, this platform makes web application security more efficient and approachable for developers, regardless of their technical security expertise.

## Cloud Architecture
As seen in Figure 1, users interact with the web application hosted on AWS Amplify, which uses AWS Cognito for authentication. Once a user creates a new test, the server side of the Next.js Application contacts an Elastic Load Balancer (ELB) which redirects the request to a Kubernetes Pod hosted on an EC2 server (by the AWS EKS) which then triggers a Job to run an OWASP ZAP Base Scan, detecting vulnerabilities in the web application. The scan results are processed and stored in Amazon S3 as raw reports. These reports are then passed to AWS Bedrock, which analyzes the findings and generates clear report-suggested solutions. The final report is stored and displayed through the web interface. For the chatbot functionality, the client side of the Next.js API handler will forward the user prompt and report (as context) to the Fast API backend, which responds with the answer of the LLM. The system uses AWS EKS Cluster to manage containerized workflows and AWS Elastic Load Balancer to efficiently handle requests, ensuring scalability, reliability, and a seamless user experience. 
<div align="center">
![CPEN491CloudArchitectureDiagram](https://github.com/user-attachments/assets/32adadf9-2b26-4fb9-937f-5bbd087bb3db)
  Figure 1. High-Level Architecture Diagram
 </div>



 

 



