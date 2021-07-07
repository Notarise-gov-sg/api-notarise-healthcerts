#!/usr/bin/env bash

DEV_URL="http://localhost:4000/dev"
X_API_KEY="d41d8cd98f00b204e9800998ecf8427e"

curl -vX POST "$DEV_URL/notarise/pdt" \
        -d @./test/fixtures/example_healthcert_with_nric_wrapped.json \
        --fail --show-error \
        --header "Content-Type: application/json" \
        --header "x-api-key: $X_API_KEY" \
        --max-time 60