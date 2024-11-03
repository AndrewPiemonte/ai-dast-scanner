#!/usr/bin/env python3
import aws_cdk as cdk
from lib.vpc_stack import AestVpcStack
from lib.eks_stack import EksStack
from lib.s3_stack import S3Stack

app = cdk.App()

vpc_stack = AestVpcStack(app, "AestVpcStack")

EksStack(app, "EksStack", vpc=vpc_stack.vpc)
S3Stack(app, "S3Stack")

app.synth()
