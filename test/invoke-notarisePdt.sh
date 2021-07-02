#!/bin/bash 

STAGING_URL="http://localhost:4000"
X_API_KEY=""

curl -vX POST "$STAGING_URL/notarise/pdt" \
    -d @./fixtures/example_healthcert_with_nric_wrapped.json \
    --fail --show-error \
    --header "Content-Type: application/json" \
    --header "x-api-key: $X_API_KEY" \
    --max-time 60