from aws_cdk import (
    Stack,
    aws_iam as iam,
    aws_amplify as amplify
)

from constructs import Construct

class Amplify(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
