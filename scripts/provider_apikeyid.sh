#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

aws apigateway get-api-keys --query 'items[?contains(name,`notariseHealthcertKey`) == `true` && contains(name,`stg-pr`) == `false` && enabled == `true`].{id:id,name:name}' > $SCRIPT_DIR/../src/static/provider_apikeyid.json