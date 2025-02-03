#!/bin/sh
set -e

if [ -z "$RC_FILE_LOCATION" ] || [ ! -f "$RC_FILE_LOCATION" ]; then
    echo 'RC_FILE_LOCATION is not set or file does not exist.'
    exit 1
fi

AWS_REGION=$(yq '.aws.region' < "$RC_FILE_LOCATION")
AWS_PROFILE=$(yq '.aws.profile' < "$RC_FILE_LOCATION")
AWS_ACCESS_KEY=$(yq '.aws.credentials.aws_access_key_id' < "$RC_FILE_LOCATION")
AWS_SECRET_KEY=$(yq '.aws.credentials.aws_secret_access_key' < "$RC_FILE_LOCATION")
PULUMI_ACCESS_TOKEN=$(yq '.pulumi.profiles[0].access_token' < "$RC_FILE_LOCATION")
CLOUDFLARE_API_TOKEN=$(yq '.cloudflare.api_token' < "$RC_FILE_LOCATION")
CLOUDFLARE_ZONE_ID=$(yq '.cloudflare.zone_id' < "$RC_FILE_LOCATION")

mkdir -p ~/.aws
{
    echo "[$AWS_PROFILE]"
    echo "aws_access_key_id=${AWS_ACCESS_KEY}"
    echo "aws_secret_access_key=${AWS_SECRET_KEY}"
} > ~/.aws/credentials

export AWS_ACCESS_KEY
export AWS_SECRET_KEY
export AWS_PROFILE
export AWS_REGION
export PULUMI_ACCESS_TOKEN
export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ZONE_ID

exec "$@"