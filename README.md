# api-notarise-healthcerts

This repository contains the implementation of the healthcert notarisation API.

## Handlers

### notarisePdt

This handler implements a REST endpoint to notarise a wrapped healthcert for a pre-departure test.

```sh
npm run dev
curl -i -X POST \
  -H 'content-type: application/json' \
  -H 'x-api-key: <api key>' \
  -d '@example_notarized_healthcert_wrapped.oa' \
  http://localhost:3000/notarise/pdt
```

When running locally, the required API key will be printed to the console on starting the serverless framework.

A response should be returned within 15 seconds.

Possible responses:

* On success, a JSON payload is returned with 3 keys:
  * `notarisedDocument`: the notarised certificate
  * `url`: the url where the notarised certificate can be viewed
  * `ttl`: time to live for the certificate
* Status code `422` is returned if the JSON is invalid
* Status code `400` is returned if the payload does not conform to the expected format for a notarised PDT healthcert. If there is additional information available, this is exposed as a JSON object with 3 properties: `title`, `detail` and `code`
* Status code `500` is returned if the certificate being notarised is valid but there was a problem encountered during the notarisation process.

---

# Configuration

See .example.env for configurable parameters.

# Development

Copy `.env` from a co-worker or insert own credentials to get started. A copy of the .env file is available at `.env.example`

```
npm run dev
```

To run local tests against dynamodb-local, run commands

`npm run dev` to start the local environment
`npm run test` to run the tests

## Development process

- copy .env.example into .env and replace the values needed. For instance
  - TRANSIENT_STORAGE_URL: to your local or staging storage API
  - SIGNING_DID: check with ops
  - SIGNING_DID_KEY: check wth ops. For ethereum DID, it's equal to `SIGNING_DID` prepended with `#controller`
  - SIGNING_DID_PRIVATE_KEY: check with ops
- start the local environment: `npm run dev`

## Generating a wrapped cert
- Edit `test/fixtures/example_healthcert_unwrapped.json` to include your particulars
- Run
```
yarn gen:input
```

## Change port

- use the `port` option from serverless offline: `npm run dev -- --port 3001`
