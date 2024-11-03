import yaml

from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_eks as eks,
)
from constructs import Construct


class EksStack(Stack):
    dast_deployment_path = "eks_manifests/dast_deployment.yaml"
    dast_service_path = "eks_manifests/dast_service.yaml"

    def __init__(self, scope: Construct, id: str, vpc: ec2.Vpc, **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        self.cluster = eks.Cluster(
            self, "AestEks",
            vpc=vpc,
            version=eks.KubernetesVersion.V1_31,
            default_capacity=2 
        )

        self.cluster.add_manifest(
            "DastDeployment",
            self.load_eks_manifest(self.dast_deployment_path)
        )

        self.cluster.add_manifest(
            "DastService",
            self.load_eks_manifest(self.dast_service_path)
        )

    def load_eks_manifest(self, path):
        with open(path, 'r') as file:
            return yaml.safe_load(file)
