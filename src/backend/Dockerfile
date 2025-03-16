# Add platform specification
FROM --platform=linux/amd64 python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Helm
RUN curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy ZAP scan Helm Chart
COPY zap-scan-job /app/zap-scan-job 

EXPOSE 8000

# Use a single worker (--workers 1) by default to allow Kubernetes to handle scaling via multiple pods.
# Increasing workers (--workers > 1) may be beneficial if:
#  - The application is CPU-intensive (e.g., ML processing, encryption) and needs to utilize multiple cores.
#  - The application has blocking I/O operations (e.g., synchronous database queries or slow external API calls).
#  - Kubernetes autoscaling is not fast enough to handle sudden traffic spikes.
#
# However, increasing workers inside a single pod can lead to:
#  - Higher memory usage as each worker runs in a separate process.
#  - Startup events executing multiple times (e.g., database migrations, logging setup).
#
# If using multiple workers, ensure startup logic is protected (e.g., using a singleton pattern) 
# to prevent duplicate execution across workers within the same pod.
CMD ["gunicorn", "main:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--timeout", "1800", "--bind", "0.0.0.0:8000"]
