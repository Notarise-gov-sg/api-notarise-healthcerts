# api-notarise-healthcerts

This repository implements the API endpoint for the endorsement of HealthCerts on Notarise.gov.sg.

## Collaborators

HealthCert collaborators may refer to the documentation [here](./docs).

## Getting Started

**Request Format**:

```sh
curl -i -X POST \
  -H 'content-type: application/json' \
  -H 'x-api-key: <api key>' \
  -d '@wrapped_healthcert.oa' \
  'https://<domain>/production/v2/notarise/pdt'
```

**Response Format**:

```json
{
  "notarisedDocument": {...},
  "ttl": 1636629304073,
  "url": "https://www.verify.gov.sg/verify?q=xxx",
  "gpayCovidCardUrl": "https://pay.google.com/gp/v/save/xxx"
}
```

> **Note**: A response would typically take about 15 seconds.

## Schemas/Samples

- **Clinic/Provider Issued Sample**: Sample HealthCert issued by a clinic/provider that utilises the new PDT Schema v2.0 [here](https://schemata.openattestation.com/sg/gov/moh/pdt-healthcert/2.0/clinic-provider-wrapped.json).

- **Notarise Issued Sample**: Sample HealthCert after endorsement by Notarise.gov.sg that utilises the new PDT Schema v2.0 [here](https://schemata.openattestation.com/sg/gov/moh/pdt-healthcert/2.0/endorsed-wrapped.json).

- **All Schemas/Samples**: For all documented schemas/samples, refer to the `PDT-HEALTHCERT v2.0` section [here](https://schemata.openattestation.com>).

- **GUI Toolkit**: For ease of development with the Open Attestation library, use this [toolkit](https://toolkit.openattestation.com) for wrapping/unwrapping, diagnosing, verifying etc.

---

## Developers/Contributors

### Prerequisites

- Copy `.env` from a co-worker or insert own credentials to get started. A copy of the .env file is available at `.env.example`.
- When running locally, a local API key is required. Obtain it from the console when starting the serverless framework.

### Developing locally

To start local environment:

```sh
npm install
npm run dev
```

To endorse a HealthCert in local environment, run one of the commands in a separate terminal:

```sh
curl -i -X POST \
  -H 'content-type: application/json' \
  -H 'x-api-key: <api key>' \
  -d '@example_notarized_healthcert_wrapped.oa' \
  'http://localhost:4000/dev/v2/notarise/pdt'

# OR

npm run invoke-local:notarisePdt
```

To run tests:

```sh
npm run test
```

### Generating a sample wrapped cert

1. Edit `test/fixtures/v2/example_healthcert_unwrapped.json` to include your particulars.

2. ```sh
   npm run gen:input
   ```

### Environment Variables

Copy .env.example into .env and replace the values needed:

- `TRANSIENT_STORAGE_URL`: to your local or staging storage API
- `SIGNING_DID`: check with ops
- `SIGNING_DID_KEY`: check wth ops. For ethereum DID, it's equal to `SIGNING_DID` prepended with `#controller`
- `SIGNING_DID_PRIVATE_KEY`: check with ops
- `OFFLINE_QR_ENABLED`: Feature toggle for Offline Qr certification
- `SIGNING_EU_QR_NAME`: Display name of the certification issuer
- `SIGNING_EU_QR_PUBLIC_KEY`: Public key of signing offline QR with single line string and include `\n` for newline
- `SIGNING_EU_QR_PRIVATE_KEY`: Private key of signing offline QR with single line string and include `\n` for newline
- `GPAY_COVID_CARD_ENABLED`: Feature toggle for Google Pay COVID Cards
- `GPAY_COVID_CARD_ISSUER`: Issuer service account
- `GPAY_COVID_CARD_ISSUER_ID`: Issuer ID
- `GPAY_COVID_CARD_PRIVATE_KEY`: Private key for signing JWT
- `WHITELIST_NRICS`: Comma-separated NRICs to enable features only for whitelisted users. Other feature flags will be ignored when oaDoc patient's nricfin is matched from this list.

## Change port

- Use the `port` option from serverless offline: `npm run dev -- --port 3001`
