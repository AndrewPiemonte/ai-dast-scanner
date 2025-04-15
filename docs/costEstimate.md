# Cost Estimate

## Estimate BreakDown (Monthly)
This is an estimate for a team of 20 members having each member create 100 reports making on average 4 queries per chatbot. The cost is in US dollars.

| No. Instances | Service Name | Details | Rate | Estimated Usage | Estimated Cost|
|---|---|---|---|---|---|
| 1 | EC2 |  t3.small |	$0.0208/hr | 720hr | $14.98 |
| 2 | S3 Bucket | Frequent Access Tier | $0.023/GB | 100GB/bucket | $4.60 | 
| 1 | EKS Cluster | Standard Kubernetes Version | $0.10/hr | 720hr | $7.20 |    
| 1 | Bedrock | On demand Llama 3 Model | $0.002/request |2,000 report request + 8,000 chatbot requests = $10,000 queries | $20.00 | 
| 1 | VPC | NAT gateway | $0.045/hr | 720hr | $32.40 |
| 1 | Amplify | Deploy, Data Storage, Data Transfer, SSR |\$0.01/min Deploy, \$0.023/GB Storage, \$0.15/GB Transfer, \$0.30/M-requests + \$0.20/GB-hour SSR | 6 min (1 Deployment), 10GB storage, 10GB Transfer, 1000 SSR requests, 200ms/req|  $2.68 |
| 1 | Cognito | Essentials | $0.015/10,000 MAU | 20 MAU | $0.15 |
| 1 | DynamoDB | On Demand | \$0.00/25GB Storage, \$0.00/200M requests/month | 10GB Storage, 50,000 requests/month | $0.00 |
| 1 | AppSync | GRAPHQL API, no caching| $4.00 per million Query and Data Modification Operations | 10,000 Queries & Data modification operations | $4.00 |
| Total | | | | | \$86.01/month |



