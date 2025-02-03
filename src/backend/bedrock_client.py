import boto3
import json
import time
from fastapi import HTTPException

# Initialize Bedrock clients
bedrock_client = boto3.client("bedrock", region_name="us-west-2")
bedrock_runtime_client = boto3.client("bedrock-runtime", region_name="us-west-2")

def list_bedrock_models():
    """List available AWS Bedrock foundation models"""
    try:
        return bedrock_client.list_foundation_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing Bedrock models: {str(e)}")

def invoke_bedrock_model(input_text: str, model_id: str = "anthropic.claude-v2"):
    """Invoke a Bedrock model with the given input text"""
    try:
        body = json.dumps({
            "prompt": f"\n\nHuman: {input_text}\n\nAssistant:",
            "max_tokens_to_sample": 300,
            "temperature": 0.1,
            "top_p": 0.9,
        })

        response = bedrock_runtime_client.invoke_model(
            modelId=model_id,
            contentType="application/json",
            accept="application/json",
            body=body
        )

        response_body = json.loads(response["body"].read())
        return {"response": response_body.get("completion")}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error invoking Bedrock model: {str(e)}")

        
def fine_tune_bedrock_model(
    base_model_id: str, 
    s3_train_data: str, 
    s3_output_data: str, 
    job_name: str, 
    model_name: str, 
    role_arn: str
    ):
    """
    Fine-tune a Bedrock foundation model and return the new custom model_id.

    :param base_model_id: ID of the base model to fine-tune.
    :param s3_train_data: S3 URI where the training data is stored.
    :param s3_output_data: S3 URI where output data should be stored.
    :param job_name: Unique name for the fine-tuning job.
    :param model_name: Custom name for the fine-tuned model.
    :param role_arn: IAM role ARN with permissions for S3 and Bedrock.
    :return: jobIdentifier to track the fine-tuning status.
    """
    try:
        response = bedrock_client.create_model_customization_job(
            customizationType="FINE_TUNING",
            jobName=job_name,
            customModelName=model_name,
            roleArn=role_arn,
            baseModelIdentifier=base_model_id,
            hyperParameters={
                "epochCount": "1",
                "batchSize": "8",
                "learningRate": "0.00001",
            },
            trainingDataConfig={"s3Uri": s3_train_data},
            outputDataConfig={"s3Uri": s3_output_data},
        )

        return {"jobIdentifier": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting fine-tuning: {str(e)}")


def get_fine_tuned_model_id(job_identifier: str):
    """
    Check the fine-tuning job status and retrieve the new model details.

    :param job_identifier: Job identifier from the fine-tuning job.
    :return: The full response if the job is completed successfully, or status if still running.
    """
    try:
        for _ in range(30):  # Wait up to ~15 minutes
            response = bedrock_client.get_model_customization_job(jobIdentifier=job_identifier)
            status = response["status"]
            
            if status == "COMPLETED":
                return response  # Return the full response upon success
            elif status in ["FAILED", "STOPPED"]:
                raise HTTPException(status_code=500, detail=f"Fine-tuning failed: {status}")

            time.sleep(30)  # Wait 30 seconds before checking again

        return {"status": status, "message": "Job did not complete within the expected time."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving fine-tuned model details: {str(e)}")

def list_fine_tuned_models():
    """
    Lists all fine-tuned models created in Amazon Bedrock under the AWS account.

    :return: A list of fine-tuned model ARNs and metadata.
    """
    try:
        response = bedrock_client.list_custom_models()
        return response # Returns list of fine-tuned models

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing fine-tuned models: {str(e)}")


def get_fine_tuned_model_details(model_id: str):
    """
    Retrieves details about a fine-tuned model.

    :param model_id: The ARN of the fine-tuned model.
    :return: Model details.
    """
    try:
        response = bedrock_client.get_custom_model(modelIdentifier=model_id)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving fine-tuned model details: {str(e)}")

def delete_fine_tuned_model(model_id: str):
    """
    Deletes a fine-tuned model from Amazon Bedrock.
    
    :param model_id: The ARN of the fine-tuned model to delete.
    :return: Deletion status.
    """
    try:
        response = bedrock_client.delete_custom_model(modelIdentifier=model_id)
        return {"message": "Fine-tuned model deleted successfully", "response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting fine-tuned model: {str(e)}")
