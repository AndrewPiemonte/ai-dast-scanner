# Frontend + Amplify Backend Deployment 

The front end is to be deployed on AWS Amplify. Since Amplify Gen 2 is designed around GitOps-based workflow, a Git repository is needed for deployment. Thus, you need to create a GitHub Repo, for this example, we will assume the URL of your repo is https://github.com/ << my Uname >>/<< my Repo >>.git. Then open your terminal and run the following commands to clone our repository into yours (MacOS terminal and Windows Powershell): 

 
``` shell
git clone https://github.com/UBC-CIC/AI-Enahanced-Secutity-Testing-ECE-Capstone.git myRepo 
 
cd myRepo 
  
git remote add origin https://github.com/<< my Uname >>/<< my Repo >>.git 
 
git add . 
 
git commit -m"Cloned AI-Enhanced-Security-Testing-ECE-Capstone repo" 
 
git push -u origin main 
```
Now that you have the application in your GitHub repository go to the AWS console at https://aws.amazon.com/. Then search for the AWS Amplify Service. Then select Create New App. For the first step select Github as your Git provider and click ‘next’ as shown in Figure 2. After that, allow AWS to access your GitHub repositories, as seen in Figure 2  choose the repository where you have your cloned application, choose main as your branch, select ‘My app is a monorepo’ and enter src/frontend as the root directory and click on next. Then go to environment variables, add variable named 'NEXT_PUBLIC_BACKEND_URL' with the url of the backend load balancer as the value (you can find the url by searching for Load Balancer in the EC2 console, it should be the only classic load balancer), as seen in Figure 3. Lastly,  click ‘next’ for step 3 and ‘save and Deploy for step 4’. Now you have successfully created the AWS Amplify application, it will take around 5 minutes to build and deploy. 
 
 <div align="center">

![Deployment Instructions Step 1](/docs/images/AmplifyDeploymentInstructions1.png)

Figure 1: Creating Amplify Application Step 1 

![Deployment Instructions Step 2](/docs/images/AmplifyDeploymentInstructions2.png)

Figure 2: Creating Amplify Application Step 2 

![Deployment Instructions Step 3](/docs/images/AmplifyDeploymentInstructions3.png)

Figure 3: Creating Amplify Application Step 3

</div>