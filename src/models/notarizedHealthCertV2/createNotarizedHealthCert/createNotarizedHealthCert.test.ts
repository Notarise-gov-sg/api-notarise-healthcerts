import { getData } from "@govtechsg/open-attestation";
import { R4 } from "@ahryman40k/ts-fhir-types";
import { EuHealthCertQr } from "src/types";
import fhirHelper from "../../fhir";
import { createNotarizedHealthCert } from "./createNotarizedHealthCert";
import exampleHealthcertUnWrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_unwrapped.json";
import exampleHealthcertWrapped from "../../../../test/fixtures/v2/pdt_pcr_with_nric_wrapped.json";
import { mockDate, unmockDate } from "../../../../test/utils";

const sampleDocument = exampleHealthcertWrapped as any;
const sampleDocumentUnWrapped = exampleHealthcertUnWrapped as any;
const uuid = "e35f5d2a-4198-4f8f-96dc-d1afe0b67119";
const storedUrl = "https://example.com";
const sampleEuHealthCertQr: EuHealthCertQr = {
  qrData: "HC1:abcde",
};

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
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiNDhmMzlmNjAtNGIyYS00MGFkLThkZjAtMTJhMTdhZWYwOTY3OnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiZmI4OGQyZjMtMmQ3YS00NzljLTk1NDEtMmUxZjY1NmZiZjVlOnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6ImQ4Y2RhYzBiLWI2ZmItNGM3My1iMzM2LTM5Mzc5ZGY3ODk2NzpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiMWY5OWFlY2EtYzYwZS00NzY5LWI3OGYtMWI1MmE0NmRiZGFhOnN0cmluZzoyMDIxLTA4LTI0VDA0OjIyOjM2LjA2MloiLCJmaGlyVmVyc2lvbiI6IjVlZTVmMmY1LTM0MjQtNGMyZi04MDQ5LWFjNzgyOTQ5NTgzMTpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6ImY3ODY0ZmQxLTljNjMtNDE3Yi04ZjBkLWNhNzhmZTAxYWNjOTpzdHJpbmc6QnVuZGxlIiwidHlwZSI6IjU1OWZlMWI0LTdmZWUtNGI1Ny05YWZhLTQwNDYwZWFlMWRlNjpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiODJiYWMyNWYtZWQ3NC00N2JjLWE2ZDItOWU3YTdkNmIyZjljOnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIxODE0MTg2Ni05ZDcxLTQzN2EtYTg2ZS05NDkxNmRiODg3YmI6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6IjFiMWNkNGFlLWY0YTMtNDM2Zi04ODE1LTg4MWQ3YTNjMzhmODpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6IjIwOGU3YzQyLTZlNjctNDFlOS04OTZiLTA3ZGY2MWVlNGZjYzpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiIwMWUzODdmYS1kZDFlLTQ2YzAtOWY5YS1kZjhjZjc2YzcxNjQ6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6IjAwMWIwOGY4LWU4ZDgtNGNmZi1hOTY2LWU1ZTY5ODFkYmViYTpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiZjNjNzU1YTMtNDk1NS00NTc4LThmZjgtOGQzMzM1YzY5NmU4OnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6IjA0ZjRiMmU1LTUzYWYtNGE2MC1hNTg5LThmNTk2ZDBjNTk5ZjpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImU5YTZjMzg2LWIyYjAtNDBhMy1hNWE1LTlhZGE4ZWNmMDE1NTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6IjdiZWU0MDg5LWRjZDItNDdiYy1iMjc0LTA4YmQ2ZDhmNzBjYjpzdHJpbmc6UFBOIiwiZGlzcGxheSI6ImMxZmUwMzczLTZjZDItNGZhNS04NTI5LTliMmY5Nzk1NTZiNTpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiJhMTc4NmM5NC0yYzRmLTQzMDctYWFmOS0xZjhlOTQ3MmZiOWY6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiI2NTBlOWFjMS0yODBlLTQ5MjgtODEzYi1hOTU5MjAwYzk1MDU6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiI1NWM3YzE4Ny0xYTY3LTRiNmQtYmExNC02MGM2NGZhMjcyNGY6c3RyaW5nOlM5MDk4OTg5WiJ9XSwibmFtZSI6W3sidGV4dCI6ImY3NzUyYjQ0LWRkZjEtNGM5ZC05NjNjLWQyNDhhY2Y2ZGQ3MjpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiZDcxZmNiN2EtZWE3Yy00YzczLWI1MjQtY2Y1Nzc3MGM2N2I5OnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiI5ZWI2MDFmYi1kMTMzLTQzZmYtYjZmZC1lMmIzZjI2ZDQ1YjI6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiYmY3MjQ5ZTItM2QyYS00MTEyLWE0YzctZGI0ODBkNzQxZWZmOnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJkM2MwZmFmMy1iNDFhLTQzYzAtOWUzNS0wMzA4NWQwNGUyZGQ6c3RyaW5nOk9ic2VydmF0aW9uIiwic3BlY2ltZW4iOnsidHlwZSI6ImNhZjc4MmMwLWRjNmYtNDRhNC1iYjY4LTU0ODk3MWJjMDlkNjpzdHJpbmc6U3BlY2ltZW4iLCJyZWZlcmVuY2UiOiJmNGM2NWUyMy1jNmZkLTQxNzgtOTk4NS1kMDhkY2FkM2U4NDA6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSJ9LCJwZXJmb3JtZXIiOlt7InR5cGUiOiJmY2JiODVjZS0wYzExLTQyZGMtODZhNi04ZDJkNWU5YTkwZjE6c3RyaW5nOlByYWN0aXRpb25lciIsInJlZmVyZW5jZSI6ImJkMGQwODQ4LTNiYWMtNDBiYy05MGE2LTQyMWQyNTQ1MDc0ZjpzdHJpbmc6dXJuOnV1aWQ6M2RiZmYwZGUtZDRhNC00ZTFkLTk4YmYtYWY3NDI4YjhhMDRiIn0seyJpZCI6IjY1YmVlZTMyLWJkYWItNGYyNC04MjgxLTM2YmRiZjllYTk0ZTpzdHJpbmc6TEhQIiwidHlwZSI6ImI4NmQ2ZTY3LTljMTUtNGY0NS1hNjk0LTdlMjJhNzRkZjE2MjpzdHJpbmc6T3JnYW5pemF0aW9uIiwicmVmZXJlbmNlIjoiOGQ2Njg5NDgtMDNkYS00OGI3LWFkMDMtOTc2ZjMxZmViMGVjOnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEifSx7ImlkIjoiYWM1MjEwNzMtNGZmNy00ZTQwLTk3YzItZjk1MWZmNTA4OTIxOnN0cmluZzpBTCIsInR5cGUiOiIzMTUxOWE1MS0wNzA0LTQzMzEtYWE2Yy0yNDE2ODE3ZTZjZTY6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6IjZjN2VjMjA1LWI4MzMtNDQ4NS05NTgzLTI3ZTZhN2M4ZjRmMTpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3In1dLCJpZGVudGlmaWVyIjpbeyJpZCI6ImJlNWVkZWIxLTRlODktNDU5MC04NzlmLTQxZGI5MmI2MzViNDpzdHJpbmc6QUNTTiIsInR5cGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiJiMmJmNDkyMi00ZTA2LTQyMDItYjA3OC0wZTMxZTEyOGU4YzI6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiJiOTJiODE2Mi1hNDc2LTRjODAtODJhYy04NDIwMGUzYzY0MzU6c3RyaW5nOkFDU04iLCJkaXNwbGF5IjoiNTAxNTJiZjEtN2ZiMS00ZDNhLTk3N2MtOGI2NDkxZGFmMDUzOnN0cmluZzpBY2Nlc3Npb24gSUQifV19LCJ2YWx1ZSI6IjQxMDFmNGY2LTJlYTYtNDllYi1hYjM0LTBjNThjN2UyYmY0ZjpzdHJpbmc6MTIzNDU2Nzg5In1dLCJjYXRlZ29yeSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiI4YjYwZDI2YS1mMTg4LTRiZjYtYjJhMC03NmQzMGU2NDIwY2U6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiNTljZDE3NTYtY2FlMi00ZjJiLWIxMTAtOWFiZTAxMGVjM2E4OnN0cmluZzo4NDA1MzkwMDYiLCJkaXNwbGF5IjoiOGE5MjA0MzctM2ExZi00OGIzLWE4YTUtYTk5Mzk5MWMwYzVhOnN0cmluZzpDT1ZJRC0xOSJ9XX1dLCJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiNjZiYWU0YzItNjMwZC00YTU2LTllY2MtOTg3NzllOWRjNDVhOnN0cmluZzpodHRwOi8vbG9pbmMub3JnIiwiY29kZSI6Ijk0YTM2OTRmLWJlNzctNGMyYi05NDRhLTY4NGFkYzIxZGM3MzpzdHJpbmc6OTQ1MzEtMSIsImRpc3BsYXkiOiI2MTdhMTJiYS01ODlkLTRmNzYtOTBhYy1iMjdiMWUxOTc2MDY6c3RyaW5nOlNBUlMtQ29WLTIgKENPVklELTE5KSBSTkEgcGFuZWwgLSBSZXNwaXJhdG9yeSBzcGVjaW1lbiBieSBOQUEgd2l0aCBwcm9iZSBkZXRlY3Rpb24ifV19LCJ2YWx1ZUNvZGVhYmxlQ29uY2VwdCI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjQyZmYwY2I0LTUzYTctNDhlMC04ZTM4LWFiOTNiYTNiMmQ2ZTpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiI2NTRkMTY4MC0xZTI3LTQ0NjEtYTVhMS04MWFhYjA5M2Q5NTA6c3RyaW5nOjI2MDM4NTAwOSIsImRpc3BsYXkiOiI5YjE5OWZmYy1mZDlkLTQwMmUtODZlZi1mNWEzMjc1MGIzOGM6c3RyaW5nOk5lZ2F0aXZlIn1dfSwiZWZmZWN0aXZlRGF0ZVRpbWUiOiI1N2RlNjg4Zi1mNDY3LTRhYTktYTk5Ni02NjU4MzI2YTExZjc6c3RyaW5nOjIwMjAtMDktMjhUMDY6MTU6MDBaIiwic3RhdHVzIjoiYjdkNmY5ZWMtMDE2ZS00NWFkLWIwOGUtNjg3MGMwZTVmYjE3OnN0cmluZzpmaW5hbCJ9fSx7ImZ1bGxVcmwiOiI3NTk4ZTAxYy0zZjI0LTQ4YmItODEzMS1iODk4NzNhZjQ2ZTU6c3RyaW5nOnVybjp1dWlkOjAyNzViZmFmLTQ4ZmItNDRlMC04MGNkLTljNTA0ZjgwZTZhZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjZjMTM1NzVlLTkyNTQtNDg4Yy04MzgwLTQyN2YwMjBlYTQ5MjpzdHJpbmc6U3BlY2ltZW4iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiMzIzOGVjYjAtMWU5MS00NzI4LWI2YzUtNzA5ODRmMDY5ZjMwOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6IjFmMTg3NTY2LTE2MDYtNDVkMi1hZDhmLWE4MWQwZjgxYjc3NDpzdHJpbmc6MjU4NTAwMDAxIiwiZGlzcGxheSI6IjMyNGMwYWQ1LTMwYTAtNGQ2OC1hNDkwLTYxZjFkM2UxN2I3ZDpzdHJpbmc6TmFzb3BoYXJ5bmdlYWwgc3dhYiJ9XX0sImNvbGxlY3Rpb24iOnsiY29sbGVjdGVkRGF0ZVRpbWUiOiJiZmJhZTkxYy00NDExLTQyYmItYjk4OC1hM2E1ZjMzNGJhNzE6c3RyaW5nOjIwMjAtMDktMjdUMDY6MTU6MDBaIn19fSx7ImZ1bGxVcmwiOiIxM2IwZGM2OC0yMWVjLTQwYzctOWJjYy02YTQzNmZlYmUyOWU6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjhhYTFkZDY2LWQzZjUtNGIxMy05ODdjLTgxZTM2NTQ0ZGExNjpzdHJpbmc6UHJhY3RpdGlvbmVyIiwibmFtZSI6W3sidGV4dCI6IjdkODRhODcyLTZiYTEtNDI0OS1iN2E2LWE3MTEyNTZjZWYyODpzdHJpbmc6RHIgTWljaGFlbCBMaW0ifV0sInF1YWxpZmljYXRpb24iOlt7ImNvZGUiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiI0NTU1MjhmYy05NGE5LTRkOGEtYTExNS1kYTYzOTNjNDk3ZjU6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vdjItMDIwMyIsImNvZGUiOiJmNjVlY2ZmZS01MDRkLTRlNWQtYjNkNS01YzMwMzE1ZTcyNGQ6c3RyaW5nOk1DUiIsImRpc3BsYXkiOiJmOGNmOTExNi03NzZiLTQ5MjctOGEwYS00NWViMjFiZDBjNGI6c3RyaW5nOlByYWN0aXRpb25lciBNZWRpY2FyZSBudW1iZXIifV19LCJpZGVudGlmaWVyIjpbeyJpZCI6ImZkZmUxY2FlLTk1YWMtNGVhZC1hNzM0LTViZjk1YzlhMjBjZDpzdHJpbmc6TUNSIiwidmFsdWUiOiI0MzE1ZTVmZC04ZjEzLTQwZTctYWEwMC1kNGQ1ZWFmYjMwNmM6c3RyaW5nOjEyMzQ1NiJ9XSwiaXNzdWVyIjp7InR5cGUiOiJjMjgzNzAwNS1iMDU4LTRjZjctOTQ0MS1mM2JmZjQ0Nzg2YjY6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6IjQ5ZjQyYjVlLTNjMGEtNDI4Ny05MWE0LWZjNDExYWE0Y2UzNDpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIn19XX19LHsiZnVsbFVybCI6ImE0NWQ3MmRjLTU2NzUtNGNiZi05NDg2LTJmMDI0MmQ4NGVhMjpzdHJpbmc6dXJuOnV1aWQ6YmM3MDY1ZWUtNDJhYS00NzNhLWE2MTQtYWZkOGE3YjMwYjFlIiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiZTBkNmI0ZmEtZWNjYi00NGE2LWFmZTEtZTNiNDJhOTlmMzI1OnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiYmJmMDU0ZWUtOTA0OC00ODkzLWI4OWMtOGI3Nzk1NzcwMzA4OnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGggKE1PSCkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6IjEwMjE0ZjI0LTQyMDgtNGQ0Mi1iMzllLTQ0NWVlMTRiY2JkODpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJlODZiZWQ0OC0yNDYwLTRmMzMtYWRhOC1lZmMwYjI2MTViYTQ6c3RyaW5nOmdvdnQiLCJkaXNwbGF5IjoiNjk0ZWJmZTYtODRjNy00NTg5LWE4MGEtOWQwYWQ4MDA1ODA5OnN0cmluZzpHb3Zlcm5tZW50In1dfV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6IjgxMjBkN2Y1LTlkNjgtNDBiNC1iYzAxLTE0ZDBkYWJmOWVjMjpzdHJpbmc6dXJsIiwidmFsdWUiOiIxMTY2YmIwNi00NjEyLTQ4YjctYWQwNC1iYzU3ZjIwNzJkOTU6c3RyaW5nOmh0dHBzOi8vd3d3Lm1vaC5nb3Yuc2cifSx7InN5c3RlbSI6IjZmZjMwOTFmLTk0MzEtNGEzZi1hYjdkLTUzYzUyNmQxNDkyMjpzdHJpbmc6cGhvbmUiLCJ2YWx1ZSI6ImExOTI0OWUyLTk0MzMtNDE5NS04NGFiLWRhYjMyOGU2Zjc2ZDpzdHJpbmc6KzY1NjMyNTkyMjAifV0sImFkZHJlc3MiOnsidHlwZSI6ImJkMjM0NTk4LTgyZTgtNDBhNS04YjBlLTZlNDc1OTNhYzg3ZjpzdHJpbmc6cGh5c2ljYWwiLCJ1c2UiOiI1MTQ4NDMyOC1lZDc1LTQ4NTMtODFhNi04MmEzZjRkMTZlODE6c3RyaW5nOndvcmsiLCJ0ZXh0IjoiMTM4OWMzYTEtZjc5YS00YjllLWI1YzItNDk2MWNlNjZiYzU0OnN0cmluZzpNaW5pc3RyeSBvZiBIZWFsdGgsIDE2IENvbGxlZ2UgUm9hZCwgQ29sbGVnZSBvZiBNZWRpY2luZSBCdWlsZGluZywgU2luZ2Fwb3JlIDE2OTg1NCJ9fV19fSx7ImZ1bGxVcmwiOiI4ZTc5ZmM0Ny1jNjUwLTQ4ZmUtOTRmZC00NjFlNTVjY2U5MjQ6c3RyaW5nOnVybjp1dWlkOmZhMjMyOGFmLTQ4ODItNGVhYS04YzI4LTY2ZGFiNDY5NTBmMSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjMzYjJiNDQ3LTAzY2QtNDJjNS1iODNhLWRhNDU3NDQxYmYzMjpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjRhYzE0OGUwLTRhNmMtNDQ2YS04NjRkLTNlYmZlOTZhMjliZjpzdHJpbmc6TWFjUml0Y2hpZSBNZWRpY2FsIENsaW5pYyIsInR5cGUiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiZTYyMjhjMzUtYjdjNS00Y2UxLWJkZTctMjZlYzI5MDljMGFhOnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL29yZ2FuaXphdGlvbi10eXBlIiwiY29kZSI6Ijg0OTA4MDAyLWUzMTctNDQ2Yy1iMDE4LTRiMjBmYzlhZWMwZjpzdHJpbmc6cHJvdiIsImRpc3BsYXkiOiI1YmNhYWIwNS0wZTBmLTQxZmUtOTQ3My04N2VmMTU2OTgwYWI6c3RyaW5nOkhlYWx0aGNhcmUgUHJvdmlkZXIifV0sInRleHQiOiJjMGI4ZTM3Zi0zODYzLTQ0NmItYjlkNC1lNjlkYmM1YzJiYjY6c3RyaW5nOkxpY2Vuc2VkIEhlYWx0aGNhcmUgUHJvdmlkZXIifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6ImYyMGI0OGRjLWIyYmQtNGVmYi04M2Y4LTUxZWM4NDIxMWExMTpzdHJpbmc6dXJsIiwidmFsdWUiOiI3NzAyNjVmMS04NmVkLTRkNjYtODUxZC1iODE3NjM2MTM3NzM6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVjbGluaWMuY29tLnNnIn0seyJzeXN0ZW0iOiJjMzJkYzE4MS04NzlkLTQ4N2YtYTNmMC03OTMwNDdkYzgyOGQ6c3RyaW5nOnBob25lIiwidmFsdWUiOiJlZDNmMGM2NS00ZWRjLTRkNjktYjRlMi02ZmQ2OTIxZGU3OTM6c3RyaW5nOis2NTYxMjM0NTY3In1dLCJhZGRyZXNzIjp7InR5cGUiOiI0M2YzZmQwZC02NDI0LTQ2NTgtOGVkZC1mYzJlM2FlNDRmYmU6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiMzUwODc3ZjEtZWQwMi00ZjAwLTk3MzMtZmE2MWJjZDYzM2M5OnN0cmluZzp3b3JrIiwidGV4dCI6ImM4NjRkZTlmLTAzY2YtNDg4Yi1iMTQ2LWU1N2VlMjhjN2MyZTpzdHJpbmc6TWFjUml0Y2hpZSBIb3NwaXRhbCwgVGhvbXNvbiBSb2FkLCBTaW5nYXBvcmUgMTIzMDAwIn19XX19LHsiZnVsbFVybCI6IjhiZWE2ODI3LTFkNTAtNDllNS1hODkxLTU0YmYyMjdkOWViNDpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3IiwicmVzb3VyY2UiOnsicmVzb3VyY2VUeXBlIjoiNjc4OWVjZTctZjM4ZC00NDY4LWI5YmYtODUzMjQ5MTk2NDJkOnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiYWMyYTU4OTItNWY0OC00MTNhLTgxNjItNDk3YWIwMWQwZTIzOnN0cmluZzpNYWNSaXRjaGllIExhYm9yYXRvcnkiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6IjFhMGE1YmNhLTQzZjEtNGMyMy1iNGIwLWNmNjJhOGI3NWE4NDpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiIxOWQ3YzRhNy1lOWYxLTQ5ZmYtYTNjYy00ZDNjNWU4YWRhMjA6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiMzJmMjg5NjMtNzdhNy00NWYzLWE4ZTYtN2ZlNjAzMDEzYmE3OnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiZmQxMzJhMjYtNTE1MC00MTQxLTg5MDEtZTYxZDM0NzAxN2JlOnN0cmluZzpBY2NyZWRpdGVkIExhYm9yYXRvcnkifV0sImNvbnRhY3QiOlt7InRlbGVjb20iOlt7InN5c3RlbSI6Ijk0Nzg2OTZjLWU3YWItNDE0My04OThlLWZkYmZjOWYzMDc2ZTpzdHJpbmc6dXJsIiwidmFsdWUiOiI3NzA0NWUxYy01NmMyLTRjZTUtYWQ1YS02YmFjMzBlMDRlNjc6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVsYWJvcmF0b3J5LmNvbS5zZyJ9LHsic3lzdGVtIjoiMGIzMjZiZmYtYjM0OS00OGQzLWFhOGMtM2I0NWRmZGNhMjk4OnN0cmluZzpwaG9uZSIsInZhbHVlIjoiZWZhNzcyYTUtM2Q3MS00OTcyLWEzNWYtMTgxMWQ2ZjZiMTk4OnN0cmluZzorNjU2NzY1NDMyMSJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiNTE4MzY5MTUtZDhkMS00ZjJmLWIxMTAtMTBhNmU2Y2VkZTRkOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6Ijc4ZDc5ODQ5LThjNGQtNDZkMy1iNTZkLWQxYWMzYmNhNmY1ZDpzdHJpbmc6d29yayIsInRleHQiOiIxODc4ZmU1ZS0wNDI3LTQwNDQtYmM3Yy0zODI3M2VhZjJjMWE6c3RyaW5nOjIgVGhvbXNvbiBBdmVudWUgNCwgU2luZ2Fwb3JlIDA5ODg4OCJ9fV19fV19LCJsb2dvIjoiYWI2MTQ3MDYtOTEwYi00YTMxLTkwZGYtZjcwNWQ5OGJiNzgyOnN0cmluZzpkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWZRQUFBRElDQU1BQUFBcHgrUGFBQUFBTTFCTVZFVUFBQURNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16ZUNtaUFBQUFBRUhSU1RsTUFRTCtBN3hBZ24yRFAzekJ3cjFDUEVsK0kvUUFBQndkSlJFRlVlTnJzbmQxMjJ5b1FSdmtISVNITit6L3R5VWs5b1RFQ1ExYlRCYzIzYnlOczBCNUdJREFSQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWsrSWsrSWR4NGc1TjRCOUdRL3JQQTlKL0lQZlNnd0wvTUVFQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR3UDVaUG9QNXI3RkpLQWY3Y3VmQmloUE5Ta1g1aGxBOXUrRHNQN2RYL0pLMVAyVlBpU0lvZWJFckx3Vmg1WngrOEMxWTIyWXRQMEZwZjZoZGVhK21xMVdsaXhmZWo2UmNEeGowOXN3WGJiZUJRcGlqdWcyMGFqL1NFOGJ2bzVoRXVhdkF1U0twUWZKeFRHOTFnVXJDVjZqU1FFMG9Qa2U0d3VrZTcwNUVxcExOV3h0TXRTazRqdlhHbGQrdExseHZWTU5uYWtEN21FbmRZVFZXU25WODYwV1VYbDM0Uk15N0JlbXB5R3pON3BBYm1YRUE2YmZ2SzB1MzJ1VEZLS1ZNMHIwWXcxTVRjRnZwOGlWTFBEMCs5Z0hReSs3clNmM2VlanAySHVGY3NtbGRpRXowRnpLWGZTUnczcWUwOFhxZDlkUDZRS09Obmt1NGxHM05TYi9SQnRLdEt0MXR0ZEJKaVliMlZJN2JyYzd0YzhJWW90SnpIVUIwYytPK1QzclRRdUxLc1pScXB6a1RTN2RaSTR2bytxSm5kRUdPOEV6ZWN5amFjNi9JVE4yS09XYVVMSVQvYUxkZVVucXBkaTdWVzIrS3ljMjlGTDNzN2UzaGk1TFRTaGVXV3B5V2xINFh6bXZXam5pT2lGTjNZV0RpdldJOTJXdWs1Y3QyQzBwM0p6bDlZTjY2V0k1SVYvVnlGODZyMWExN3BINVVNQzBwWC9Ed1hWVTUyNEtzNVlnRFptTDR6R3oxdzgwcDMzUGoxcE12Y2krdGMyY0ZJam1oSDJkV1ZmdWFWTHVMank5ZVR6Z3FPcnFld3YwdnVtLzFLUjQrMmE2RGg1cFhPN1Y5TytzNEtSSlBBRHV4Tmp0akZDQ2svQ2x0RXpnZnpTdGVyU3ZkWlFaZURveXlxeFFndVIxbFhtQmxJLzlQU2ViWnBiT2U4Yml2dDJiRks5WWFLNGVIZTdOTE5hdExQM3FHWUxmTDcxUm9NdkI2WHU5NkozVFd0OUxUb1FNNXptOFlmeGJISUVTUFpYWFcvdG92VFNvK1BxRnhOZXN3WnFqTy9YMDlPdkJnaTlPY0h3N2xsVXVrY3YrZGkwcm5lcWY5OXVYb0tnbE1Nd2FsbDd4L215MG1sUDVwaVZudjNmdVorMTkzeG5wVFlMejNTamVqUExYcE82VHRYYnpYcGZJVWNlSkhtUHNYQUpzYkkrYUw3ZnZzcHBWc09YN3VhZEo5RnZ1VDYzUHhzWkFRM1VNeHlnTHlXdnNrNi9sdWt1NDBmYjh0dG9sREZGYjFaUVE2L21Sa3YxaVc5aTFKNkMvMWFlakFjdlFQVm1VdDZGQjJjbjI2SnpETzRUc2FMY1dlYVRibzdJbjA0WDA4Njk2WHhUbnJrbXpHQ0hpbW1KcEx1TmFQaTcxZitLT2t0ZTVJSzlPclM3NGluZ1BTZkpkMW9JU0Q5WjBtL2hQaEIwbysvTGQzTU1HVXJTVTY4czl5VXpYU08zc3VoVytCaCtKajBveXoyc25acWdwY3pkNWl3cHZSdm1LZlhwWS9QMHllU2ZzZ0hPaGxpd3RMUzdjQlNpUjFhWkZQMzBxK0J0M2ZYYks5aFEyVHIrNHJTYys4ZGZsWENPMmw2cFkrUElzNXBGMXhzNGttYlhWQjZ6MEpXUlJkSCs2QjB3OFZlb3lkZVdsVjg0eGFVTG52WDA4dkV6Tm4rSEpPdSt0ZlQxY1NiS1BMZXd2V2tjL2MxL1l0czRTbEorREhwdW5zRjMwNjlYU3J3N1ZoUWVsNGdITjNRdUhPOGpFay9POGNDK1VvL3BYUit2RzBMU24vWlh4bFh5SW9jNjBQU2hlbGR3dmR6YjRIVzNJNzFwTy8wd0hZcU9JcDh2NDFKVDUyVE5qZjVqeDI0Zm1FOTZXTHJHNy9ic29NNmVoQ0dwSjhzMC9aVjNrOHFuVE9kWDFCNjZIT2diNGI1S1JmdGw1NGZDN292eXZaWnBYdDZKeTRvM1pxZWRPdk1UZHNsUFVoRDBybFd4dlZNRnRTMFAxVU9uUHZXazg0WGRiMERJWFcva0hpTVNMZW03ck1NS0RtdDlKMEhtZ3RLLzNCZzdHaGdPR0xDZ1BUOGFmcDFwZFRFeDQ4ODZuZ3RLRjJjOU9wc2dWRGJPS0NKT1Fha2krMVZyRmkrd3JpSnBmTmEvb3JTaGNyVzI4NmpMWXN5eWZaTGw4U0V0bk02NWoxU0xIK3dYVkc2amMwRFlJOTg2RnVqS0puUUxWMGMxTXJ3N3NPNW4vZnd3RGZrb2o5Z2ZENG96aHlGQVVWTXFCUmxZckNkMG9VblJya2l5RXpPUEZOTEZ6VHpUNVZsQlhkM09tOG96a0J0T09kRFBaa1U5azkvUENwTGtIYXJuWlVmSWhYT3YwLzZJU3YwU09jdmovMWI5dHpma041RzN4N2ViZEloMzRXZkY2dHBEcnJZSzZQVXBkLzRmSlMzYnBYYXJ0T0pOK1NSREJYT3YwbDZtNkV6WjF6MzVsdzlrM1JPMDFXTUZCVTRINCsyMWxNYmI4WHMwdmx2WVZIcDNQVXFLQ2NhT0RVc25iTkxTUjVjVEMrZForcHBWZWxDbkthMTE3ZU5UTlFrU1ZGaVUydFArUXJTT1Z2WlphVUxxd3Z0UENoL2pkTWIzUk45OVFPa29qdjhMc1FTMGsvTzcrdEtmK05NVDk2TlAwVXZMdmluUm05Sm4yNHdWcmJEQ2JHSWRGNHhWQk5KL3hKU2U2VWVvL0JqLzlJLzdEeTBQdnJuSnk1b3BTSVJSWlgwYVFVQUFQelgzaDNVQUFDQVFBeDdZQUQvYW5GQkNOZGFtSUFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQW1tb2VLOUh6aUI1STlFQlhueDhBQUFBQUFBQUFBTEJtQUlaS216V0lueHlPQUFBQUFFbEZUa1N1UW1DQyIsImlzc3VlcnMiOlt7ImlkIjoiMjBmNTkxNTgtOGI3YS00NGVkLTg5YmEtOWE2OTM0NGUwMDU2OnN0cmluZzpkaWQ6ZXRocjoweEUzOTQ3OTkyOENjNEVmRkU1MDc3NDQ4ODc4MEI5ZjYxNmJkNEI4MzAiLCJyZXZvY2F0aW9uIjp7InR5cGUiOiJlMzEyZjI2MS1kOWIyLTQ3MzEtOWI5YS0zOTA0MjhkNDFhMTY6c3RyaW5nOk5PTkUifSwibmFtZSI6ImM1NTg2ZDcyLWY1YmQtNGMyMS04N2E4LTI5MTUzMWI1MWYxZDpzdHJpbmc6U0FNUExFIENMSU5JQyIsImlkZW50aXR5UHJvb2YiOnsidHlwZSI6Ijg1YTFkNDVmLTQ1ODMtNDM3Ny05OTVmLWZkOWQzZjkxYTVmYzpzdHJpbmc6RE5TLURJRCIsImxvY2F0aW9uIjoiZTVjNGFjZWUtZjUzYi00YjRiLWI2Y2ItNjExZTAwY2I5MDJkOnN0cmluZzpkb25vdHZlcmlmeS50ZXN0aW5nLnZlcmlmeS5nb3Yuc2ciLCJrZXkiOiJhZmVmZmRlNC00MjlmLTRjN2MtYjJlMy02MjBkYTNlZTk0NGE6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIn19XSwiJHRlbXBsYXRlIjp7Im5hbWUiOiJiYTQ3MjcwMy04ZmU0LTQyMDktOWQ4Zi0xZTBhNTNkYjJlZjQ6c3RyaW5nOkhFQUxUSF9DRVJUIiwidHlwZSI6IjgxODY3ZTI0LTQ3ODAtNDU2My1iMTg2LTIxNzkxOWY4YzkxOTpzdHJpbmc6RU1CRURERURfUkVOREVSRVIiLCJ1cmwiOiIyOGFmMGEzMi1lODI4LTRkNzQtODcyMi01NGMxOTdmNmEwNjQ6c3RyaW5nOmh0dHBzOi8vaGVhbHRoY2VydC5yZW5kZXJlci5tb2guZ292LnNnLyJ9fSwic2lnbmF0dXJlIjp7InR5cGUiOiJTSEEzTWVya2xlUHJvb2YiLCJ0YXJnZXRIYXNoIjoiYWIwY2Y4YzgzMWY0ZmJiNTUyYmRiNmM5YjJlYmRiMWVhMzM0ZmFmNWRiNmYwYWQyMjZhZTg1MGM4NjAzZGEyYSIsInByb29mIjpbXSwibWVya2xlUm9vdCI6ImFiMGNmOGM4MzFmNGZiYjU1MmJkYjZjOWIyZWJkYjFlYTMzNGZhZjVkYjZmMGFkMjI2YWU4NTBjODYwM2RhMmEifSwicHJvb2YiOlt7InR5cGUiOiJPcGVuQXR0ZXN0YXRpb25TaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjEtMDgtMjRUMDQ6MjI6NTUuMTc3WiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIiwic2lnbmF0dXJlIjoiMHg3YTMxOTZmZjRlNmM4ZTYzNzVmOTcxODY1ZmNlOWNmNTJkMjZmNTQxMTAwM2IxZTBkY2EwMDJkNzA2MzI3MDM3M2VjZTFmOGVjOGI5OTljMzEwOGNkODgzMDBkZDk0NDUwMzczNjMwMzE2ZTU5ZjZkZWI1MDcwYjkzNmU2YzllYjFjIn1dfQ==",
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
                  "value": "S9098989Z",
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

it("should wrap a v2 document and sign the document with encryptedEuHealthCert", async () => {
  const parseFhirBundle = fhirHelper.parse(
    sampleDocumentUnWrapped.fhirBundle as R4.IBundle
  );
  const createdDocument = await createNotarizedHealthCert(
    sampleDocument,
    parseFhirBundle,
    uuid,
    storedUrl,
    sampleEuHealthCertQr
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
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiNTk4MWFmMTktZmU5Zi00M2MxLTlmMzEtOWNjYjlhMWZjYmQyOnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiYTljMzBmNGEtZDEyYS00NDRmLWIxMjktMTY5ZjQxNTFmOWI4OnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6ImE2MGRkMTc5LTQwMjktNDRjNS04Yjc3LTI5NmIxMDQxMjgzNjpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiOWEzYWVlMDQtNWZmMi00YThhLTg0MDctODYzZGQ5NTFhN2VmOnN0cmluZzoyMDIxLTA1LTE4VDA2OjQzOjEyLjE1MloiLCJmaGlyVmVyc2lvbiI6ImU2OGI1OGZkLTMxOGUtNGM1Yi04OGVkLTA2YjUyYzIyNDdiYzpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6ImE3NGJmNDNmLWRiMmMtNDJlOC1hMGVlLTNmNWVhMTA5OTViZTpzdHJpbmc6QnVuZGxlIiwidHlwZSI6IjQ1MjY5YzFlLTI0MmEtNDRiNy1hZmExLTAyOWI5N2I4ZGE2ODpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiYmNlYTgzMWQtN2E5Zi00ODgyLWI5MmEtN2UwZjc0OGIwNDM1OnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJkNmU3ZTM2Mi1iMzQyLTQwNmQtOWVkYS0zOWM0ODI1NTFhMjk6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6IjY1ZGE2ZWIxLTM4YWEtNDZjNS04MDFiLWM4Yzk2ZDIyMjViNTpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6ImU3M2FlYTI2LTNkZmQtNDBkYy04OWU1LWZmYTQxNmMxMTYyZTpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiI5NmM4YzcxNy0zMTMyLTQyOTAtOTlhMy0zZDJkZGI0N2U4MGI6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6IjgwN2EwZDdjLWU4MTMtNDRiNy1iODE4LTJjMWE0MDk0YmRiODpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiMWZmZTRlNzItMTg0Yi00M2VmLTk1YzgtY2I2ZDQwMjY4ZDczOnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6ImNjNWQ1OWE1LTdjMzItNDBjYS1hNTQwLTBmY2NmODcyMTY4NTpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjJiY2M5ZGRmLTA5YmEtNDVmNi1hYWFkLTVjNGUxZmQxZmFiZTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6IjQzYzM1OTkzLWRhNDItNDA3YS1hZWVhLTIwZTgzZTllM2NiMDpzdHJpbmc6UFBOIiwiZGlzcGxheSI6Ijk0YjhiMWI0LTAwMTgtNDQwNy05YTBmLWY2ZjkxNjcyZTIzZDpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiIwOTRjZjQ5YS0xMzEyLTQ2YjgtOGZlOC1jOGZlNzAyNGJhYzc6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiIwMTU4MTc5MC04OTNkLTQ0NzAtOTZlOS0xODk4ODY0NTc1OWI6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiI1ZWJkMzgwYi01YzE2LTQ0NmYtYjI0NC04OTRlMjYzMWVlZWM6c3RyaW5nOlM5MDk4OTg5WiJ9XSwibmFtZSI6W3sidGV4dCI6ImRmMWQ4ZGQwLTViOTAtNDdlYy1hYjlkLWM1ZjU0OWZkMDcxZjpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiY2VjYzE4ZGItOWUyMS00YjYyLTk0YjQtNmJlZDY5YTcyNTU2OnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiIzY2IyM2FmYy01MTY3LTQ2ZDUtYjJiMS0xYmE3NGRlNDQzYmI6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiNTFlNDg3YzEtNWExZC00ZTJlLTk3MzMtNjhmOGU5NTMxNjRkOnN0cmluZzp1cm46dXVpZDowMjc1YmZhZi00OGZiLTQ0ZTAtODBjZC05YzUwNGY4MGU2YWUiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIxNjBhMDQ5MC0xZDJlLTQ2YjYtODc1Ny1jYTg0YTY5YzEwNDE6c3RyaW5nOlNwZWNpbWVuIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImJjNGEyOTgxLTViNzAtNGM4My04N2MxLWMyZjcxMzc2NmM3YzpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiI3ZTViZTU5Ny1iODhmLTRhZWMtYjJmZC05OWE1MzUwMDg3ZWM6c3RyaW5nOjI1ODUwMDAwMSIsImRpc3BsYXkiOiI2ODg3M2M0Yi1kZWExLTQwYjQtODk2ZC02OTljNGNhOTMzOWQ6c3RyaW5nOk5hc29waGFyeW5nZWFsIHN3YWIifV19LCJjb2xsZWN0aW9uIjp7ImNvbGxlY3RlZERhdGVUaW1lIjoiNzA0NmI5OGItNzYwNy00NzhmLTg5ZTYtNTgzYzc5ZGY0NWMwOnN0cmluZzoyMDIwLTA5LTI3VDA2OjE1OjAwWiJ9fX0seyJmdWxsVXJsIjoiOWMzMTVhZGYtYTA0Mi00YTMzLWFmZTAtNTk2NmE5ODEzMDU2OnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiI1YWE4MmUxMi1lMjM3LTRjNmItYTE0Ni00NmYyMjE3MzdmMjU6c3RyaW5nOk9ic2VydmF0aW9uIiwicGVyZm9ybWVyIjpbeyJpZCI6IjA4ZTlkN2JhLTYwZTMtNGQwNC1hOTllLTAzMmM3OTIxYmJmMTpzdHJpbmc6TEhQIiwidHlwZSI6IjU5NmJhNzE4LTJmN2YtNGM1YS05NWEwLWVkMmJhYzA4ZjYyNTpzdHJpbmc6T3JnYW5pemF0aW9uIiwicmVmZXJlbmNlIjoiYzEwN2FiYzAtNWYyZS00MjNkLWEwYTQtNTM5MzI4YzdiZmY5OnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEifSx7ImlkIjoiNTBmYmI1OGItNDhiMi00YWI0LThkNWYtNGIxMDZhOWZhOGM4OnN0cmluZzpBTCIsInR5cGUiOiI4OWUwMWU5Mi02ZTRmLTQ2ZmYtYjBhMC0zZGZjNTVkMTFlM2I6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6ImNiNzg0ZjZjLWVmMTYtNGM1Zi05M2Q3LWNlZWQzNWQ5OTVhNDpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3In0seyJ0eXBlIjoiNWVlMjVlNGItYzlkNi00NDc3LWEwNjItYTY2ZDMzODJlYzFmOnN0cmluZzpQcmFjdGl0aW9uZXIiLCJyZWZlcmVuY2UiOiJhYWY4ODYxYS04NTUzLTRlOGEtOGY5MS1iN2YyMjAyMGU0M2I6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiJ9XSwiaWRlbnRpZmllciI6W3siaWQiOiI4Y2RkOTAwNy01ZjVlLTQ4MjctODk0Ni1hZmNjYjQ1OTMwMTg6c3RyaW5nOkFDU04iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiOWRiOWZhMzctYWZkNC00NDg2LWJkYWQtODU1YTE3ZGEyZDkxOnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiZDYwZTM3NDItYjhlNi00ZWRkLWE3ZmQtZjhhMzU1MzYzOTA1OnN0cmluZzpBQ1NOIiwiZGlzcGxheSI6IjZlYzRmNGIxLWQxNmYtNDA3Zi05NzFiLTI5MTc2NmY3NGU5ZTpzdHJpbmc6QWNjZXNzaW9uIElEIn1dfSwidmFsdWUiOiJkMmQ4MmNjMS0yZjdkLTQwMmEtOTBhNi1hMDBkMzk2ODFlNjk6c3RyaW5nOjEyMzQ1Njc4OSJ9XSwiY2F0ZWdvcnkiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiMWE3ZGFiNGYtMzI0Ni00NDdkLWJkYmMtNmZkODk3ZTM5NWNlOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6IjYzMGZjNDA0LTc5MjAtNGZkNi1iZTRmLWJlZDZiYjQ1ZDMyMDpzdHJpbmc6ODQwNTM5MDA2IiwiZGlzcGxheSI6ImMzNjg1MzhiLTg4Y2EtNDVkMy1hNjJkLWZmMDY5YjZmNjIyNjpzdHJpbmc6Q09WSUQtMTkifV19XSwiY29kZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImYyZjVmZTc5LWZlMjQtNGI5NC04ZjNkLWQ1NDhiYWQ4YzA5OTpzdHJpbmc6aHR0cDovL2xvaW5jLm9yZyIsImNvZGUiOiIwODdkZDc3YS02YjMwLTQzNGMtYThhZS0wNWFlNWYwZTNkYWM6c3RyaW5nOjk0NTMxLTEiLCJkaXNwbGF5IjoiYjRkNDRkMTctYTVmNi00YTIwLWEyNTMtMjc1Y2Q4MTVmYTYyOnN0cmluZzpTQVJTLUNvVi0yIChDT1ZJRC0xOSkgUk5BIHBhbmVsIC0gUmVzcGlyYXRvcnkgc3BlY2ltZW4gYnkgTkFBIHdpdGggcHJvYmUgZGV0ZWN0aW9uIn1dfSwidmFsdWVDb2RlYWJsZUNvbmNlcHQiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiI2NGM2MGYyZi02MjE3LTRjN2ItYTBiNS0yNWI5YmYwNDUzNjg6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiNWE5YTllZmItYTg5Zi00ZTNjLTk5ZTQtNGEzMzFiNTViMDljOnN0cmluZzoyNjAzODUwMDkiLCJkaXNwbGF5IjoiYTY1NDMxMWQtNmFjZS00NDRlLWFjZGMtZmEzYjVlYjFiY2JhOnN0cmluZzpOZWdhdGl2ZSJ9XX0sImVmZmVjdGl2ZURhdGVUaW1lIjoiMWU2ZWQzNWQtZmJlMy00MGFjLWE2ZGUtMGRjMzlhZmI4OGY2OnN0cmluZzoyMDIwLTA5LTI4VDA2OjE1OjAwWiIsInN0YXR1cyI6Ijg2YzczNzMyLTgwNTktNDQwMC04ODg0LTc2ZDlkMWJiNGMxZjpzdHJpbmc6ZmluYWwifX0seyJmdWxsVXJsIjoiNGMxMzYwZDAtMmU3Zi00YjRiLThjMTgtOTkzYWFlNTIxNmIwOnN0cmluZzp1cm46dXVpZDozZGJmZjBkZS1kNGE0LTRlMWQtOThiZi1hZjc0MjhiOGEwNGIiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIyOWM3NmVmNS04Y2MwLTQxYzctYTAyMS1mNjU4ODQ3NmRkMjE6c3RyaW5nOlByYWN0aXRpb25lciIsIm5hbWUiOlt7InRleHQiOiIzMmZjZWI1NS05MjA3LTQwY2MtODY4Ni05ZThiMzIxM2YyMGI6c3RyaW5nOkRyIE1pY2hhZWwgTGltIn1dLCJxdWFsaWZpY2F0aW9uIjpbeyJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiYmJmZjIyOTQtMTlkOS00YTIxLWIyMmMtNDg2NjJlYjhkNmVlOnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiMmU3M2QwOGYtMWZkZi00Y2VhLWJjNmItN2Y4YWM2ZDkyYzFiOnN0cmluZzpNQ1IiLCJkaXNwbGF5IjoiMDdhNTc5MmYtN2E0YS00N2Q3LWE1ZmItZDA1YTU0Mzk5ZmJlOnN0cmluZzpQcmFjdGl0aW9uZXIgTWVkaWNhcmUgbnVtYmVyIn1dfSwiaWRlbnRpZmllciI6W3siaWQiOiIxZDM1ZGVhOS1lODQyLTQzZTctODE3Ni01YmFmZjE3NzM4ZmQ6c3RyaW5nOk1DUiIsInZhbHVlIjoiODVkMDU3OWYtZDVkNC00NDI1LTliMTUtZGNjYTVkZDczYjllOnN0cmluZzoxMjMyMTQifV0sImlzc3VlciI6eyJ0eXBlIjoiNzAyMTE0OGMtZDVjYS00NGYzLTk5OWItODQ5Nzg4NGFiM2JkOnN0cmluZzpPcmdhbml6YXRpb24iLCJyZWZlcmVuY2UiOiJkZjZkYmMyYS04MzhjLTRjYjUtYmNhZS1hMGNjNzJiMGIxODk6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSJ9fV19fSx7ImZ1bGxVcmwiOiIxNDIxYWM5ZS1kMTZjLTRkN2ItYWEzZS05OTAzOGVlN2IxMGI6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjViYzgzZjQ5LThiYjAtNDM0NS1hMzA5LTYxNmZjZWNjMjNiNDpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjM0MzZhNjU2LTk5NWItNDc1OS1hNTY4LTg0ZjMwYjEwZTkxMjpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoIChNT0gpIiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiI1ZGMzYTY4NS01YzlmLTQ1ZTQtYjg0YS01MmMyYWNhZjU4Y2E6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiOGYyOGRmZmUtZTlhMi00ZWNkLWI3YzYtMTBlZjQzMTZkZmZlOnN0cmluZzpnb3Z0IiwiZGlzcGxheSI6IjVhNWQ5ZTQ5LWUxYTgtNDU5Yi05NDVlLTI5ODhmNWU2YWYxNDpzdHJpbmc6R292ZXJubWVudCJ9XX1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiI0NTdjMWJkZi0wNDMxLTQyZjItODc4MC0xOGY2OGE1MDBjMTc6c3RyaW5nOnVybCIsInZhbHVlIjoiMjY0ZGM0YTEtNTM0MS00YWQyLTg0NTUtZDI0ZTI3MGZlYzJhOnN0cmluZzpodHRwczovL3d3dy5tb2guZ292LnNnIn0seyJzeXN0ZW0iOiJkODRhMmVhZS0xMDcxLTRkNWMtODM1Yi01OGNjODY0NzJhODk6c3RyaW5nOnBob25lIiwidmFsdWUiOiI4ZDkwZTMzYy1kNWUxLTRlOTItYjBjYS1mOTcwYWE2MDA1MTI6c3RyaW5nOis2NTYzMjU5MjIwIn1dLCJhZGRyZXNzIjp7InR5cGUiOiJiNTc2YzI5OC1jNTI0LTQ4ODgtOTA5Ni05ZDVhNzY5YzBiYmY6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiZGFhMTNjODMtNTExOC00MDM5LThjZTctNmEwODM2Zjc2Nzk3OnN0cmluZzp3b3JrIiwidGV4dCI6ImMzMGVlY2I5LThiYjQtNGQ0OS05NGNhLWE0YjVmZjhmZTQ1NTpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoLCAxNiBDb2xsZWdlIFJvYWQsIENvbGxlZ2Ugb2YgTWVkaWNpbmUgQnVpbGRpbmcsIFNpbmdhcG9yZSAxNjk4NTQifX1dfX0seyJmdWxsVXJsIjoiNDc4NTc2NWUtNWY4ZS00OTMwLThiOWYtYzgwZTM4MDk0OGRiOnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIzMzQxMDdiZC0zYzM3LTRjOGItYTIxYi1mZmE5YTc0ZGM3ZGU6c3RyaW5nOk9yZ2FuaXphdGlvbiIsIm5hbWUiOiJmODYyMzcwZS1lZTM2LTQzZDYtYmVlNS1jNjVlMzNjMDNmYjE6c3RyaW5nOk1hY1JpdGNoaWUgTWVkaWNhbCBDbGluaWMiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6ImVkNjc2YzNhLWNkM2YtNDY0YS1iNDJhLWQ5N2ExMWQ2ZmMxMTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiI4MzE0NGY1NC0wMzE1LTRjNTMtOGJmYy1lZjg1NjZmYmM4ZGU6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiZTU4YzZmZjctNDBjZS00ZTM1LTk4YzYtNmM5ZTgwY2RmNTljOnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiNDA5NDRlOTMtZjYzYy00MzdjLTkzZTctODBmODJmODZjMGE2OnN0cmluZzpMaWNlbnNlZCBIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiJjM2UxN2I2Ny04YTcxLTRlOTMtOTM5MC03YmFhZWNmMTFmMzk6c3RyaW5nOnVybCIsInZhbHVlIjoiNmZmMWQ5YjEtYTE4NC00YjU4LWI4ZmItYWIwZDgzNzc0NWMzOnN0cmluZzpodHRwczovL3d3dy5tYWNyaXRjaGllY2xpbmljLmNvbS5zZyJ9LHsic3lzdGVtIjoiMGQxMTAwZDItOTM5Yi00YTRlLWJiYjQtN2QxY2MwMTBjNWIzOnN0cmluZzpwaG9uZSIsInZhbHVlIjoiNmMzMTdhYTgtN2QxMy00MTM2LWFmN2UtMjRmMTE5Y2RmNDJhOnN0cmluZzorNjU2MTIzNDU2NyJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiYmI3MGYxYjMtZGE0OC00ODY2LThlNmYtZThjMDZkNjYxMGFiOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6Ijk3ODcxN2Q2LTFhMDQtNGM5Zi1hYmI1LTRjNTQwYTQzYWRkYzpzdHJpbmc6d29yayIsInRleHQiOiI5MmYzMTk0MS1mZjczLTQzNjYtOTc0ZS1iZmJjZTQ3NmIyYjA6c3RyaW5nOk1hY1JpdGNoaWUgSG9zcGl0YWwsIFRob21zb24gUm9hZCwgU2luZ2Fwb3JlIDEyMzAwMCJ9fV19fSx7ImZ1bGxVcmwiOiIzZmNmZGNhNS1jZWI2LTRmNGYtODYwNS1hNmE2MDg3NTE1OTU6c3RyaW5nOnVybjp1dWlkOjgzOWE3YzU0LTZiNDAtNDFjYi1iMTBkLTkyOTVkN2U3NWY3NyIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6ImMxNGM0YmYyLWQwYTQtNDZiNy1hNjQ5LWUwMmEzN2U2ZjBjYjpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6ImNmZTAyYTM5LTBlM2EtNDYyNS1hYTlkLWNlNTY5NzJiYzFjYzpzdHJpbmc6TWFjUml0Y2hpZSBMYWJvcmF0b3J5IiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiJlYTNhMzhlZS1kM2ZhLTRiYmUtYmQ5OS0xMzQ4NDY4MTZiNGQ6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiMmRlZGIyMzUtYWZiYS00ODljLTg0ZmItM2I1YTg5MjA0ZGZiOnN0cmluZzpwcm92IiwiZGlzcGxheSI6Ijg2NTM0ZTRhLWFmNzItNDM5OS1hMmVmLTM2OGQ1NjUyZmNhYjpzdHJpbmc6SGVhbHRoY2FyZSBQcm92aWRlciJ9XSwidGV4dCI6IjZlMWUzMzBiLTRhMjgtNGY2Ni05N2FlLWFmYWM2ODEwM2JhZDpzdHJpbmc6QWNjcmVkaXRlZCBMYWJvcmF0b3J5In1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiIwNTVjNGQ1Yi03MTgyLTRmMDYtYmNlZC00ZTRmYjczZWUxYTI6c3RyaW5nOnVybCIsInZhbHVlIjoiMjVkYjJhYjItMDZhMi00OTdlLTk0NDctODRlNzI5N2YzNGI1OnN0cmluZzpodHRwczovL3d3dy5tYWNyaXRjaGllbGFib3JhdG9yeS5jb20uc2cifSx7InN5c3RlbSI6IjlkOTAyZmQwLTcwMGItNGQ2Zi04ZTYwLTNhNDM5NjY0M2ZhZDpzdHJpbmc6cGhvbmUiLCJ2YWx1ZSI6IjMxZThlODMwLTJmZmItNDc0NC04ODExLWUxNzY1NGRkNmI0NjpzdHJpbmc6KzY1Njc2NTQzMjEifV0sImFkZHJlc3MiOnsidHlwZSI6ImViMTQ2ZjEyLWVkNmUtNDk1Mi1hNzYxLWQ0MTYwYmQ2Yjc1YTpzdHJpbmc6cGh5c2ljYWwiLCJ1c2UiOiJiYmMwZDhkZC1iZjEwLTQwMmEtOTMxZi1jYmFhOTU2NDAzMWM6c3RyaW5nOndvcmsiLCJ0ZXh0IjoiMjQwMWM0NzktNTcyZS00YmMwLTliYzUtMWRmMTMxMzBkZGRhOnN0cmluZzoyIFRob21zb24gQXZlbnVlIDQsIFNpbmdhcG9yZSAwOTg4ODgifX1dfX1dfSwiaXNzdWVycyI6W3siaWQiOiIyOTVkMDE2ZS0yZTUzLTQxZTctOGNjNy0yNzVjMDBjMmIxZGY6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCIsInJldm9jYXRpb24iOnsidHlwZSI6IjZmYTU1M2ViLTdlYjUtNDkwYi04MmJjLTRmY2RkODE5NWMyODpzdHJpbmc6Tk9ORSJ9LCJuYW1lIjoiZTQ3YjFhMTAtZWUzMy00MTYxLWI0ZGQtYjlkYjMzYWE4MmM3OnN0cmluZzpTQU1QTEUgQ0xJTklDIiwiaWRlbnRpdHlQcm9vZiI6eyJ0eXBlIjoiYTA4ZDZjYjItMjdmZC00MDU0LWIwMmUtMTJiYTZhYTRlZDFjOnN0cmluZzpETlMtRElEIiwibG9jYXRpb24iOiI5Zjc0MjM3Ni00ODEyLTQxMWQtODU5NS1jNTRhOTVkMTMwNjI6c3RyaW5nOmRvbm90dmVyaWZ5LnRlc3RpbmcudmVyaWZ5Lmdvdi5zZyIsImtleSI6Ijc3ODMzMzY0LTZlZGQtNDQyZS04NjcyLTQ1OWY4NWEyZmE3ZTpzdHJpbmc6ZGlkOmV0aHI6MHhFMzk0Nzk5MjhDYzRFZkZFNTA3NzQ0ODg3ODBCOWY2MTZiZDRCODMwI2NvbnRyb2xsZXIifX1dLCJsb2dvIjoiZDAxYTY3MTEtNzQwNi00MDk2LTk4MWUtZmIwMjQ0NWI3NmM0OnN0cmluZzpkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWZRQUFBRElDQU1BQUFBcHgrUGFBQUFBTTFCTVZFVUFBQURNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16ZUNtaUFBQUFBRUhSU1RsTUFRTCtBN3hBZ24yRFAzekJ3cjFDUEVsK0kvUUFBQndkSlJFRlVlTnJzbmQxMjJ5b1FSdmtISVNITit6L3R5VWs5b1RFQ1ExYlRCYzIzYnlOczBCNUdJREFSQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWsrSWsrSWR4NGc1TjRCOUdRL3JQQTlKL0lQZlNnd0wvTUVFQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR3UDVaUG9QNXI3RkpLQWY3Y3VmQmloUE5Ta1g1aGxBOXUrRHNQN2RYL0pLMVAyVlBpU0lvZWJFckx3Vmg1WngrOEMxWTIyWXRQMEZwZjZoZGVhK21xMVdsaXhmZWo2UmNEeGowOXN3WGJiZUJRcGlqdWcyMGFqL1NFOGJ2bzVoRXVhdkF1U0twUWZKeFRHOTFnVXJDVjZqU1FFMG9Qa2U0d3VrZTcwNUVxcExOV3h0TXRTazRqdlhHbGQrdExseHZWTU5uYWtEN21FbmRZVFZXU25WODYwV1VYbDM0Uk15N0JlbXB5R3pON3BBYm1YRUE2YmZ2SzB1MzJ1VEZLS1ZNMHIwWXcxTVRjRnZwOGlWTFBEMCs5Z0hReSs3clNmM2VlanAySHVGY3NtbGRpRXowRnpLWGZTUnczcWUwOFhxZDlkUDZRS09Obmt1NGxHM05TYi9SQnRLdEt0MXR0ZEJKaVliMlZJN2JyYzd0YzhJWW90SnpIVUIwYytPK1QzclRRdUxLc1pScXB6a1RTN2RaSTR2bytxSm5kRUdPOEV6ZWN5amFjNi9JVE4yS09XYVVMSVQvYUxkZVVucXBkaTdWVzIrS3ljMjlGTDNzN2UzaGk1TFRTaGVXV3B5V2xINFh6bXZXam5pT2lGTjNZV0RpdldJOTJXdWs1Y3QyQzBwM0p6bDlZTjY2V0k1SVYvVnlGODZyMWExN3BINVVNQzBwWC9Ed1hWVTUyNEtzNVlnRFptTDR6R3oxdzgwcDMzUGoxcE12Y2krdGMyY0ZJam1oSDJkV1ZmdWFWTHVMank5ZVR6Z3FPcnFld3YwdnVtLzFLUjQrMmE2RGg1cFhPN1Y5TytzNEtSSlBBRHV4Tmp0akZDQ2svQ2x0RXpnZnpTdGVyU3ZkWlFaZURveXlxeFFndVIxbFhtQmxJLzlQU2ViWnBiT2U4Yml2dDJiRks5WWFLNGVIZTdOTE5hdExQM3FHWUxmTDcxUm9NdkI2WHU5NkozVFd0OUxUb1FNNXptOFlmeGJISUVTUFpYWFcvdG92VFNvK1BxRnhOZXN3WnFqTy9YMDlPdkJnaTlPY0h3N2xsVXVrY3YrZGkwcm5lcWY5OXVYb0tnbE1Nd2FsbDd4L215MG1sUDVwaVZudjNmdVorMTkzeG5wVFlMejNTamVqUExYcE82VHRYYnpYcGZJVWNlSkhtUHNYQUpzYkkrYUw3ZnZzcHBWc09YN3VhZEo5RnZ1VDYzUHhzWkFRM1VNeHlnTHlXdnNrNi9sdWt1NDBmYjh0dG9sREZGYjFaUVE2L21Sa3YxaVc5aTFKNkMvMWFlakFjdlFQVm1VdDZGQjJjbjI2SnpETzRUc2FMY1dlYVRibzdJbjA0WDA4Njk2WHhUbnJrbXpHQ0hpbW1KcEx1TmFQaTcxZitLT2t0ZTVJSzlPclM3NGluZ1BTZkpkMW9JU0Q5WjBtL2hQaEIwbysvTGQzTU1HVXJTVTY4czl5VXpYU08zc3VoVytCaCtKajBveXoyc25acWdwY3pkNWl3cHZSdm1LZlhwWS9QMHllU2ZzZ0hPaGxpd3RMUzdjQlNpUjFhWkZQMzBxK0J0M2ZYYks5aFEyVHIrNHJTYys4ZGZsWENPMmw2cFkrUElzNXBGMXhzNGttYlhWQjZ6MEpXUlJkSCs2QjB3OFZlb3lkZVdsVjg0eGFVTG52WDA4dkV6Tm4rSEpPdSt0ZlQxY1NiS1BMZXd2V2tjL2MxL1l0czRTbEorREhwdW5zRjMwNjlYU3J3N1ZoUWVsNGdITjNRdUhPOGpFay9POGNDK1VvL3BYUit2RzBMU24vWlh4bFh5SW9jNjBQU2hlbGR3dmR6YjRIVzNJNzFwTy8wd0hZcU9JcDh2NDFKVDUyVE5qZjVqeDI0Zm1FOTZXTHJHNy9ic29NNmVoQ0dwSjhzMC9aVjNrOHFuVE9kWDFCNjZIT2diNGI1S1JmdGw1NGZDN292eXZaWnBYdDZKeTRvM1pxZWRPdk1UZHNsUFVoRDBybFd4dlZNRnRTMFAxVU9uUHZXazg0WGRiMERJWFcva0hpTVNMZW03ck1NS0RtdDlKMEhtZ3RLLzNCZzdHaGdPR0xDZ1BUOGFmcDFwZFRFeDQ4ODZuZ3RLRjJjOU9wc2dWRGJPS0NKT1Fha2krMVZyRmkrd3JpSnBmTmEvb3JTaGNyVzI4NmpMWXN5eWZaTGw4U0V0bk02NWoxU0xIK3dYVkc2amMwRFlJOTg2RnVqS0puUUxWMGMxTXJ3N3NPNW4vZnd3RGZrb2o5Z2ZENG96aHlGQVVWTXFCUmxZckNkMG9VblJya2l5RXpPUEZOTEZ6VHpUNVZsQlhkM09tOG96a0J0T09kRFBaa1U5azkvUENwTGtIYXJuWlVmSWhYT3YwLzZJU3YwU09jdmovMWI5dHpma041RzN4N2ViZEloMzRXZkY2dHBEcnJZSzZQVXBkLzRmSlMzYnBYYXJ0T0pOK1NSREJYT3YwbDZtNkV6WjF6MzVsdzlrM1JPMDFXTUZCVTRINCsyMWxNYmI4WHMwdmx2WVZIcDNQVXFLQ2NhT0RVc25iTkxTUjVjVEMrZForcHBWZWxDbkthMTE3ZU5UTlFrU1ZGaVUydFArUXJTT1Z2WlphVUxxd3Z0UENoL2pkTWIzUk45OVFPa29qdjhMc1FTMGsvTzcrdEtmK05NVDk2TlAwVXZMdmluUm05Sm4yNHdWcmJEQ2JHSWRGNHhWQk5KL3hKU2U2VWVvL0JqLzlJLzdEeTBQdnJuSnk1b3BTSVJSWlgwYVFVQUFQelgzaDNVQUFDQVFBeDdZQUQvYW5GQkNOZGFtSUFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQW1tb2VLOUh6aUI1STlFQlhueDhBQUFBQUFBQUFBTEJtQUlaS216V0lueHlPQUFBQUFFbEZUa1N1UW1DQyIsIiR0ZW1wbGF0ZSI6eyJuYW1lIjoiMmYwOGZiNDQtZGYzOC00NWQ2LTlmMWYtODJiZDE4NGVhMWUzOnN0cmluZzpIRUFMVEhDRVJUIiwidHlwZSI6ImY3NTU4NzQ3LWMzMjktNDJkOC05ZTYyLTBiZjRmM2JhOWQ2YTpzdHJpbmc6RU1CRURERURfUkVOREVSRVIiLCJ1cmwiOiJmZGQxMzAwOC1iMDNjLTQ0ODEtYWM1NC1hM2NiYzc4N2EyOWU6c3RyaW5nOmh0dHBzOi8vbW9oLWhlYWx0aGNlcnQtcmVuZGVyZXIubmV0bGlmeS5hcHAvIn19LCJzaWduYXR1cmUiOnsidHlwZSI6IlNIQTNNZXJrbGVQcm9vZiIsInRhcmdldEhhc2giOiIzMTM5MGVhMDE4MGFkNzNmZjYyODI4ZDkzY2U5MzA5MzQ1YjQ2YmVlYTFkZWM1ZDk4N2VmZTg1ZjZiZDg1NzFkIiwicHJvb2YiOltdLCJtZXJrbGVSb290IjoiMzEzOTBlYTAxODBhZDczZmY2MjgyOGQ5M2NlOTMwOTM0NWI0NmJlZWExZGVjNWQ5ODdlZmU4NWY2YmQ4NTcxZCJ9LCJwcm9vZiI6W3sidHlwZSI6Ik9wZW5BdHRlc3RhdGlvblNpZ25hdHVyZTIwMTgiLCJjcmVhdGVkIjoiMjAyMS0wOC0xOFQwNDowNToxMC44NDVaIiwicHJvb2ZQdXJwb3NlIjoiYXNzZXJ0aW9uTWV0aG9kIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmV0aHI6MHhFMzk0Nzk5MjhDYzRFZkZFNTA3NzQ0ODg3ODBCOWY2MTZiZDRCODMwI2NvbnRyb2xsZXIiLCJzaWduYXR1cmUiOiIweDIyOGQ5ODFjYjE4ZmVlODQyOTc5MTk4YmVkOWM0YTY0YzRlOTNlZDE2MTAzODgzNWVkMjkwMzYzNGIxYjI3N2I3YzM5ODEwYjNkZTJhN2I0YzRmYTk3OGExOWE2OWMyZDNlMThhNWM3MGIyMDAzMmZkNTEwOGI2YTVjNTlmNGM2MWIifV19",
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
                  "value": "S9098989Z",
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
                  "id": "LHP",
                  "reference": "urn:uuid:fa2328af-4882-4eaa-8c28-66dab46950f1",
                  "type": "Organization",
                },
                Object {
                  "id": "AL",
                  "reference": "urn:uuid:839a7c54-6b40-41cb-b10d-9295d7e75f77",
                  "type": "Organization",
                },
                Object {
                  "reference": "urn:uuid:3dbff0de-d4a4-4e1d-98bf-af7428b8a04b",
                  "type": "Practitioner",
                },
              ],
              "resourceType": "Observation",
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
                      "value": "123214",
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
        "encryptedEuHealthCert": "HC1:abcde",
        "notarisedOn": "1970-01-01T00:00:01.000Z",
        "passportNumber": "E7831177G",
        "reference": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
        "url": "https://example.com",
      },
      "type": "PCR",
      "validFrom": "2021-05-18T06:43:12.152Z",
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
