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

#### Alternatively:
`npm run dev` on one terminal  
`npm run invoke-local:notarisePdt` on another terminal. This will run the script to the curl command above

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
  - OFFLINE_QR_ENABLED: Feature toggle for Offline Qr certification
  - SIGNING_EU_QR_NAME: Display name of the certification issuer
  - SIGNING_EU_QR_VALIDITY_IN_MONTHS: For set QR validity in months
  - SIGNING_EU_QR_PUBLIC_KEY: Public key of signing offline QR with single line string and include `\n` for newline
  - SIGNING_EU_QR_PRIVATE_KEY: Private key of signing offline QR with single line string and include `\n` for newline
- start the local environment: `npm run dev`

## Generating a wrapped cert
- Edit `test/fixtures/example_healthcert_unwrapped.json` to include your particulars
- Run
```
yarn gen:input
```

## Change port

- use the `port` option from serverless offline: `npm run dev -- --port 3001`
