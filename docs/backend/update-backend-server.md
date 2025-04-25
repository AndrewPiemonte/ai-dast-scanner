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

## Environment Setup

1. Set up required environment variables:
```bash
# Get AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Set AWS Region
export AWS_REGION=<YOUR REGION>

# Get ECR Repository
export ECR_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/aest/backend"

# Get S3 Bucket Name
export S3_BUCKET_NAME=$(aws s3api list-buckets --query 'Buckets[?contains(Name, `aestbucket`)].Name' --output text)

# Get Service Account Role ARN
export SERVICE_ACCOUNT_ROLE_ARN=$(aws iam list-roles --query 'Roles[?contains(RoleName, `EksStack-AestEksBackendServiceAccountRole`)].Arn' --output text)
```

## Docker Build

1. Go to the `src/backend` directory.
2. Login to ECR:
```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY
```

3. Build the Docker image:
```bash
docker buildx build --platform linux/amd64 -t $ECR_REPOSITORY:latest .
```

4. Push the Docker image:
```bash
docker push $ECR_REPOSITORY:latest
```

## Update backend server on EKS cluster

> Our backend Helm chart will fetch the latest image from ECR.

1. Get the EKS context:
```bash
aws eks update-kubeconfig --name <YOUR EKS ENDPOINT> --region $AWS_REGION
```

2. Make sure you are using the correct EKS context:
```bash
kubectl config get-contexts
```

3. Go to the Helm directory: `AI-Enahanced-Secutity-Testing-ECE-Capstone/helm`

4. Upgrade the Helm chart with environment variables:
```bash
helm upgrade backend-release ./backend \
  --set image.repository=$ECR_REPOSITORY \
  --set s3.bucketName=$S3_BUCKET_NAME \
  --set s3.region=$AWS_REGION \
  --set serviceAccount.roleArn=$SERVICE_ACCOUNT_ROLE_ARN
```

## Testing

> Many ways to testing the new backend server. One way could be get a external IP address for the backend service and test it with `curl`.

> You don't have to use 'kubectl' to interact with the Kubernetes. I'm using k9s.

1. Get the external IP address for the backend service: 
    ```bash
    kubectl get svc backend-release -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
    ```
2. Test the backend server: 
    ```bash
    export BACKEND_URL=$(kubectl get svc backend-release -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    curl -X POST "http://$BACKEND_URL/zap/basescan?target_url=https://google.com"
    ```
