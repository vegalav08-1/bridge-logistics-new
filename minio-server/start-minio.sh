#!/bin/bash

# MinIO Configuration
export MINIO_ROOT_USER=minioadmin
export MINIO_ROOT_PASSWORD=minioadmin123
export MINIO_BROWSER_REDIRECT_URL=http://localhost:9001

# Create data directory
mkdir -p ./data

# Start MinIO server
./minio server ./data --console-address ":9001"




