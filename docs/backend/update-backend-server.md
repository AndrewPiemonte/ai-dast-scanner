# How to update backend server on EKS cluster

## Prerequisites

1. Install AWS CLI. If you are using Mac, you can install it using Homebrew: `brew install awscli`
2. Install kubectl. If you are using Mac, you can install it using Homebrew: `brew install kubectl`
3. Install Helm. If you are using Mac, you can install it using Homebrew: `brew install helm`

## AWS Authentication

1. Run `aws configure sso`
    - Our "SSO start URL": `https://ubc-cicsso.awsapps.com/start/#`
    - Our "Region": `ca-central-1`

2. Login with `aws sso login`
    - Now your terminal session is authenticated with AWS.

## Docker Build

1. Go to the `src/backend` directory.
2. Login to ECR: `aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 619071345478.dkr.ecr.us-west-2.amazonaws.com`
3. Build the Docker image: `docker buildx build --platform linux/amd64 -t 619071345478.dkr.ecr.us-west-2.amazonaws.com/aest/backend:latest .`
4. Push the Docker image: `docker push 619071345478.dkr.ecr.us-west-2.amazonaws.com/aest/backend:latest`

## Update backend server on EKS cluster

> Our backend Helm chart will fetch the latest image from ECR.

1. Get the EKS context: 
    ```aws eks update-kubeconfig --name AestEks80BF057B-2506a807db2c4f2d92182a45a5548bef --region us-west-2```

2. Make sure you are using the correct EKS context:
    ```kubectl config get-contexts```

3. Go to the Helm directory: `AI-Enahanced-Secutity-Testing-ECE-Capstone/helm`

4. Upgrade the Helm chart: `helm upgrade backend-release ./helm/backend`
    - Our Helm will always fetch the latest image from ECR.

## Testing

> Many ways to testing the new backend server. One way could be get a external IP address for the backend service and test it with `curl`.

> You don't have to use 'kubectl' to interact with the Kubernetes. I'm using k9s.

1. Get the external IP address for the backend service: `kubectl get svc backend -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'`
2. (In my case) I simply curl the external IP address to test the backend server: 
```
curl -X POST "http://a6fce24b161c44922b8905516740476a-553792565.us-west-2.elb.amazonaws.com/zap/basescan?target_url=https://google.com"
```
