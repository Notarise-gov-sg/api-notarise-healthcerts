#!/usr/bin/env bash

mkdir -p ~/.aws

cat > ~/.aws/credentials << EOL
[default]
aws_access_key_id = ${PRODUCTION_AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${PRODUCTION_AWS_SECRET_ACCESS_KEY}
EOL

npm run deploy -- --stage prd