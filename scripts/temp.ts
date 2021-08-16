import { R4 } from "@ahryman40k/ts-fhir-types";

import pcr from "../test/fixtures/v2/pcr-unwrapped.json";
import { parse } from "../src/models/fhir/parse";

const parsed = parse("PCR", pcr.fhirBundle as R4.IBundle);
console.log(parsed);
