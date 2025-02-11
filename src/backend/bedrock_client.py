import boto3
import json
import time
import datetime
from fastapi import HTTPException
from botocore.exceptions import ClientError
from fastapi import HTTPException
from config import settings

# Initialize Bedrock clients
bedrock_client = boto3.client("bedrock", region_name="us-west-2")
bedrock_runtime_client = boto3.client("bedrock-runtime", region_name="us-west-2")

def list_bedrock_models():
    """List available AWS Bedrock foundation models"""
    try:
        return bedrock_client.list_foundation_models()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing Bedrock models: {str(e)}")


def invoke_bedrock_model(input_text: str):
    """Invoke the Amazon Titan Text Express model with the given input text."""
    try:
        # Prepare the request payload
        body = json.dumps({
            "inputText": input_text,
            "textGenerationConfig": {
                "maxTokenCount": 500,  
                "stopSequences": [],
                "temperature": 0.7,
                "topP": 0.9
            }
        })

        # Invoke the model
        response = bedrock_runtime_client.invoke_model(
            modelId=settings.BASE_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=body
        )

        # Parse the response
        response_body = json.loads(response["body"].read())

        # Extract and return the generated text
        if 'results' in response_body and len(response_body['results']) > 0:
            return response_body['results'][0].get('outputText', 'No response generated.')
        else:
            return 'No response generated.'

    except ClientError as err:
        raise Exception(f"Error invoking Bedrock model: {err.response['Error']['Message']}")
    except Exception as e:
        raise Exception(f"Unexpected error: {str(e)}")


def fine_tune_bedrock_model():
    """
    Fine-tune a Bedrock foundation model and return the new custom model_id.
    Uses configuration and AWS services to initialize parameters.

    :return: jobIdentifier to track the fine-tuning status.
    """
    try:
        # Generate a unique job name using the current timestamp
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        job_name = f"fine-tune-job-{timestamp}"

        # Use the URIs directly from settings
        s3_train_data = settings.S3_TRAIN_DATA_URI
        s3_output_data = f"{settings.S3_OUTPUT_DATA_URI}{job_name}"

        # Base model ID from settings
        base_model_id = settings.BASE_MODEL_ID

        # IAM role ARN from settings
        role_arn = settings.AWS_ROLE_ARN

        # Call the fine-tuning function from bedrock_client
        response = bedrock_client.create_model_customization_job(
            customizationType="FINE_TUNING",
            jobName=job_name,
            customModelName=f"custom-model-{timestamp}",
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

    except ClientError as err:
        raise HTTPException(status_code=500, detail=f"Error starting fine-tuning: {err.response['Error']['Message']}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


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
