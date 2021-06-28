#!/bin/bash

# This script is just to use in development to test the e2e portion of the github action

# if AUTHORIZED_ISSUERS_API_URL environment variable is not set, set it
echo "STAGING_BASE_URL: <$STAGING_BASE_URL>"
if [[ -z "$STAGING_BASE_URL" ]]
    then 
        STAGING_BASE_URL="http://localhost:4000/dev"
fi

echo "STAGING_BASE_URL: <$STAGING_BASE_URL>"

# --fail returns an exit code > 0 when the request fails. -- fail sets output to silent, --show-error undoes it.
# NEED TO ADD x-api-key
curl -vX POST $STAGING_BASE_URL/notarise/pdt \
-d @test/fixtures/example_healthcert_with_nric_wrapped.json \
--fail --show-error \
--header "Content-Type: application/json" \
--header 'x-api-key: xxx' 
