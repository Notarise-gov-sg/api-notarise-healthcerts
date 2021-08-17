import { R4 } from "@ahryman40k/ts-fhir-types";

import sample from "../test/fixtures/v2/pcr-unwrapped.json";
// import sample from "../test/fixtures/v2/art-unwrapped.json";
import fhir from "../src/models/fhir";

const parsed = fhir.parse(sample.fhirBundle as R4.IBundle);

// eslint-disable-next-line no-console
console.log(parsed);
