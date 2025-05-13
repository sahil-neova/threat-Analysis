#!/bin/sh
mkdir -p /root/.aws
echo "[default]" > /root/.aws/credentials
echo "aws_access_key_id=$AWS_ACCESS_KEY_ID" >> /root/.aws/credentials
echo "aws_secret_access_key=$AWS_SECRET_ACCESS_KEY" >> /root/.aws/credentials

echo "[default]" > /root/.aws/config
echo "region=$AWS_DEFAULT_REGION" >> /root/.aws/config
echo "output=json" >> /root/.aws/config

export AWS_SHARED_CREDENTIALS_FILE=/root/.aws/credentials
export AWS_CONFIG_FILE=/root/.aws/config

streamlit run main.py --server.port=8501 --server.address=0.0.0.0