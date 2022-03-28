import { getData } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { notarise } from "@govtechsg/oa-schemata";
import fhirHelper from "../../fhir";
import { createNotarizedHealthCert } from "./createNotarizedHealthCert";
import exampleHealthcertUnWrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleHealthcertWrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import { mockDate, unmockDate } from "../../../../test/utils";

const sampleDocument = exampleHealthcertWrapped as any;
const sampleDocumentUnWrapped = exampleHealthcertUnWrapped as any;
const uuid = "e35f5d2a-4198-4f8f-96dc-d1afe0b67119";
const storedUrl = "https://example.com";
const sampleSignedEuHealthCerts: notarise.SignedEuHealthCert[] = [
  {
    type: "PCR",
    qr: "HC1:abcde",
    expiryDateTime: "2022-12-17T01:27:50.263Z",
    appleCovidCardUrl: "https://redirect.health.apple.com/EU-DCC/#abcde",
  },
];

beforeAll(mockDate);
afterAll(unmockDate);

it("should wrap a v2 document and sign the document", async () => {
  const parseFhirBundle = fhirHelper.parse(
    sampleDocumentUnWrapped.fhirBundle as R4.IBundle
  );
  const createdDocument = await createNotarizedHealthCert(
    sampleDocument,
    parseFhirBundle,
    uuid,
    storedUrl
  );
  const documentData = getData(createdDocument);
  expect(documentData).toMatchInlineSnapshot(
    documentData,
    `
    Object {
      "$template": Object {
        "name": "HEALTH_CERT",
        "type": "EMBEDDED_RENDERER",
        "url": "https://healthcert.renderer.moh.gov.sg/",
      },
      "attachments": Array [
        Object {
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiMmMwMWM2NjQtYTJmOS00ODQ3LTkxNTgtOGNlMzM3ZmUwZmUyOnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiZjk5ZDBjZWQtODM5Ny00Y2Q0LTg1NTgtNjQ1Nzg4YjQ5NThjOnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6IjA1ZTU3NTg1LTdjY2MtNGI2MS1iMjEyLTU4MjgyOGY2ZDYzMzpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiOTBiZDYxYmItOGVmMi00M2M1LWFlZTItYzNiN2Y5NzJjNGEwOnN0cmluZzoyMDIxLTA4LTI0VDA0OjIyOjM2LjA2MloiLCJmaGlyVmVyc2lvbiI6IjllMWMwMjI5LTQ1NTAtNDhhMy04MWU5LWMwZDQ2YzZhN2VhZjpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6ImU2MmU2ZDc3LTM1OWQtNGY5Mi04NTliLTg0ZjFlMGZkYmFjYzpzdHJpbmc6QnVuZGxlIiwidHlwZSI6ImFhOWUwNThiLTQzNDQtNDJjMC05NTBjLWIyZjU1ZTFmMGQyMjpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiZmJlNDY2ZjktYzM4NC00NzcxLWJhODEtYjY5Njk4MGRmZmM0OnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiI1MmQ3MDc4NS0yNGU5LTQ5NzItYmFiYS0zNjY0ZTY3NDc4OTA6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6ImVjNjM1Njc1LTE4M2ItNDdjOS05OWMxLWUzM2E4OTRlNjg1ODpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6IjEwZGM4ZWNmLTI4YjktNGIxYi04YWYyLTA0YmZhOTlhMjNiMzpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiI1OTRkMGI5MS1kYmE0LTRmNWQtODk4Ny1lYzdiNTExNzM3ZDA6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6IjMzZTEzNmM3LTMzZDgtNDkyMi05N2FhLWIzNDQ0YzZmNjk2ZjpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiMTFkYzVmMzQtNDMzOS00NmUwLTg5N2UtYzU4NmFhZWI0OWYxOnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6Ijc1YjA0OTNmLThhMDQtNGNhOS04MzhiLTYxMzM5MDk2Y2IxNzpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjJiYmU3MWIzLTVhNWUtNDE1OC05MmRhLTA3ZDcwNWJlNzIyMzpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6IjBiNTBkNWM2LTEzNDEtNDg3YS1hNmEzLTk5MDRiMDA2NDcwOTpzdHJpbmc6UFBOIiwiZGlzcGxheSI6IjYxOThjYzllLWRhNTItNDBhOC1iN2JhLWRjY2YxZjA4ZmM3ZDpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiI3ODIzNTlmOC1jNDA5LTQyYmYtYTNiYS1kNDk1YTUxMjI1NTU6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiJjODYyOTJlNy1jZDg2LTQ0OGMtYjQzYy1iOWE3OTRjYTVhOTg6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiIyODljOTkzZC0xNWMxLTRmZjItOWQzMi1mZTQwZmJjZWJkOWE6c3RyaW5nOlMzMDAxNDcwRyJ9XSwibmFtZSI6W3sidGV4dCI6Ijk3YjI5ZDJjLTYyZGQtNGIxOS1iOTMzLTkwNTUzMTZjMGZhODpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiZmNhNzAzMzEtOTNhZi00ZmI4LWIyYzAtYTczNWEwZGMzYjJlOnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiI4NGFjYTc2Mi1kOTk0LTQ2NDgtYThmNy03YzA5MjcyMGFjNTA6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiNDc2MjgyNTUtMjllYi00YmEyLThmY2UtNzc1MjNhYTM5OTc3OnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJmZWEzZmQwNi02ZTNiLTRiNzctYWZkMi1lMmY4ZTdiZjU3YmY6c3RyaW5nOk9ic2VydmF0aW9uIiwic3BlY2ltZW4iOnsidHlwZSI6Ijc4OGQ0YWRkLWFkYmYtNDViMS1iZGZjLWQ3OGU5M2Q4YjEyMzpzdHJpbmc6U3BlY2ltZW4iLCJyZWZlcmVuY2UiOiI2Y2Q5NTBmZi03OWNlLTQ5MzctODkwMC1mOTE1YjdhNjU1NTY6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSJ9LCJwZXJmb3JtZXIiOlt7InR5cGUiOiJjZGMzMGMxNC00NDE2LTRkZmItOTAxNi0yNDJhYWFjMTk3ZjE6c3RyaW5nOlByYWN0aXRpb25lciIsInJlZmVyZW5jZSI6IjczYWE1OTdiLTk5ZGItNDA3MS05MDA3LTQ1YjU1MTMxM2Y2YzpzdHJpbmc6dXJuOnV1aWQ6M2RiZmYwZGUtZDRhNC00ZTFkLTk4YmYtYWY3NDI4YjhhMDRiIn0seyJpZCI6Ijg3ZTQ0ZjlmLWI0ZTctNDEyZi05MzcwLTE3Y2VlMDUyNzU3ODpzdHJpbmc6TEhQIiwidHlwZSI6IjgyOWFjZWY0LTY2YWMtNGY5MC1hMTQxLTFjYzFiZTg2MWU1YjpzdHJpbmc6T3JnYW5pemF0aW9uIiwicmVmZXJlbmNlIjoiYjA2Njk5OTgtZWVhMC00N2M2LWE5Y2UtN2E5YjE2N2QyYjg4OnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEifSx7ImlkIjoiMzBjNTI3ZmQtZWNmZS00MWE1LThlMDEtNjc5YjliY2JjYzY5OnN0cmluZzpBTCIsInR5cGUiOiIyNjhmMDE0NC0zMWRlLTQzZTgtYTY5OC1kMjUwNDk2MjhiNDY6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6ImY4ODhkYjMyLTdhODEtNDhhMy05MDU1LTY5ZTJmZTI2MGEyNjpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3In1dLCJpZGVudGlmaWVyIjpbeyJpZCI6IjcwNzE2MDE0LTZiOWYtNGZjZC1hM2RkLTc5NzI0YWEzMTM0MjpzdHJpbmc6QUNTTiIsInR5cGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiJiZmIyM2ZlZi01YzY3LTRiZjctOGFkMC0wMTUwNTE2NjEwMjM6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiJhZTNkOTg5ZC0yMDg2LTQ5NzgtODY0Zi04MzI0ZmZhMjczMmM6c3RyaW5nOkFDU04iLCJkaXNwbGF5IjoiNGEzMTBjMmItOWY3MC00NDA3LWFhZDYtMzVlMzFkZDFjYTZiOnN0cmluZzpBY2Nlc3Npb24gSUQifV19LCJ2YWx1ZSI6IjNlMGY1M2M0LTJlOWQtNGE3OC05NDA5LTgxMDYzZTZkZjgxMzpzdHJpbmc6MTIzNDU2Nzg5In1dLCJjYXRlZ29yeSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiJkMDg4OTI0MC1iNTg3LTRjN2MtYjE3NC00MDFmZGYzZWYyYWI6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiMDMyNGFhNzctM2MxMS00YTVhLWEyOTYtNWQzNmE4NzFiM2JmOnN0cmluZzo4NDA1MzkwMDYiLCJkaXNwbGF5IjoiYjBhYzIxNjItZDM4MC00YWZhLTgwZjAtZjc0MjQ2NDNkNDAyOnN0cmluZzpDT1ZJRC0xOSJ9XX1dLCJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiMjA4ZjZiM2UtNzk3OC00YjhmLTkyZTQtMzJmYjAzN2U0OWJiOnN0cmluZzpodHRwOi8vbG9pbmMub3JnIiwiY29kZSI6ImM5MjRlZjUwLTAzMjUtNGI5Ny04YzdmLWI5MTMxYTU1MjkyYTpzdHJpbmc6OTQ1MzEtMSIsImRpc3BsYXkiOiJkYTMwZGViNi05NDg3LTQ5NjYtOTkwZC1jODVhMWUzZjZiZmM6c3RyaW5nOlNBUlMtQ29WLTIgKENPVklELTE5KSBSTkEgcGFuZWwgLSBSZXNwaXJhdG9yeSBzcGVjaW1lbiBieSBOQUEgd2l0aCBwcm9iZSBkZXRlY3Rpb24ifV19LCJ2YWx1ZUNvZGVhYmxlQ29uY2VwdCI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImYxMTcxMzA0LTM5MmItNDMwNy1hNzBlLTVhZTk2MDJhN2RlZTpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiJhMThkMTNiNC00YWU1LTQ3YzMtODJmYy03ZjM5N2ZmZjFiODE6c3RyaW5nOjI2MDM4NTAwOSIsImRpc3BsYXkiOiI5MWE1NmVjOS1lMmE1LTQ2YTMtYTM0Yy05ZDViOTBmYmFmY2E6c3RyaW5nOk5lZ2F0aXZlIn1dfSwiZWZmZWN0aXZlRGF0ZVRpbWUiOiIxZDc3ZjMxMi03NTgxLTQ3ZDgtOTkyYy04Y2ViOGY5MzVhODQ6c3RyaW5nOjIwMjAtMDktMjhUMDY6MTU6MDBaIiwic3RhdHVzIjoiYmYzYWNjMjEtNGU1Yi00ODg5LTk1MzYtYTZiZGFiZjliNjAxOnN0cmluZzpmaW5hbCJ9fSx7ImZ1bGxVcmwiOiI1NzljZWRmYy1kNTQ5LTQ0N2ItOTdlNy03OTNhNGVmZDc1ZTA6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6ImY4NDlhZGE1LTYyMDMtNDFlYS04NTM1LTRhYmQyYWE5ZDVkYzpzdHJpbmc6U3BlY2ltZW4iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiNjZlMzFiMWQtZmU0Zi00MDYzLWEyM2QtYTQwMDkxZTkyNWFlOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6IjEwY2VkNTZlLTRkNzctNDcwNC1iYThmLWQ4NjIxNTJmZjE1YTpzdHJpbmc6MjU4NTAwMDAxIiwiZGlzcGxheSI6IjVlNzI5MjA0LTgyN2EtNDA2Yy05YmI1LTM5ZTk2YTk4ZDEzZjpzdHJpbmc6TmFzb3BoYXJ5bmdlYWwgc3dhYiJ9XX0sImNvbGxlY3Rpb24iOnsiY29sbGVjdGVkRGF0ZVRpbWUiOiIyYTMxMzI4MS0wNjJjLTQwYmYtYTE5Ny1iMjc3YmRlMTA1MDU6c3RyaW5nOjIwMjAtMDktMjdUMDY6MTU6MDBaIn19fSx7ImZ1bGxVcmwiOiI3MzdlN2QzNy1kNjU4LTRmNzItYjYxMS1hNzI1YmE3OGJkNjU6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjlhYWY2YTI3LTlmNzItNDIwMi05ZmQyLTA3NTRjNWM2MGFkMjpzdHJpbmc6UHJhY3RpdGlvbmVyIiwibmFtZSI6W3sidGV4dCI6ImRlNjQ3ZTZmLWVjNGUtNDIyMi1iMGVhLWE2MmI1YWQ2YzUxYjpzdHJpbmc6RHIgTWljaGFlbCBMaW0ifV0sInF1YWxpZmljYXRpb24iOlt7ImNvZGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiJjZjBkMDViMC1lNWQ5LTQwNDYtYWY3MS03NzM1YmU3NTU3MmM6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiI5MzlmZDE0Ni00YjMyLTQ2YTgtODljMy0zMDhhNjNiMDQwNzE6c3RyaW5nOk1DUiIsImRpc3BsYXkiOiI1NmU0ZjgyYS00ZmRjLTRmMzMtOGIzNC1iOWVkZTEyYjc3OWE6c3RyaW5nOlByYWN0aXRpb25lciBNZWRpY2FyZSBudW1iZXIifV19LCJpZGVudGlmaWVyIjpbeyJpZCI6IjNhOWJkMDU2LWNiMDQtNDNmMy1hZDJiLTQxZjZhMDE5MzQyYzpzdHJpbmc6TUNSIiwidmFsdWUiOiI1Zjk0YWVmOC1jNDcxLTQ4ZjctYjczNi0wNTViODRkMTkzZDA6c3RyaW5nOjEyMzQ1NiJ9XSwiaXNzdWVyIjp7InR5cGUiOiI4NzM4OWE3Zi02ZDFkLTRjOTctOTg2ZC05YjM4Y2VlODBkYTQ6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6IjdlMDdlZDJiLTA5YTgtNDljMS05ZmM1LTkyNmUwMTRmYTRlZTpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIn19XX19LHsiZnVsbFVybCI6ImNkMWZiNjU4LTE4MjMtNGMzOS1hZDJlLWI2NjYyZjk4NmI2MTpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiNjVmMzAxYmItZDEzNi00YTg0LWFlZmItODc3YzJiMWUxOTg4OnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiNTRmMDMwNDAtNzRhNy00ZmU1LWI3NDYtOGJjYWFkMjE4Y2VjOnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGggKE1PSCkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6ImQ0ZWQ2YzBmLTgyNDctNDI3Ny04NGIxLTVjMWIxNjEyNzQ2MzpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJiY2VmMTJjZC04MjljLTQ0MWItYjllYS00YzE0ODZlMjhkYzU6c3RyaW5nOmdvdnQiLCJkaXNwbGF5IjoiMmRiYWVjM2UtOGUyNS00NTAzLTllNTMtMjE4ZmJkMDkzMGMxOnN0cmluZzpHb3Zlcm5tZW50In1dfV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6ImY3N2JmYjM2LWE2OTEtNDU5OS04OTU5LWViYzk2M2NlY2QyNDpzdHJpbmc6dXJsIiwidmFsdWUiOiI0NTc1ZDM0ZC1hZTJlLTRhNDctODFmYS1kMDIxYjc4NTQyN2U6c3RyaW5nOmh0dHBzOi8vd3d3Lm1vaC5nb3Yuc2cifSx7InN5c3RlbSI6IjFkNWNmMzZmLWYyMjAtNGQ2Mi04MDE5LWYxOGZlMGY3MTdmNTpzdHJpbmc6cGhvbmUiLCJ2YWx1ZSI6ImIzOWY5M2E1LTJhYjAtNDFlNC1hMDYyLWFkMTRlYWI1NDQ4YjpzdHJpbmc6KzY1NjMyNTkyMjAifV0sImFkZHJlc3MiOnsidHlwZSI6ImQwOTBlODE3LWVkNzItNDc3Ni1iMWUwLWJkZjNmMWQzNDhjOTpzdHJpbmc6cGh5c2ljYWwiLCJ1c2UiOiJmMzdlOTJiNS03N2JlLTRkMDMtODA3Zi00MzNlYTAwNWE3NDk6c3RyaW5nOndvcmsiLCJ0ZXh0IjoiZjY2YTM1YzMtY2Y5My00ZDE4LWI0MzEtNmFhN2M5ZmI2YTdmOnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGgsIDE2IENvbGxlZ2UgUm9hZCwgQ29sbGVnZSBvZiBNZWRpY2luZSBCdWlsZGluZywgU2luZ2Fwb3JlIDE2OTg1NCJ9fV19fSx7ImZ1bGxVcmwiOiJjNGFlZjM1Mi02NTk1LTQ1MWMtYmIzZi0xYTM2NzJmNWNjNjU6c3RyaW5nOnVybjp1dWlkOmZhMjMyOGFmLTQ4ODItNGVhYS04YzI4LTY2ZGFiNDY5NTBmMSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjQ0ZWRiNWRhLTMyYzctNDk1Mi1iMjgxLTNjODE0ZWNjZDcyYzpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjIwMjY4Y2U0LWFjYWYtNDgwZC1hOTE3LTQ5MWZiZTc1ODg3YjpzdHJpbmc6TWFjUml0Y2hpZSBNZWRpY2FsIENsaW5pYyIsInR5cGUiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiNGZmNjI1MTUtZWZlYS00NGZiLTg4MTUtMjkzMGQzM2ExZjQ2OnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL29yZ2FuaXphdGlvbi10eXBlIiwiY29kZSI6IjFlZTZiM2YyLTc3NjAtNGJkNS1iYjRhLWMxODM0NzdlYjJmZjpzdHJpbmc6cHJvdiIsImRpc3BsYXkiOiIxODM5YzZlMC0wZmIzLTQ5ZjQtOGZhNC03NGNjYTcxYmQ2NTg6c3RyaW5nOkhlYWx0aGNhcmUgUHJvdmlkZXIifV0sInRleHQiOiIxYjliOGExNC1jNWJhLTQ0YzItYWU4Yy03MmJjNTM1NWFkMzU6c3RyaW5nOkxpY2Vuc2VkIEhlYWx0aGNhcmUgUHJvdmlkZXIifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6IjAyZTgyMTJhLTk1MGUtNDI3Mi04ODk2LTg1NGZiNmQ2YjliNzpzdHJpbmc6dXJsIiwidmFsdWUiOiIyNjA0ZjEwYS02YTc0LTRlYTMtYWU4ZC1kMGZkNzc3NjY1OTk6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVjbGluaWMuY29tLnNnIn0seyJzeXN0ZW0iOiIxMjkwYTVmZi01NGUyLTRiYzEtODAwYi0zNWY4YTQ2ZmZiNTI6c3RyaW5nOnBob25lIiwidmFsdWUiOiI4YTYyZWJlMi0xMzlmLTQzZjYtYmZlMC04MzgzNzdiYmQ2NmI6c3RyaW5nOis2NTYxMjM0NTY3In1dLCJhZGRyZXNzIjp7InR5cGUiOiI1ZGM2YmUxYS01ZjU5LTQxNmYtYTZlYS0xNmMwNjM5MDdjZjE6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiODQwZjI0NzMtOTU5OC00NTMwLTkzZjItMzZmZDdlMGU3YjEzOnN0cmluZzp3b3JrIiwidGV4dCI6ImUzNWI4ZWNiLTE3MzItNDRhZC1hOGJlLTIwY2ViNDFjM2E1MjpzdHJpbmc6TWFjUml0Y2hpZSBIb3NwaXRhbCwgVGhvbXNvbiBSb2FkLCBTaW5nYXBvcmUgMTIzMDAwIn19XX19LHsiZnVsbFVybCI6Ijg4NDg3OGExLTcxODYtNGZmYS1hZDNjLTg0M2IxMTU4NDQyMTpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3IiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiZjNmMjY4ZTItYjA4My00M2I1LWJjNjktY2UxYzc1MDE5ZGUyOnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiZmE0ZWU4ZDAtOTc2My00NzQ2LWIwNjYtZjQwZTkwZTE1NjEwOnN0cmluZzpNYWNSaXRjaGllIExhYm9yYXRvcnkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6IjU5M2UzYTUyLWVmM2MtNGQ4Yi05YmRiLWY4ZDhjZmVlMjU0NTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJhODU3MzBjMC01YzY2LTRlNTAtYWM3My0wMWM1YTM4OTZmYjE6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiZjY5NGUwZjMtNzlkMy00ODQ4LThjMzktYmE5OTBmYThlMGVmOnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiMzQxZWRmMTAtZjczYS00NTY4LTkwN2MtMDQxOTM0MjI1YWY0OnN0cmluZzpBY2NyZWRpdGVkIExhYm9yYXRvcnkifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6IjUwZjBjZjk2LTE0ZDMtNDgxOS1hNzY1LTdkNDEzY2ZiMjc1MTpzdHJpbmc6dXJsIiwidmFsdWUiOiI2NDRmMGRjYy0yODk3LTQ4YzEtYjAzMi00MjRmOGQ1ZGVlZWQ6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVsYWJvcmF0b3J5LmNvbS5zZyJ9LHsic3lzdGVtIjoiYWRjZTBhMWQtOGM4Zi00ZDUyLTgzZjUtMWVhYThiMTYyZDIzOnN0cmluZzpwaG9uZSIsInZhbHVlIjoiODExMjg4YjEtNTU1ZS00MzJlLTk0OTktYTdiOTQ0ZTExMmExOnN0cmluZzorNjU2NzY1NDMyMSJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiZGIwNmNhN2MtNWYwNi00ZGVkLTliODAtNWUzZWNhZDY4M2MwOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6IjhhYjdlMWQ1LTE2NzItNDEyYS04MmUyLWZlYzc4OWZmNTZlZjpzdHJpbmc6d29yayIsInRleHQiOiI4MWU1MWIwNi1jN2ZlLTRiMDYtODFlMS0zNDM1MzM2NTUwZTY6c3RyaW5nOjIgVGhvbXNvbiBBdmVudWUgNCwgU2luZ2Fwb3JlIDA5ODg4OCJ9fV19fV19LCJsb2dvIjoiN2MwYjIzMTktNDYxOS00N2EwLWJkOTYtYWMzOTA0MjgwYTIyOnN0cmluZzpkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWZRQUFBRElDQU1BQUFBcHgrUGFBQUFBTTFCTVZFVUFBQURNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16ZUNtaUFBQUFBRUhSU1RsTUFRTCtBN3hBZ24yRFAzekJ3cjFDUEVsK0kvUUFBQndkSlJFRlVlTnJzbmQxMjJ5b1FSdmtISVNITit6L3R5VWs5b1RFQ1ExYlRCYzIzYnlOczBCNUdJREFSQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWsrSWsrSWR4NGc1TjRCOUdRL3JQQTlKL0lQZlNnd0wvTUVFQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR3UDVaUG9QNXI3RkpLQWY3Y3VmQmloUE5Ta1g1aGxBOXUrRHNQN2RYL0pLMVAyVlBpU0lvZWJFckx3Vmg1WngrOEMxWTIyWXRQMEZwZjZoZGVhK21xMVdsaXhmZWo2UmNEeGowOXN3WGJiZUJRcGlqdWcyMGFqL1NFOGJ2bzVoRXVhdkF1U0twUWZKeFRHOTFnVXJDVjZqU1FFMG9Qa2U0d3VrZTcwNUVxcExOV3h0TXRTazRqdlhHbGQrdExseHZWTU5uYWtEN21FbmRZVFZXU25WODYwV1VYbDM0Uk15N0JlbXB5R3pON3BBYm1YRUE2YmZ2SzB1MzJ1VEZLS1ZNMHIwWXcxTVRjRnZwOGlWTFBEMCs5Z0hReSs3clNmM2VlanAySHVGY3NtbGRpRXowRnpLWGZTUnczcWUwOFhxZDlkUDZRS09Obmt1NGxHM05TYi9SQnRLdEt0MXR0ZEJKaVliMlZJN2JyYzd0YzhJWW90SnpIVUIwYytPK1QzclRRdUxLc1pScXB6a1RTN2RaSTR2bytxSm5kRUdPOEV6ZWN5amFjNi9JVE4yS09XYVVMSVQvYUxkZVVucXBkaTdWVzIrS3ljMjlGTDNzN2UzaGk1TFRTaGVXV3B5V2xINFh6bXZXam5pT2lGTjNZV0RpdldJOTJXdWs1Y3QyQzBwM0p6bDlZTjY2V0k1SVYvVnlGODZyMWExN3BINVVNQzBwWC9Ed1hWVTUyNEtzNVlnRFptTDR6R3oxdzgwcDMzUGoxcE12Y2krdGMyY0ZJam1oSDJkV1ZmdWFWTHVMank5ZVR6Z3FPcnFld3YwdnVtLzFLUjQrMmE2RGg1cFhPN1Y5TytzNEtSSlBBRHV4Tmp0akZDQ2svQ2x0RXpnZnpTdGVyU3ZkWlFaZURveXlxeFFndVIxbFhtQmxJLzlQU2ViWnBiT2U4Yml2dDJiRks5WWFLNGVIZTdOTE5hdExQM3FHWUxmTDcxUm9NdkI2WHU5NkozVFd0OUxUb1FNNXptOFlmeGJISUVTUFpYWFcvdG92VFNvK1BxRnhOZXN3WnFqTy9YMDlPdkJnaTlPY0h3N2xsVXVrY3YrZGkwcm5lcWY5OXVYb0tnbE1Nd2FsbDd4L215MG1sUDVwaVZudjNmdVorMTkzeG5wVFlMejNTamVqUExYcE82VHRYYnpYcGZJVWNlSkhtUHNYQUpzYkkrYUw3ZnZzcHBWc09YN3VhZEo5RnZ1VDYzUHhzWkFRM1VNeHlnTHlXdnNrNi9sdWt1NDBmYjh0dG9sREZGYjFaUVE2L21Sa3YxaVc5aTFKNkMvMWFlakFjdlFQVm1VdDZGQjJjbjI2SnpETzRUc2FMY1dlYVRibzdJbjA0WDA4Njk2WHhUbnJrbXpHQ0hpbW1KcEx1TmFQaTcxZitLT2t0ZTVJSzlPclM3NGluZ1BTZkpkMW9JU0Q5WjBtL2hQaEIwbysvTGQzTU1HVXJTVTY4czl5VXpYU08zc3VoVytCaCtKajBveXoyc25acWdwY3pkNWl3cHZSdm1LZlhwWS9QMHllU2ZzZ0hPaGxpd3RMUzdjQlNpUjFhWkZQMzBxK0J0M2ZYYks5aFEyVHIrNHJTYys4ZGZsWENPMmw2cFkrUElzNXBGMXhzNGttYlhWQjZ6MEpXUlJkSCs2QjB3OFZlb3lkZVdsVjg0eGFVTG52WDA4dkV6Tm4rSEpPdSt0ZlQxY1NiS1BMZXd2V2tjL2MxL1l0czRTbEorREhwdW5zRjMwNjlYU3J3N1ZoUWVsNGdITjNRdUhPOGpFay9POGNDK1VvL3BYUit2RzBMU24vWlh4bFh5SW9jNjBQU2hlbGR3dmR6YjRIVzNJNzFwTy8wd0hZcU9JcDh2NDFKVDUyVE5qZjVqeDI0Zm1FOTZXTHJHNy9ic29NNmVoQ0dwSjhzMC9aVjNrOHFuVE9kWDFCNjZIT2diNGI1S1JmdGw1NGZDN292eXZaWnBYdDZKeTRvM1pxZWRPdk1UZHNsUFVoRDBybFd4dlZNRnRTMFAxVU9uUHZXazg0WGRiMERJWFcva0hpTVNMZW03ck1NS0RtdDlKMEhtZ3RLLzNCZzdHaGdPR0xDZ1BUOGFmcDFwZFRFeDQ4ODZuZ3RLRjJjOU9wc2dWRGJPS0NKT1Fha2krMVZyRmkrd3JpSnBmTmEvb3JTaGNyVzI4NmpMWXN5eWZaTGw4U0V0bk02NWoxU0xIK3dYVkc2amMwRFlJOTg2RnVqS0puUUxWMGMxTXJ3N3NPNW4vZnd3RGZrb2o5Z2ZENG96aHlGQVVWTXFCUmxZckNkMG9VblJya2l5RXpPUEZOTEZ6VHpUNVZsQlhkM09tOG96a0J0T09kRFBaa1U5azkvUENwTGtIYXJuWlVmSWhYT3YwLzZJU3YwU09jdmovMWI5dHpma041RzN4N2ViZEloMzRXZkY2dHBEcnJZSzZQVXBkLzRmSlMzYnBYYXJ0T0pOK1NSREJYT3YwbDZtNkV6WjF6MzVsdzlrM1JPMDFXTUZCVTRINCsyMWxNYmI4WHMwdmx2WVZIcDNQVXFLQ2NhT0RVc25iTkxTUjVjVEMrZForcHBWZWxDbkthMTE3ZU5UTlFrU1ZGaVUydFArUXJTT1Z2WlphVUxxd3Z0UENoL2pkTWIzUk45OVFPa29qdjhMc1FTMGsvTzcrdEtmK05NVDk2TlAwVXZMdmluUm05Sm4yNHdWcmJEQ2JHSWRGNHhWQk5KL3hKU2U2VWVvL0JqLzlJLzdEeTBQdnJuSnk1b3BTSVJSWlgwYVFVQUFQelgzaDNVQUFDQVFBeDdZQUQvYW5GQkNOZGFtSUFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQW1tb2VLOUh6aUI1STlFQlhueDhBQUFBQUFBQUFBTEJtQUlaS216V0lueHlPQUFBQUFFbEZUa1N1UW1DQyIsImlzc3VlcnMiOlt7ImlkIjoiOWJlZTRiNWYtMjIwZi00ZTljLTg3YTYtZmE1YWJiNDY5ZTYyOnN0cmluZzpkaWQ6ZXRocjoweEUzOTQ3OTkyOENjNEVmRkU1MDc3NDQ4ODc4MEI5ZjYxNmJkNEI4MzAiLCJyZXZvY2F0aW9uIjp7InR5cGUiOiJiNGIxYjc4Ny05NGQ0LTQ4NmEtYTBhZC04YmNjNzQwNGUzMDY6c3RyaW5nOk5PTkUifSwibmFtZSI6IjVhMTEwNTEwLTYyMzAtNDM5Ny04ZmYyLTEyNDY1ZDgxZGJhMjpzdHJpbmc6U0FNUExFIENMSU5JQyIsImlkZW50aXR5UHJvb2YiOnsidHlwZSI6Ijc0MDk0ODlhLThhNmYtNDJkMC04NDZhLTYzZmIyZTYyOThmYjpzdHJpbmc6RE5TLURJRCIsImxvY2F0aW9uIjoiMDRmNDRkZjEtMGQyMS00M2E5LWI5YmMtNmJjNTRhYjhjYWExOnN0cmluZzpkb25vdHZlcmlmeS50ZXN0aW5nLnZlcmlmeS5nb3Yuc2ciLCJrZXkiOiIwYTBmNTcwYS0xNWQ5LTRjM2EtYmQyYi0xMTM1ZTNhNzU0Njk6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIn19XSwiJHRlbXBsYXRlIjp7Im5hbWUiOiI2ZGRkNGU5Yy1jMWE1LTQ1MTgtYmVjNi0wYzcxMmZkOWY3MzQ6c3RyaW5nOkhFQUxUSF9DRVJUIiwidHlwZSI6ImFhZTYzZTA0LWE1YmEtNDg5My05ZWE5LTk2MGMzYTE4MDdlZjpzdHJpbmc6RU1CRURERURfUkVOREVSRVIiLCJ1cmwiOiJmMThkYjlhNy02NTYyLTQ4MGMtOTFlZi04NDM0NzA3ZjQxOGQ6c3RyaW5nOmh0dHBzOi8vaGVhbHRoY2VydC5yZW5kZXJlci5tb2guZ292LnNnLyJ9fSwic2lnbmF0dXJlIjp7InR5cGUiOiJTSEEzTWVya2xlUHJvb2YiLCJ0YXJnZXRIYXNoIjoiMGFhOGJiM2QyMzJlYTgwMjEwMzAwODExMGZhZDgzNzcxZWEzNjMxMWUxYzU5NjVlZjIyZmRjOWY1ZGRiMzBhZCIsInByb29mIjpbXSwibWVya2xlUm9vdCI6IjBhYThiYjNkMjMyZWE4MDIxMDMwMDgxMTBmYWQ4Mzc3MWVhMzYzMTFlMWM1OTY1ZWYyMmZkYzlmNWRkYjMwYWQifSwicHJvb2YiOlt7InR5cGUiOiJPcGVuQXR0ZXN0YXRpb25TaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjItMDMtMjhUMDI6NTA6MTYuNDQxWiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIiwic2lnbmF0dXJlIjoiMHg1YjY3NTVmZGZiZmJmNzUyNDhhY2M5MWY5YmFjN2RlOWQwYTg0YWUyZDNkNjMxZTQ4YThhMzE3MGQ3NDM3YzJhNWJjMjkxMWY4MDliN2YxY2I2MDY2YjNmOGQ5YjE2MDUzNGRlZGZiNjkyOWM1NTI0MjcxMGM1ZjIyYTA1YzNmNDFiIn1dfQ==",
          "filename": "healthcert.txt",
          "type": "text/open-attestation",
        },
      ],
      "fhirBundle": Object {
        "entry": Array [
          Object {
            "fullUrl": "urn:uuid:ba7b7c8d-c509-4d9d-be4e-f99b6de29e23",
            "resource": Object {
              "birthDate": "1990-01-15",
              "extension": Array [
                Object {
                  "extension": Array [
                    Object {
                      "url": "code",
                      "valueCodeableConcept": Object {
                        "coding": Array [
                          Object {
                            "code": "SG",
                            "system": "urn:iso:std:iso:3166",
                          },
                        ],
                        "text": "Patient Nationality",
                      },
                    },
                  ],
                  "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
                },
              ],
              "gender": "female",
              "identifier": Array [
                Object {
                  "id": "PPN",
                  "type": Object {
                    "coding": Array [
                      Object {
                        "code": "PPN",
                        "display": "Passport Number",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "value": "E7831177G",
                },
                Object {
                  "id": "NRIC-FIN",
                  "value": "S****470G",
                },
              ],
              "name": Array [
                Object {
                  "text": "Tan Chen Chen",
                },
              ],
              "resourceType": "Patient",
            },
          },
          Object {
            "fullUrl": "urn:uuid:7729970e-ab26-469f-b3e5-36a42ec24146",
            "resource": Object {
              "category": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "840539006",
                      "display": "COVID-19",
                      "system": "http://snomed.info/sct",
                    },
                  ],
                },
              ],
              "code": Object {
                "coding": Array [
                  Object {
                    "code": "94531-1",
                    "display": "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
                    "system": "http://loinc.org",
                  },
                ],
              },
              "effectiveDateTime": "2020-09-28T06:15:00Z",
              "identifier": Array [
                Object {
                  "id": "ACSN",
                  "type": Object {
                    "coding": Array [
                      Object {
                        "code": "ACSN",
                        "display": "Accession ID",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "value": "123456789",
                },
              ],
              "performer": Array [
                Object {
                  "reference": "urn:uuid:3dbff0de-d4a4-4e1d-98bf-af7428b8a04b",
                  "type": "Practitioner",
                },
                Object {
                  "id": "LHP",
                  "reference": "urn:uuid:fa2328af-4882-4eaa-8c28-66dab46950f1",
                  "type": "Organization",
                },
                Object {
                  "id": "AL",
                  "reference": "urn:uuid:839a7c54-6b40-41cb-b10d-9295d7e75f77",
                  "type": "Organization",
                },
              ],
              "resourceType": "Observation",
              "specimen": Object {
                "reference": "urn:uuid:0275bfaf-48fb-44e0-80cd-9c504f80e6ae",
                "type": "Specimen",
              },
              "status": "final",
              "valueCodeableConcept": Object {
                "coding": Array [
                  Object {
                    "code": "260385009",
                    "display": "Negative",
                    "system": "http://snomed.info/sct",
                  },
                ],
              },
            },
          },
          Object {
            "fullUrl": "urn:uuid:0275bfaf-48fb-44e0-80cd-9c504f80e6ae",
            "resource": Object {
              "collection": Object {
                "collectedDateTime": "2020-09-27T06:15:00Z",
              },
              "resourceType": "Specimen",
              "type": Object {
                "coding": Array [
                  Object {
                    "code": "258500001",
                    "display": "Nasopharyngeal swab",
                    "system": "http://snomed.info/sct",
                  },
                ],
              },
            },
          },
          Object {
            "fullUrl": "urn:uuid:3dbff0de-d4a4-4e1d-98bf-af7428b8a04b",
            "resource": Object {
              "name": Array [
                Object {
                  "text": "Dr Michael Lim",
                },
              ],
              "qualification": Array [
                Object {
                  "code": Object {
                    "coding": Array [
                      Object {
                        "code": "MCR",
                        "display": "Practitioner Medicare number",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "identifier": Array [
                    Object {
                      "id": "MCR",
                      "value": "123456",
                    },
                  ],
                  "issuer": Object {
                    "reference": "urn:uuid:bc7065ee-42aa-473a-a614-afd8a7b30b1e",
                    "type": "Organization",
                  },
                },
              ],
              "resourceType": "Practitioner",
            },
          },
          Object {
            "fullUrl": "urn:uuid:bc7065ee-42aa-473a-a614-afd8a7b30b1e",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "Ministry of Health, 16 College Road, College of Medicine Building, Singapore 169854",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.moh.gov.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6563259220",
                    },
                  ],
                },
              ],
              "name": "Ministry of Health (MOH)",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "govt",
                      "display": "Government",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                },
              ],
            },
          },
          Object {
            "fullUrl": "urn:uuid:fa2328af-4882-4eaa-8c28-66dab46950f1",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "MacRitchie Hospital, Thomson Road, Singapore 123000",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.macritchieclinic.com.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6561234567",
                    },
                  ],
                },
              ],
              "name": "MacRitchie Medical Clinic",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "prov",
                      "display": "Healthcare Provider",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                  "text": "Licensed Healthcare Provider",
                },
              ],
            },
          },
          Object {
            "fullUrl": "urn:uuid:839a7c54-6b40-41cb-b10d-9295d7e75f77",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "2 Thomson Avenue 4, Singapore 098888",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.macritchielaboratory.com.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6567654321",
                    },
                  ],
                },
              ],
              "name": "MacRitchie Laboratory",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "prov",
                      "display": "Healthcare Provider",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                  "text": "Accredited Laboratory",
                },
              ],
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      },
      "fhirVersion": "4.0.1",
      "id": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
      "issuers": Array [
        Object {
          "id": "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E",
          "identityProof": Object {
            "key": "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E#controller",
            "location": "moh.gov.sg",
            "type": "DNS-DID",
          },
          "name": "Ministry of Health (Singapore)",
          "revocation": Object {
            "type": "NONE",
          },
        },
      ],
      "logo": "data:image/png;base64,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",
      "notarisationMetadata": Object {
        "notarisedOn": "1970-01-01T00:00:01.000Z",
        "passportNumber": "E7831177G",
        "reference": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
        "url": "https://example.com",
      },
      "type": "PCR",
      "validFrom": "2021-08-24T04:22:36.062Z",
      "version": "pdt-healthcert-v2.0",
    }
  `
  );
  expect(createdDocument.proof).toHaveLength(1);
  expect(createdDocument.proof[0].type).toBe("OpenAttestationSignature2018");
  expect(createdDocument.proof[0].verificationMethod).toBe(
    "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E#controller"
  );
  expect(createdDocument.proof[0].signature).toBeTruthy();
});

it("should wrap a v2 document and sign the document with signedEuHealthCert", async () => {
  const parseFhirBundle = fhirHelper.parse(
    sampleDocumentUnWrapped.fhirBundle as R4.IBundle
  );
  const createdDocument = await createNotarizedHealthCert(
    sampleDocument,
    parseFhirBundle,
    uuid,
    storedUrl,
    sampleSignedEuHealthCerts
  );
  const documentData = getData(createdDocument);
  expect(documentData).toMatchInlineSnapshot(
    documentData,
    `
    Object {
      "$template": Object {
        "name": "HEALTH_CERT",
        "type": "EMBEDDED_RENDERER",
        "url": "https://healthcert.renderer.moh.gov.sg/",
      },
      "attachments": Array [
        Object {
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiMmMwMWM2NjQtYTJmOS00ODQ3LTkxNTgtOGNlMzM3ZmUwZmUyOnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiZjk5ZDBjZWQtODM5Ny00Y2Q0LTg1NTgtNjQ1Nzg4YjQ5NThjOnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6IjA1ZTU3NTg1LTdjY2MtNGI2MS1iMjEyLTU4MjgyOGY2ZDYzMzpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiOTBiZDYxYmItOGVmMi00M2M1LWFlZTItYzNiN2Y5NzJjNGEwOnN0cmluZzoyMDIxLTA4LTI0VDA0OjIyOjM2LjA2MloiLCJmaGlyVmVyc2lvbiI6IjllMWMwMjI5LTQ1NTAtNDhhMy04MWU5LWMwZDQ2YzZhN2VhZjpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6ImU2MmU2ZDc3LTM1OWQtNGY5Mi04NTliLTg0ZjFlMGZkYmFjYzpzdHJpbmc6QnVuZGxlIiwidHlwZSI6ImFhOWUwNThiLTQzNDQtNDJjMC05NTBjLWIyZjU1ZTFmMGQyMjpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiZmJlNDY2ZjktYzM4NC00NzcxLWJhODEtYjY5Njk4MGRmZmM0OnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiI1MmQ3MDc4NS0yNGU5LTQ5NzItYmFiYS0zNjY0ZTY3NDc4OTA6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6ImVjNjM1Njc1LTE4M2ItNDdjOS05OWMxLWUzM2E4OTRlNjg1ODpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6IjEwZGM4ZWNmLTI4YjktNGIxYi04YWYyLTA0YmZhOTlhMjNiMzpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiI1OTRkMGI5MS1kYmE0LTRmNWQtODk4Ny1lYzdiNTExNzM3ZDA6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6IjMzZTEzNmM3LTMzZDgtNDkyMi05N2FhLWIzNDQ0YzZmNjk2ZjpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiMTFkYzVmMzQtNDMzOS00NmUwLTg5N2UtYzU4NmFhZWI0OWYxOnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6Ijc1YjA0OTNmLThhMDQtNGNhOS04MzhiLTYxMzM5MDk2Y2IxNzpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjJiYmU3MWIzLTVhNWUtNDE1OC05MmRhLTA3ZDcwNWJlNzIyMzpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6IjBiNTBkNWM2LTEzNDEtNDg3YS1hNmEzLTk5MDRiMDA2NDcwOTpzdHJpbmc6UFBOIiwiZGlzcGxheSI6IjYxOThjYzllLWRhNTItNDBhOC1iN2JhLWRjY2YxZjA4ZmM3ZDpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiI3ODIzNTlmOC1jNDA5LTQyYmYtYTNiYS1kNDk1YTUxMjI1NTU6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiJjODYyOTJlNy1jZDg2LTQ0OGMtYjQzYy1iOWE3OTRjYTVhOTg6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiIyODljOTkzZC0xNWMxLTRmZjItOWQzMi1mZTQwZmJjZWJkOWE6c3RyaW5nOlMzMDAxNDcwRyJ9XSwibmFtZSI6W3sidGV4dCI6Ijk3YjI5ZDJjLTYyZGQtNGIxOS1iOTMzLTkwNTUzMTZjMGZhODpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiZmNhNzAzMzEtOTNhZi00ZmI4LWIyYzAtYTczNWEwZGMzYjJlOnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiI4NGFjYTc2Mi1kOTk0LTQ2NDgtYThmNy03YzA5MjcyMGFjNTA6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiNDc2MjgyNTUtMjllYi00YmEyLThmY2UtNzc1MjNhYTM5OTc3OnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJmZWEzZmQwNi02ZTNiLTRiNzctYWZkMi1lMmY4ZTdiZjU3YmY6c3RyaW5nOk9ic2VydmF0aW9uIiwic3BlY2ltZW4iOnsidHlwZSI6Ijc4OGQ0YWRkLWFkYmYtNDViMS1iZGZjLWQ3OGU5M2Q4YjEyMzpzdHJpbmc6U3BlY2ltZW4iLCJyZWZlcmVuY2UiOiI2Y2Q5NTBmZi03OWNlLTQ5MzctODkwMC1mOTE1YjdhNjU1NTY6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSJ9LCJwZXJmb3JtZXIiOlt7InR5cGUiOiJjZGMzMGMxNC00NDE2LTRkZmItOTAxNi0yNDJhYWFjMTk3ZjE6c3RyaW5nOlByYWN0aXRpb25lciIsInJlZmVyZW5jZSI6IjczYWE1OTdiLTk5ZGItNDA3MS05MDA3LTQ1YjU1MTMxM2Y2YzpzdHJpbmc6dXJuOnV1aWQ6M2RiZmYwZGUtZDRhNC00ZTFkLTk4YmYtYWY3NDI4YjhhMDRiIn0seyJpZCI6Ijg3ZTQ0ZjlmLWI0ZTctNDEyZi05MzcwLTE3Y2VlMDUyNzU3ODpzdHJpbmc6TEhQIiwidHlwZSI6IjgyOWFjZWY0LTY2YWMtNGY5MC1hMTQxLTFjYzFiZTg2MWU1YjpzdHJpbmc6T3JnYW5pemF0aW9uIiwicmVmZXJlbmNlIjoiYjA2Njk5OTgtZWVhMC00N2M2LWE5Y2UtN2E5YjE2N2QyYjg4OnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEifSx7ImlkIjoiMzBjNTI3ZmQtZWNmZS00MWE1LThlMDEtNjc5YjliY2JjYzY5OnN0cmluZzpBTCIsInR5cGUiOiIyNjhmMDE0NC0zMWRlLTQzZTgtYTY5OC1kMjUwNDk2MjhiNDY6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6ImY4ODhkYjMyLTdhODEtNDhhMy05MDU1LTY5ZTJmZTI2MGEyNjpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3In1dLCJpZGVudGlmaWVyIjpbeyJpZCI6IjcwNzE2MDE0LTZiOWYtNGZjZC1hM2RkLTc5NzI0YWEzMTM0MjpzdHJpbmc6QUNTTiIsInR5cGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiJiZmIyM2ZlZi01YzY3LTRiZjctOGFkMC0wMTUwNTE2NjEwMjM6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiJhZTNkOTg5ZC0yMDg2LTQ5NzgtODY0Zi04MzI0ZmZhMjczMmM6c3RyaW5nOkFDU04iLCJkaXNwbGF5IjoiNGEzMTBjMmItOWY3MC00NDA3LWFhZDYtMzVlMzFkZDFjYTZiOnN0cmluZzpBY2Nlc3Npb24gSUQifV19LCJ2YWx1ZSI6IjNlMGY1M2M0LTJlOWQtNGE3OC05NDA5LTgxMDYzZTZkZjgxMzpzdHJpbmc6MTIzNDU2Nzg5In1dLCJjYXRlZ29yeSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiJkMDg4OTI0MC1iNTg3LTRjN2MtYjE3NC00MDFmZGYzZWYyYWI6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiMDMyNGFhNzctM2MxMS00YTVhLWEyOTYtNWQzNmE4NzFiM2JmOnN0cmluZzo4NDA1MzkwMDYiLCJkaXNwbGF5IjoiYjBhYzIxNjItZDM4MC00YWZhLTgwZjAtZjc0MjQ2NDNkNDAyOnN0cmluZzpDT1ZJRC0xOSJ9XX1dLCJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiMjA4ZjZiM2UtNzk3OC00YjhmLTkyZTQtMzJmYjAzN2U0OWJiOnN0cmluZzpodHRwOi8vbG9pbmMub3JnIiwiY29kZSI6ImM5MjRlZjUwLTAzMjUtNGI5Ny04YzdmLWI5MTMxYTU1MjkyYTpzdHJpbmc6OTQ1MzEtMSIsImRpc3BsYXkiOiJkYTMwZGViNi05NDg3LTQ5NjYtOTkwZC1jODVhMWUzZjZiZmM6c3RyaW5nOlNBUlMtQ29WLTIgKENPVklELTE5KSBSTkEgcGFuZWwgLSBSZXNwaXJhdG9yeSBzcGVjaW1lbiBieSBOQUEgd2l0aCBwcm9iZSBkZXRlY3Rpb24ifV19LCJ2YWx1ZUNvZGVhYmxlQ29uY2VwdCI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImYxMTcxMzA0LTM5MmItNDMwNy1hNzBlLTVhZTk2MDJhN2RlZTpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiJhMThkMTNiNC00YWU1LTQ3YzMtODJmYy03ZjM5N2ZmZjFiODE6c3RyaW5nOjI2MDM4NTAwOSIsImRpc3BsYXkiOiI5MWE1NmVjOS1lMmE1LTQ2YTMtYTM0Yy05ZDViOTBmYmFmY2E6c3RyaW5nOk5lZ2F0aXZlIn1dfSwiZWZmZWN0aXZlRGF0ZVRpbWUiOiIxZDc3ZjMxMi03NTgxLTQ3ZDgtOTkyYy04Y2ViOGY5MzVhODQ6c3RyaW5nOjIwMjAtMDktMjhUMDY6MTU6MDBaIiwic3RhdHVzIjoiYmYzYWNjMjEtNGU1Yi00ODg5LTk1MzYtYTZiZGFiZjliNjAxOnN0cmluZzpmaW5hbCJ9fSx7ImZ1bGxVcmwiOiI1NzljZWRmYy1kNTQ5LTQ0N2ItOTdlNy03OTNhNGVmZDc1ZTA6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6ImY4NDlhZGE1LTYyMDMtNDFlYS04NTM1LTRhYmQyYWE5ZDVkYzpzdHJpbmc6U3BlY2ltZW4iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiNjZlMzFiMWQtZmU0Zi00MDYzLWEyM2QtYTQwMDkxZTkyNWFlOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6IjEwY2VkNTZlLTRkNzctNDcwNC1iYThmLWQ4NjIxNTJmZjE1YTpzdHJpbmc6MjU4NTAwMDAxIiwiZGlzcGxheSI6IjVlNzI5MjA0LTgyN2EtNDA2Yy05YmI1LTM5ZTk2YTk4ZDEzZjpzdHJpbmc6TmFzb3BoYXJ5bmdlYWwgc3dhYiJ9XX0sImNvbGxlY3Rpb24iOnsiY29sbGVjdGVkRGF0ZVRpbWUiOiIyYTMxMzI4MS0wNjJjLTQwYmYtYTE5Ny1iMjc3YmRlMTA1MDU6c3RyaW5nOjIwMjAtMDktMjdUMDY6MTU6MDBaIn19fSx7ImZ1bGxVcmwiOiI3MzdlN2QzNy1kNjU4LTRmNzItYjYxMS1hNzI1YmE3OGJkNjU6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjlhYWY2YTI3LTlmNzItNDIwMi05ZmQyLTA3NTRjNWM2MGFkMjpzdHJpbmc6UHJhY3RpdGlvbmVyIiwibmFtZSI6W3sidGV4dCI6ImRlNjQ3ZTZmLWVjNGUtNDIyMi1iMGVhLWE2MmI1YWQ2YzUxYjpzdHJpbmc6RHIgTWljaGFlbCBMaW0ifV0sInF1YWxpZmljYXRpb24iOlt7ImNvZGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiJjZjBkMDViMC1lNWQ5LTQwNDYtYWY3MS03NzM1YmU3NTU3MmM6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiI5MzlmZDE0Ni00YjMyLTQ2YTgtODljMy0zMDhhNjNiMDQwNzE6c3RyaW5nOk1DUiIsImRpc3BsYXkiOiI1NmU0ZjgyYS00ZmRjLTRmMzMtOGIzNC1iOWVkZTEyYjc3OWE6c3RyaW5nOlByYWN0aXRpb25lciBNZWRpY2FyZSBudW1iZXIifV19LCJpZGVudGlmaWVyIjpbeyJpZCI6IjNhOWJkMDU2LWNiMDQtNDNmMy1hZDJiLTQxZjZhMDE5MzQyYzpzdHJpbmc6TUNSIiwidmFsdWUiOiI1Zjk0YWVmOC1jNDcxLTQ4ZjctYjczNi0wNTViODRkMTkzZDA6c3RyaW5nOjEyMzQ1NiJ9XSwiaXNzdWVyIjp7InR5cGUiOiI4NzM4OWE3Zi02ZDFkLTRjOTctOTg2ZC05YjM4Y2VlODBkYTQ6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6IjdlMDdlZDJiLTA5YTgtNDljMS05ZmM1LTkyNmUwMTRmYTRlZTpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIn19XX19LHsiZnVsbFVybCI6ImNkMWZiNjU4LTE4MjMtNGMzOS1hZDJlLWI2NjYyZjk4NmI2MTpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiNjVmMzAxYmItZDEzNi00YTg0LWFlZmItODc3YzJiMWUxOTg4OnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiNTRmMDMwNDAtNzRhNy00ZmU1LWI3NDYtOGJjYWFkMjE4Y2VjOnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGggKE1PSCkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6ImQ0ZWQ2YzBmLTgyNDctNDI3Ny04NGIxLTVjMWIxNjEyNzQ2MzpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJiY2VmMTJjZC04MjljLTQ0MWItYjllYS00YzE0ODZlMjhkYzU6c3RyaW5nOmdvdnQiLCJkaXNwbGF5IjoiMmRiYWVjM2UtOGUyNS00NTAzLTllNTMtMjE4ZmJkMDkzMGMxOnN0cmluZzpHb3Zlcm5tZW50In1dfV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6ImY3N2JmYjM2LWE2OTEtNDU5OS04OTU5LWViYzk2M2NlY2QyNDpzdHJpbmc6dXJsIiwidmFsdWUiOiI0NTc1ZDM0ZC1hZTJlLTRhNDctODFmYS1kMDIxYjc4NTQyN2U6c3RyaW5nOmh0dHBzOi8vd3d3Lm1vaC5nb3Yuc2cifSx7InN5c3RlbSI6IjFkNWNmMzZmLWYyMjAtNGQ2Mi04MDE5LWYxOGZlMGY3MTdmNTpzdHJpbmc6cGhvbmUiLCJ2YWx1ZSI6ImIzOWY5M2E1LTJhYjAtNDFlNC1hMDYyLWFkMTRlYWI1NDQ4YjpzdHJpbmc6KzY1NjMyNTkyMjAifV0sImFkZHJlc3MiOnsidHlwZSI6ImQwOTBlODE3LWVkNzItNDc3Ni1iMWUwLWJkZjNmMWQzNDhjOTpzdHJpbmc6cGh5c2ljYWwiLCJ1c2UiOiJmMzdlOTJiNS03N2JlLTRkMDMtODA3Zi00MzNlYTAwNWE3NDk6c3RyaW5nOndvcmsiLCJ0ZXh0IjoiZjY2YTM1YzMtY2Y5My00ZDE4LWI0MzEtNmFhN2M5ZmI2YTdmOnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGgsIDE2IENvbGxlZ2UgUm9hZCwgQ29sbGVnZSBvZiBNZWRpY2luZSBCdWlsZGluZywgU2luZ2Fwb3JlIDE2OTg1NCJ9fV19fSx7ImZ1bGxVcmwiOiJjNGFlZjM1Mi02NTk1LTQ1MWMtYmIzZi0xYTM2NzJmNWNjNjU6c3RyaW5nOnVybjp1dWlkOmZhMjMyOGFmLTQ4ODItNGVhYS04YzI4LTY2ZGFiNDY5NTBmMSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjQ0ZWRiNWRhLTMyYzctNDk1Mi1iMjgxLTNjODE0ZWNjZDcyYzpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjIwMjY4Y2U0LWFjYWYtNDgwZC1hOTE3LTQ5MWZiZTc1ODg3YjpzdHJpbmc6TWFjUml0Y2hpZSBNZWRpY2FsIENsaW5pYyIsInR5cGUiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiNGZmNjI1MTUtZWZlYS00NGZiLTg4MTUtMjkzMGQzM2ExZjQ2OnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL29yZ2FuaXphdGlvbi10eXBlIiwiY29kZSI6IjFlZTZiM2YyLTc3NjAtNGJkNS1iYjRhLWMxODM0NzdlYjJmZjpzdHJpbmc6cHJvdiIsImRpc3BsYXkiOiIxODM5YzZlMC0wZmIzLTQ5ZjQtOGZhNC03NGNjYTcxYmQ2NTg6c3RyaW5nOkhlYWx0aGNhcmUgUHJvdmlkZXIifV0sInRleHQiOiIxYjliOGExNC1jNWJhLTQ0YzItYWU4Yy03MmJjNTM1NWFkMzU6c3RyaW5nOkxpY2Vuc2VkIEhlYWx0aGNhcmUgUHJvdmlkZXIifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6IjAyZTgyMTJhLTk1MGUtNDI3Mi04ODk2LTg1NGZiNmQ2YjliNzpzdHJpbmc6dXJsIiwidmFsdWUiOiIyNjA0ZjEwYS02YTc0LTRlYTMtYWU4ZC1kMGZkNzc3NjY1OTk6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVjbGluaWMuY29tLnNnIn0seyJzeXN0ZW0iOiIxMjkwYTVmZi01NGUyLTRiYzEtODAwYi0zNWY4YTQ2ZmZiNTI6c3RyaW5nOnBob25lIiwidmFsdWUiOiI4YTYyZWJlMi0xMzlmLTQzZjYtYmZlMC04MzgzNzdiYmQ2NmI6c3RyaW5nOis2NTYxMjM0NTY3In1dLCJhZGRyZXNzIjp7InR5cGUiOiI1ZGM2YmUxYS01ZjU5LTQxNmYtYTZlYS0xNmMwNjM5MDdjZjE6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiODQwZjI0NzMtOTU5OC00NTMwLTkzZjItMzZmZDdlMGU3YjEzOnN0cmluZzp3b3JrIiwidGV4dCI6ImUzNWI4ZWNiLTE3MzItNDRhZC1hOGJlLTIwY2ViNDFjM2E1MjpzdHJpbmc6TWFjUml0Y2hpZSBIb3NwaXRhbCwgVGhvbXNvbiBSb2FkLCBTaW5nYXBvcmUgMTIzMDAwIn19XX19LHsiZnVsbFVybCI6Ijg4NDg3OGExLTcxODYtNGZmYS1hZDNjLTg0M2IxMTU4NDQyMTpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3IiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiZjNmMjY4ZTItYjA4My00M2I1LWJjNjktY2UxYzc1MDE5ZGUyOnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiZmE0ZWU4ZDAtOTc2My00NzQ2LWIwNjYtZjQwZTkwZTE1NjEwOnN0cmluZzpNYWNSaXRjaGllIExhYm9yYXRvcnkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6IjU5M2UzYTUyLWVmM2MtNGQ4Yi05YmRiLWY4ZDhjZmVlMjU0NTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJhODU3MzBjMC01YzY2LTRlNTAtYWM3My0wMWM1YTM4OTZmYjE6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiZjY5NGUwZjMtNzlkMy00ODQ4LThjMzktYmE5OTBmYThlMGVmOnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiMzQxZWRmMTAtZjczYS00NTY4LTkwN2MtMDQxOTM0MjI1YWY0OnN0cmluZzpBY2NyZWRpdGVkIExhYm9yYXRvcnkifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6IjUwZjBjZjk2LTE0ZDMtNDgxOS1hNzY1LTdkNDEzY2ZiMjc1MTpzdHJpbmc6dXJsIiwidmFsdWUiOiI2NDRmMGRjYy0yODk3LTQ4YzEtYjAzMi00MjRmOGQ1ZGVlZWQ6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVsYWJvcmF0b3J5LmNvbS5zZyJ9LHsic3lzdGVtIjoiYWRjZTBhMWQtOGM4Zi00ZDUyLTgzZjUtMWVhYThiMTYyZDIzOnN0cmluZzpwaG9uZSIsInZhbHVlIjoiODExMjg4YjEtNTU1ZS00MzJlLTk0OTktYTdiOTQ0ZTExMmExOnN0cmluZzorNjU2NzY1NDMyMSJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiZGIwNmNhN2MtNWYwNi00ZGVkLTliODAtNWUzZWNhZDY4M2MwOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6IjhhYjdlMWQ1LTE2NzItNDEyYS04MmUyLWZlYzc4OWZmNTZlZjpzdHJpbmc6d29yayIsInRleHQiOiI4MWU1MWIwNi1jN2ZlLTRiMDYtODFlMS0zNDM1MzM2NTUwZTY6c3RyaW5nOjIgVGhvbXNvbiBBdmVudWUgNCwgU2luZ2Fwb3JlIDA5ODg4OCJ9fV19fV19LCJsb2dvIjoiN2MwYjIzMTktNDYxOS00N2EwLWJkOTYtYWMzOTA0MjgwYTIyOnN0cmluZzpkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWZRQUFBRElDQU1BQUFBcHgrUGFBQUFBTTFCTVZFVUFBQURNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16ZUNtaUFBQUFBRUhSU1RsTUFRTCtBN3hBZ24yRFAzekJ3cjFDUEVsK0kvUUFBQndkSlJFRlVlTnJzbmQxMjJ5b1FSdmtISVNITit6L3R5VWs5b1RFQ1ExYlRCYzIzYnlOczBCNUdJREFSQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWsrSWsrSWR4NGc1TjRCOUdRL3JQQTlKL0lQZlNnd0wvTUVFQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR3UDVaUG9QNXI3RkpLQWY3Y3VmQmloUE5Ta1g1aGxBOXUrRHNQN2RYL0pLMVAyVlBpU0lvZWJFckx3Vmg1WngrOEMxWTIyWXRQMEZwZjZoZGVhK21xMVdsaXhmZWo2UmNEeGowOXN3WGJiZUJRcGlqdWcyMGFqL1NFOGJ2bzVoRXVhdkF1U0twUWZKeFRHOTFnVXJDVjZqU1FFMG9Qa2U0d3VrZTcwNUVxcExOV3h0TXRTazRqdlhHbGQrdExseHZWTU5uYWtEN21FbmRZVFZXU25WODYwV1VYbDM0Uk15N0JlbXB5R3pON3BBYm1YRUE2YmZ2SzB1MzJ1VEZLS1ZNMHIwWXcxTVRjRnZwOGlWTFBEMCs5Z0hReSs3clNmM2VlanAySHVGY3NtbGRpRXowRnpLWGZTUnczcWUwOFhxZDlkUDZRS09Obmt1NGxHM05TYi9SQnRLdEt0MXR0ZEJKaVliMlZJN2JyYzd0YzhJWW90SnpIVUIwYytPK1QzclRRdUxLc1pScXB6a1RTN2RaSTR2bytxSm5kRUdPOEV6ZWN5amFjNi9JVE4yS09XYVVMSVQvYUxkZVVucXBkaTdWVzIrS3ljMjlGTDNzN2UzaGk1TFRTaGVXV3B5V2xINFh6bXZXam5pT2lGTjNZV0RpdldJOTJXdWs1Y3QyQzBwM0p6bDlZTjY2V0k1SVYvVnlGODZyMWExN3BINVVNQzBwWC9Ed1hWVTUyNEtzNVlnRFptTDR6R3oxdzgwcDMzUGoxcE12Y2krdGMyY0ZJam1oSDJkV1ZmdWFWTHVMank5ZVR6Z3FPcnFld3YwdnVtLzFLUjQrMmE2RGg1cFhPN1Y5TytzNEtSSlBBRHV4Tmp0akZDQ2svQ2x0RXpnZnpTdGVyU3ZkWlFaZURveXlxeFFndVIxbFhtQmxJLzlQU2ViWnBiT2U4Yml2dDJiRks5WWFLNGVIZTdOTE5hdExQM3FHWUxmTDcxUm9NdkI2WHU5NkozVFd0OUxUb1FNNXptOFlmeGJISUVTUFpYWFcvdG92VFNvK1BxRnhOZXN3WnFqTy9YMDlPdkJnaTlPY0h3N2xsVXVrY3YrZGkwcm5lcWY5OXVYb0tnbE1Nd2FsbDd4L215MG1sUDVwaVZudjNmdVorMTkzeG5wVFlMejNTamVqUExYcE82VHRYYnpYcGZJVWNlSkhtUHNYQUpzYkkrYUw3ZnZzcHBWc09YN3VhZEo5RnZ1VDYzUHhzWkFRM1VNeHlnTHlXdnNrNi9sdWt1NDBmYjh0dG9sREZGYjFaUVE2L21Sa3YxaVc5aTFKNkMvMWFlakFjdlFQVm1VdDZGQjJjbjI2SnpETzRUc2FMY1dlYVRibzdJbjA0WDA4Njk2WHhUbnJrbXpHQ0hpbW1KcEx1TmFQaTcxZitLT2t0ZTVJSzlPclM3NGluZ1BTZkpkMW9JU0Q5WjBtL2hQaEIwbysvTGQzTU1HVXJTVTY4czl5VXpYU08zc3VoVytCaCtKajBveXoyc25acWdwY3pkNWl3cHZSdm1LZlhwWS9QMHllU2ZzZ0hPaGxpd3RMUzdjQlNpUjFhWkZQMzBxK0J0M2ZYYks5aFEyVHIrNHJTYys4ZGZsWENPMmw2cFkrUElzNXBGMXhzNGttYlhWQjZ6MEpXUlJkSCs2QjB3OFZlb3lkZVdsVjg0eGFVTG52WDA4dkV6Tm4rSEpPdSt0ZlQxY1NiS1BMZXd2V2tjL2MxL1l0czRTbEorREhwdW5zRjMwNjlYU3J3N1ZoUWVsNGdITjNRdUhPOGpFay9POGNDK1VvL3BYUit2RzBMU24vWlh4bFh5SW9jNjBQU2hlbGR3dmR6YjRIVzNJNzFwTy8wd0hZcU9JcDh2NDFKVDUyVE5qZjVqeDI0Zm1FOTZXTHJHNy9ic29NNmVoQ0dwSjhzMC9aVjNrOHFuVE9kWDFCNjZIT2diNGI1S1JmdGw1NGZDN292eXZaWnBYdDZKeTRvM1pxZWRPdk1UZHNsUFVoRDBybFd4dlZNRnRTMFAxVU9uUHZXazg0WGRiMERJWFcva0hpTVNMZW03ck1NS0RtdDlKMEhtZ3RLLzNCZzdHaGdPR0xDZ1BUOGFmcDFwZFRFeDQ4ODZuZ3RLRjJjOU9wc2dWRGJPS0NKT1Fha2krMVZyRmkrd3JpSnBmTmEvb3JTaGNyVzI4NmpMWXN5eWZaTGw4U0V0bk02NWoxU0xIK3dYVkc2amMwRFlJOTg2RnVqS0puUUxWMGMxTXJ3N3NPNW4vZnd3RGZrb2o5Z2ZENG96aHlGQVVWTXFCUmxZckNkMG9VblJya2l5RXpPUEZOTEZ6VHpUNVZsQlhkM09tOG96a0J0T09kRFBaa1U5azkvUENwTGtIYXJuWlVmSWhYT3YwLzZJU3YwU09jdmovMWI5dHpma041RzN4N2ViZEloMzRXZkY2dHBEcnJZSzZQVXBkLzRmSlMzYnBYYXJ0T0pOK1NSREJYT3YwbDZtNkV6WjF6MzVsdzlrM1JPMDFXTUZCVTRINCsyMWxNYmI4WHMwdmx2WVZIcDNQVXFLQ2NhT0RVc25iTkxTUjVjVEMrZForcHBWZWxDbkthMTE3ZU5UTlFrU1ZGaVUydFArUXJTT1Z2WlphVUxxd3Z0UENoL2pkTWIzUk45OVFPa29qdjhMc1FTMGsvTzcrdEtmK05NVDk2TlAwVXZMdmluUm05Sm4yNHdWcmJEQ2JHSWRGNHhWQk5KL3hKU2U2VWVvL0JqLzlJLzdEeTBQdnJuSnk1b3BTSVJSWlgwYVFVQUFQelgzaDNVQUFDQVFBeDdZQUQvYW5GQkNOZGFtSUFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQW1tb2VLOUh6aUI1STlFQlhueDhBQUFBQUFBQUFBTEJtQUlaS216V0lueHlPQUFBQUFFbEZUa1N1UW1DQyIsImlzc3VlcnMiOlt7ImlkIjoiOWJlZTRiNWYtMjIwZi00ZTljLTg3YTYtZmE1YWJiNDY5ZTYyOnN0cmluZzpkaWQ6ZXRocjoweEUzOTQ3OTkyOENjNEVmRkU1MDc3NDQ4ODc4MEI5ZjYxNmJkNEI4MzAiLCJyZXZvY2F0aW9uIjp7InR5cGUiOiJiNGIxYjc4Ny05NGQ0LTQ4NmEtYTBhZC04YmNjNzQwNGUzMDY6c3RyaW5nOk5PTkUifSwibmFtZSI6IjVhMTEwNTEwLTYyMzAtNDM5Ny04ZmYyLTEyNDY1ZDgxZGJhMjpzdHJpbmc6U0FNUExFIENMSU5JQyIsImlkZW50aXR5UHJvb2YiOnsidHlwZSI6Ijc0MDk0ODlhLThhNmYtNDJkMC04NDZhLTYzZmIyZTYyOThmYjpzdHJpbmc6RE5TLURJRCIsImxvY2F0aW9uIjoiMDRmNDRkZjEtMGQyMS00M2E5LWI5YmMtNmJjNTRhYjhjYWExOnN0cmluZzpkb25vdHZlcmlmeS50ZXN0aW5nLnZlcmlmeS5nb3Yuc2ciLCJrZXkiOiIwYTBmNTcwYS0xNWQ5LTRjM2EtYmQyYi0xMTM1ZTNhNzU0Njk6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIn19XSwiJHRlbXBsYXRlIjp7Im5hbWUiOiI2ZGRkNGU5Yy1jMWE1LTQ1MTgtYmVjNi0wYzcxMmZkOWY3MzQ6c3RyaW5nOkhFQUxUSF9DRVJUIiwidHlwZSI6ImFhZTYzZTA0LWE1YmEtNDg5My05ZWE5LTk2MGMzYTE4MDdlZjpzdHJpbmc6RU1CRURERURfUkVOREVSRVIiLCJ1cmwiOiJmMThkYjlhNy02NTYyLTQ4MGMtOTFlZi04NDM0NzA3ZjQxOGQ6c3RyaW5nOmh0dHBzOi8vaGVhbHRoY2VydC5yZW5kZXJlci5tb2guZ292LnNnLyJ9fSwic2lnbmF0dXJlIjp7InR5cGUiOiJTSEEzTWVya2xlUHJvb2YiLCJ0YXJnZXRIYXNoIjoiMGFhOGJiM2QyMzJlYTgwMjEwMzAwODExMGZhZDgzNzcxZWEzNjMxMWUxYzU5NjVlZjIyZmRjOWY1ZGRiMzBhZCIsInByb29mIjpbXSwibWVya2xlUm9vdCI6IjBhYThiYjNkMjMyZWE4MDIxMDMwMDgxMTBmYWQ4Mzc3MWVhMzYzMTFlMWM1OTY1ZWYyMmZkYzlmNWRkYjMwYWQifSwicHJvb2YiOlt7InR5cGUiOiJPcGVuQXR0ZXN0YXRpb25TaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjItMDMtMjhUMDI6NTA6MTYuNDQxWiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIiwic2lnbmF0dXJlIjoiMHg1YjY3NTVmZGZiZmJmNzUyNDhhY2M5MWY5YmFjN2RlOWQwYTg0YWUyZDNkNjMxZTQ4YThhMzE3MGQ3NDM3YzJhNWJjMjkxMWY4MDliN2YxY2I2MDY2YjNmOGQ5YjE2MDUzNGRlZGZiNjkyOWM1NTI0MjcxMGM1ZjIyYTA1YzNmNDFiIn1dfQ==",
          "filename": "healthcert.txt",
          "type": "text/open-attestation",
        },
      ],
      "fhirBundle": Object {
        "entry": Array [
          Object {
            "fullUrl": "urn:uuid:ba7b7c8d-c509-4d9d-be4e-f99b6de29e23",
            "resource": Object {
              "birthDate": "1990-01-15",
              "extension": Array [
                Object {
                  "extension": Array [
                    Object {
                      "url": "code",
                      "valueCodeableConcept": Object {
                        "coding": Array [
                          Object {
                            "code": "SG",
                            "system": "urn:iso:std:iso:3166",
                          },
                        ],
                        "text": "Patient Nationality",
                      },
                    },
                  ],
                  "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
                },
              ],
              "gender": "female",
              "identifier": Array [
                Object {
                  "id": "PPN",
                  "type": Object {
                    "coding": Array [
                      Object {
                        "code": "PPN",
                        "display": "Passport Number",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "value": "E7831177G",
                },
                Object {
                  "id": "NRIC-FIN",
                  "value": "S****470G",
                },
              ],
              "name": Array [
                Object {
                  "text": "Tan Chen Chen",
                },
              ],
              "resourceType": "Patient",
            },
          },
          Object {
            "fullUrl": "urn:uuid:7729970e-ab26-469f-b3e5-36a42ec24146",
            "resource": Object {
              "category": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "840539006",
                      "display": "COVID-19",
                      "system": "http://snomed.info/sct",
                    },
                  ],
                },
              ],
              "code": Object {
                "coding": Array [
                  Object {
                    "code": "94531-1",
                    "display": "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection",
                    "system": "http://loinc.org",
                  },
                ],
              },
              "effectiveDateTime": "2020-09-28T06:15:00Z",
              "identifier": Array [
                Object {
                  "id": "ACSN",
                  "type": Object {
                    "coding": Array [
                      Object {
                        "code": "ACSN",
                        "display": "Accession ID",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "value": "123456789",
                },
              ],
              "performer": Array [
                Object {
                  "reference": "urn:uuid:3dbff0de-d4a4-4e1d-98bf-af7428b8a04b",
                  "type": "Practitioner",
                },
                Object {
                  "id": "LHP",
                  "reference": "urn:uuid:fa2328af-4882-4eaa-8c28-66dab46950f1",
                  "type": "Organization",
                },
                Object {
                  "id": "AL",
                  "reference": "urn:uuid:839a7c54-6b40-41cb-b10d-9295d7e75f77",
                  "type": "Organization",
                },
              ],
              "resourceType": "Observation",
              "specimen": Object {
                "reference": "urn:uuid:0275bfaf-48fb-44e0-80cd-9c504f80e6ae",
                "type": "Specimen",
              },
              "status": "final",
              "valueCodeableConcept": Object {
                "coding": Array [
                  Object {
                    "code": "260385009",
                    "display": "Negative",
                    "system": "http://snomed.info/sct",
                  },
                ],
              },
            },
          },
          Object {
            "fullUrl": "urn:uuid:0275bfaf-48fb-44e0-80cd-9c504f80e6ae",
            "resource": Object {
              "collection": Object {
                "collectedDateTime": "2020-09-27T06:15:00Z",
              },
              "resourceType": "Specimen",
              "type": Object {
                "coding": Array [
                  Object {
                    "code": "258500001",
                    "display": "Nasopharyngeal swab",
                    "system": "http://snomed.info/sct",
                  },
                ],
              },
            },
          },
          Object {
            "fullUrl": "urn:uuid:3dbff0de-d4a4-4e1d-98bf-af7428b8a04b",
            "resource": Object {
              "name": Array [
                Object {
                  "text": "Dr Michael Lim",
                },
              ],
              "qualification": Array [
                Object {
                  "code": Object {
                    "coding": Array [
                      Object {
                        "code": "MCR",
                        "display": "Practitioner Medicare number",
                        "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                      },
                    ],
                  },
                  "identifier": Array [
                    Object {
                      "id": "MCR",
                      "value": "123456",
                    },
                  ],
                  "issuer": Object {
                    "reference": "urn:uuid:bc7065ee-42aa-473a-a614-afd8a7b30b1e",
                    "type": "Organization",
                  },
                },
              ],
              "resourceType": "Practitioner",
            },
          },
          Object {
            "fullUrl": "urn:uuid:bc7065ee-42aa-473a-a614-afd8a7b30b1e",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "Ministry of Health, 16 College Road, College of Medicine Building, Singapore 169854",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.moh.gov.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6563259220",
                    },
                  ],
                },
              ],
              "name": "Ministry of Health (MOH)",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "govt",
                      "display": "Government",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                },
              ],
            },
          },
          Object {
            "fullUrl": "urn:uuid:fa2328af-4882-4eaa-8c28-66dab46950f1",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "MacRitchie Hospital, Thomson Road, Singapore 123000",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.macritchieclinic.com.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6561234567",
                    },
                  ],
                },
              ],
              "name": "MacRitchie Medical Clinic",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "prov",
                      "display": "Healthcare Provider",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                  "text": "Licensed Healthcare Provider",
                },
              ],
            },
          },
          Object {
            "fullUrl": "urn:uuid:839a7c54-6b40-41cb-b10d-9295d7e75f77",
            "resource": Object {
              "contact": Array [
                Object {
                  "address": Object {
                    "text": "2 Thomson Avenue 4, Singapore 098888",
                    "type": "physical",
                    "use": "work",
                  },
                  "telecom": Array [
                    Object {
                      "system": "url",
                      "value": "https://www.macritchielaboratory.com.sg",
                    },
                    Object {
                      "system": "phone",
                      "value": "+6567654321",
                    },
                  ],
                },
              ],
              "name": "MacRitchie Laboratory",
              "resourceType": "Organization",
              "type": Array [
                Object {
                  "coding": Array [
                    Object {
                      "code": "prov",
                      "display": "Healthcare Provider",
                      "system": "http://terminology.hl7.org/CodeSystem/organization-type",
                    },
                  ],
                  "text": "Accredited Laboratory",
                },
              ],
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      },
      "fhirVersion": "4.0.1",
      "id": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
      "issuers": Array [
        Object {
          "id": "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E",
          "identityProof": Object {
            "key": "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E#controller",
            "location": "moh.gov.sg",
            "type": "DNS-DID",
          },
          "name": "Ministry of Health (Singapore)",
          "revocation": Object {
            "type": "NONE",
          },
        },
      ],
      "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAADICAMAAAApx+PaAAAAM1BMVEUAAADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzeCmiAAAAAEHRSTlMAQL+A7xAgn2DP3zBwr1CPEl+I/QAABwdJREFUeNrsnd122yoQRvkHISHN+z/tyUk9oTECQ1bTBc23byNs0B5GIDARAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAk+Ik+Idx4g5N4B9GQ/rPA9J/IPfSgwL/MEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwP5ZPoP5r7FJKAf7cufBihPNSkX5hlA9u+DsP7dX/JK1P2VPiSIoebErLwVh5Zx+8C1Y22YtP0Fpf6hdea+mq1Wlixfej6RcDxj09swXbbeBQpijug20aj/SE8bvo5hEuavAuSKpQfJxTG91gUrCV6jSQE0oPke4wuke705EqpLNWxtMtSk4jvXGld+tLlxvVMNnakD7mEndYTVWSnV860WUXl34RMy7BempyGzN7pAbmXEA6bfvK0u32uTFKKVM0r0Yw1MTcFvp8iVLPD0+9gHQy+7rSf3eejp2HuFcsmldiEz0FzKXfSRw3qe08Xqd9dP6QKONnku4lG3NSb/RBtKtKt1ttdBJiYb2VI7brc7tc8IYotJzHUB0c+O+T3rTQuLKsZRqpzkTS7dZI4vo+qJndEGO8Ezecyjac6/ITN2KOWaULIT/aLdeUnqpdi7VW2+Kyc29FL3s7e3hi5LTSheWWpyWlH4XzmvWjniOiFN3YWDivWI92Wuk5ct2C0p3Jzl9YN66WI5IV/VyF86r1a17pH5UMC0pX/DwXVU524Ks5YgDZmL4zGz1w80p33Pj1pMvci+tc2cFIjmhH2dWVfuaVLuLjy9eTzgqOrqewv0vum/1KR4+2a6Dh5pXO7V9O+s4KRJPADuxNjtjFCCk/CltEzgfzSterSvdZQZeDoyyqxQguR1lXmBlI/9PSebZpbOe8bivt2bFK9YaK4eHe7NLNatLP3qGYLfL71RoMvB6Xu96J3TWt9LToQM5zm8YfxbHIESPZXXW/tovTSo+PqFxNeswZqjO/X09OvBgi9OcHw7llUukcv+di0rneqf99uXoKglMMwall7x/my0mlP5piVnv3fuZ+193xnpTYLz3SjejPLXpO6TtXbzXpfIUceJHmPsXAJsbI+aL7fvsppVsOX7uadJ9FvuT63PxsZAQ3UMxygLyWvsk6/luku40fb8ttolDFFb1ZQQ6/mRkv1iW9i1J6C/1aejAcvQPVmUt6FB2cn26JzDO4TsaLcWeaTbo7In04X08696XxTnrkmzGCHimmJpLuNaPi71f+KOkte5IK9OrS74ingPSfJd1oISD9Z0m/hPhB0o+/Ld3MMGUrSU68s9yUzXSO3suhW+Bh+Jj0oyz2snZqgpczd5iwpvRvmKfXpY/P0yeSfsgHOhliwtLS7cBSiR1aZFP30q+Bt3fXbK9hQ2Tr+4rSc+8dflXCO2l6pY+PIs5pF1xs4kmbXVB6z0JWRRdH+6B0w8VeoydeWlV84xaULnvX08vEzNn+HJOu+tfT1cSbKPLewvWkc/c1/Yts4SlJ+DHpunsF3069XSrw7VhQel4gHN3QuHO8jEk/O8cC+Uo/pXR+vG0LSn/ZXxlXyIoc60PSheldwvdzb4HW3I71pO/0wHYqOIp8v41JT52TNjf5jx24fmE96WLrG7/bsoM6ehCGpJ8s0/ZV3k8qnTOdX1B66HOgb4b5KRftl54fC7ovyvZZpXt6Jy4o3ZqedOvMTdslPUhD0rlWxvVMFtS0P1UOnPvWk84Xdb0DIXW/kHiMSLem7rMMKDmt9J0HmgtK/3Bg7GhgOGLCgPT8afp1pdTEx4886ngtKF2c9OpsgVDbOKCJOQaki+1VrFi+wriJpfNa/orShcrW286jLYsyyfZLl8SEtnM65j1SLH+wXVG6jc0DYI986FujKJnQLV0c1Mrw7sO5n/fwwDfkoj9gfD4ozhyFAUVMqBRlYrCd0oUnRrkiyEzOPFNLFzTzT5VlBXd3Om8ozkBtOOdDPZkU9k9/PCpLkHarnZUfIhXOv0/6ISv0SOcvj/1b9tzfkN5G3x7ebdIh34WfF6tpDrrYK6PUpd/4fJS3bpXartOJN+SRDBXOv0l6m6EzZ1z35lw9k3RO01WMFBU4H4+21lMbb8Xs0vlvYVHp3PUqKCcaODUsnbNLSR5cTC+dZ+ppVelCnKa117eNTNQkSVFiU2tP+QrSOVvZZaULqwvtPCh/jdMb3RN99QOkojv8LsQS0k/O7+tKf+NMT96NP0UvLvinRm9Jn24wVrbDCbGIdF4xVBNJ/xJSe6Ueo/Bj/9I/7Dy0PvrnJy5opSIRRZX0aQUAAPzX3h3UAACAQAx7YAD/anFBCNdamIABAAAAAAAAAAAAAAAAAAAAAAAAAADAmmoeK9HziB5I9EBXnx8AAAAAAAAAALBmAIZKmzWInxyOAAAAAElFTkSuQmCC",
      "notarisationMetadata": Object {
        "notarisedOn": "1970-01-01T00:00:01.000Z",
        "passportNumber": "E7831177G",
        "reference": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
        "signedEuHealthCerts": Array [
          Object {
            "appleCovidCardUrl": "https://redirect.health.apple.com/EU-DCC/#abcde",
            "expiryDateTime": "2022-12-17T01:27:50.263Z",
            "qr": "HC1:abcde",
            "type": "PCR",
          },
        ],
        "url": "https://example.com",
      },
      "type": "PCR",
      "validFrom": "2021-08-24T04:22:36.062Z",
      "version": "pdt-healthcert-v2.0",
    }
  `
  );
  expect(createdDocument.proof).toHaveLength(1);
  expect(createdDocument.proof[0].type).toBe("OpenAttestationSignature2018");
  expect(createdDocument.proof[0].verificationMethod).toBe(
    "did:ethr:0x174D34BA87e88f58902b8fec59120AcC0B94743E#controller"
  );
  expect(createdDocument.proof[0].signature).toBeTruthy();
});
