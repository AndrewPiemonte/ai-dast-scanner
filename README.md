<h1 style="margin: 0px;"> AI Enhanced Security Testing Platform </h1>
<h5 style="margin-bottom: 10px; margin-top: 0px; padding-left: 20px;"> By Andrew Piemonte, Alfredo A. del Rayo, Junsu An, and Ranbir Sharma in collaboration with the UBC CIC </h5>


This Capstone project is a collaborative effort by senior UBC Electrical and Computer Engineering students, developed for the UBC Cloud Innovation Centre.

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

## Estimated Costs
The monthly estimate can be found below:

[Cost Estimate](/docs/costEstimate.md)

## User Guide
Use the following guide to get familiar with launching a security test:

[User Guide](/docs/userGuide.md)

## User Workflow
<div align="center">

![User Workflow of the Platform](/docs/images/userWorkflow.png)
Figure 2. DAEST Platform User Workflow
</div>

The user workflow of our platform depicted in figure 2 can be broken down into the following steps:  

1. An unauthenticated user begins at the Main Page, as shown in Figure 2, where they are prompted to log in.  
2. On the Login Page, the user must enter valid credentials (username and password) to proceed. 
3. The authenticated user is directed to the Dashboard Page (Figure 2), which displays all previously launched tests. From this page, the user may: 
  a. Click "Launch Test" to initiate a new scan (Step 4), or 
  b. Click on the name of a completed test to view its results (Step 8). 
  c. Click on “Sign Out” (go back to Step 1) 
4. Selecting "Launch Test" navigates the user to the New Test Configuration Page, where they can input the test name, choose a DAST tool and scan mode, specify the target URL, and optionally modify advanced configuration settings. 
5. A confirmation dialog appears, allowing the user to validate the target URL via a direct link. 
6. The Loading Page then briefly appears as the test is initialized. 
7. Once the test is successfully initiated, the Results Page confirms that initialization is complete. The user may return to the Dashboard Page to monitor test status (step 3). 
8. When accessing a completed test, the user is directed to the Report + Chatbot Page, which presents the security scan results on the left panel and an interactive AI assistant on the right. The user can review the report and ask questions related to its findings. Once finished, they can return to the Dashboard Page. 



