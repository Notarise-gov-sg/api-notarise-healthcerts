#!/bin/bash

aws apigateway get-api-keys --query 'items[?contains(name,`notariseHealthcertKey`) == `true` && contains(name,`stg-pr`) == `false` && enabled == `true`].{id:id,name:name}' > ../src/static/provider_apikeyid.json