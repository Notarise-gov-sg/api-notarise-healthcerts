import { R4 } from "@ahryman40k/ts-fhir-types";
import fhir from "../../fhir";
import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import exampleHealthcertWrapped from "../../../../test/fixtures/v2/example_healthcert_with_nric_wrapped.json";
import exampleHealthcertUnWrapped from "../../../../test/fixtures/v2/example_healthcert_with_nric_unwrapped.json";
import { mockDate, unmockDate } from "../../../../test/utils";

const sampleDocument = exampleHealthcertWrapped as any;
const sampleDocumentUnWrapped = exampleHealthcertUnWrapped as any;
const uuid = "e35f5d2a-4198-4f8f-96dc-d1afe0b67119";
const storedUrl = "https://example.com";

beforeAll(mockDate);
afterAll(unmockDate);

it("should create the unwrapped v2 document from input data", () => {
  const parseFhirBundle = fhir.parse(
    sampleDocumentUnWrapped.fhirBundle as R4.IBundle
  );
  const createdDocument = createUnwrappedDocument(
    sampleDocument,
    parseFhirBundle,
    uuid,
    storedUrl
  );
  expect(createdDocument).toMatchInlineSnapshot(`
    Object {
      "$template": Object {
        "name": "HEALTH_CERT",
        "type": "EMBEDDED_RENDERER",
        "url": "https://healthcert.renderer.moh.gov.sg/",
      },
      "attachments": Array [
        Object {
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiNjc1NGE4ZjEtMDFiMC00N2Q0LTkyOTAtM2Y1YzI1MzVmNWM5OnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiNTQ3NGMwZjktYWZmNS00ZjQ5LTkwZjktMDBkMTJmZmI1ODIwOnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6IjU4YWRkMDBlLWMwMTktNDlmMC1hMGMwLTU3ZDNmMTllMTQwNDpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiMTc1NzAxMzgtNjQ5OS00MjkzLWFlODEtNTkwYTQ0YzNkODYzOnN0cmluZzoyMDIxLTA1LTE4VDA2OjQzOjEyLjE1MloiLCJmaGlyVmVyc2lvbiI6IjIyYTg1OTkwLWQyZWItNDg0OS05NDlhLTBlZTQ4YTRhMTU1ZTpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6ImMxN2M2MDI1LWEwYTAtNDE0MS1iYWY2LWY5YzQ3M2U4MGMxODpzdHJpbmc6QnVuZGxlIiwidHlwZSI6IjA4N2UxZGNkLWM3M2YtNDk4Yy1hNmYxLWY4OTRjNGNjMDUxNjpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiY2FkYzgxYTUtYWZmNS00N2UzLTliYWEtNzRhMmE0YThjMzhlOnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIxMzQ5M2ZmMS1jNjJkLTRkNDEtYWEwOS1mZDZlYTU5YjI1ZWU6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6IjRmNmZhNDQwLTllOGMtNDFmZS1iZGY5LWVhYTY1YmE5NGJkZDpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6IjAzNzg5YzQ5LWY0MGQtNDczZi05NDg2LWUwOThkMWFhYTBjMDpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiI4YmYzNTFkMS1iYTU1LTQ4ZDAtYTQwMC01MzE0NTFiOWZjMzI6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6ImJjMmYxNDYxLTQzMTItNDE3OC1hN2UwLWM1NmVlMGRiZmQyNTpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiNmY3MjA2OTAtNWIzZC00NmZkLWFlM2MtMThmMzUxMmZiMmY3OnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6IjlmZjU3NDcyLWNjYjQtNGFmMS1hZGJkLTcyZDA3ZGE3ZDZkMjpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjQ2OGFjNDc2LTE2ZmYtNGYxOS04MTY1LWU3ZmE4ZTlmNWUwMTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6ImMzZmZlZmEwLTc4YzMtNGMwNy1iMmI1LTk0OWUwNTEzNGVjMDpzdHJpbmc6UFBOIiwiZGlzcGxheSI6ImMxMTI0MTZiLTE0NmMtNDg5OC05NDQ2LTM4MjI0ZGM0NWRkMjpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiJkMTYyMzgzZS1lMzA0LTQ3ZGUtYjhmZS0yMDc1NjlmNmIxYTE6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiI3ZDU5MjEyNC0wM2FmLTQxOTMtYjMxYy1jMTU3NGYxNTNjNmQ6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiJiMjIzNTBmOC03ZGM3LTQ1ZTYtYjJjOS1iMzYxMWI4OGQ2ZGY6c3RyaW5nOlM5MDk4OTg5WiJ9XSwibmFtZSI6W3sidGV4dCI6IjJkYTM0ZWFkLWYzNGYtNDc4ZS04OTkwLTFmMTc0ZjQ0NjMwYTpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiYmUwOTYwZGYtMjhiMS00NDRlLWE0MzgtMDk2MmU3MTBkNGVhOnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiIyNWMwOGE3OC02MDY5LTRhZDAtYmNhOC1mZGVlNmRhMjRkYmE6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiODM4Y2FkYmEtYjJkYS00OTU4LWEyZTAtNTk1NGY1MjY2MWVhOnN0cmluZzp1cm46dXVpZDowMjc1YmZhZi00OGZiLTQ0ZTAtODBjZC05YzUwNGY4MGU2YWUiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJmMWFhYjA4MC03MTU2LTQ0ZmYtODMxMi03ZjkxMTUxNGJkZTY6c3RyaW5nOlNwZWNpbWVuIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6ImJhYzRkZTNiLWQwNzctNGRmNC1iZThkLTMwYWU5OTMyZDUwODpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiI5ZmViYmJlMS0wZGZiLTQ5MzAtYjg2MC02MjQwOTNmNjUyMDY6c3RyaW5nOjI1ODUwMDAwMSIsImRpc3BsYXkiOiI2YjJlZDFmYy00OWVmLTQ0NDItYjhkYi1mMWIxYTJjOTMxYjE6c3RyaW5nOk5hc29waGFyeW5nZWFsIHN3YWIifV19LCJjb2xsZWN0aW9uIjp7ImNvbGxlY3RlZERhdGVUaW1lIjoiYzhhM2YyYzQtYTJiMC00MWFiLTg1NzctNzQyYTFmZTg0MzdiOnN0cmluZzoyMDIwLTA5LTI3VDA2OjE1OjAwWiJ9fX0seyJmdWxsVXJsIjoiZDJhZTEwMmQtOWQxMC00YTQwLThiOGMtZDhiNjRmYjhkYzYwOnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJmMDczNWMyOC1iMWI5LTQxYTgtOGRlZi0wY2VlZDUwZTYyOTY6c3RyaW5nOk9ic2VydmF0aW9uIiwicGVyZm9ybWVyIjpbeyJpZCI6IjZlNGE0NWM1LTcxN2MtNDJiYy05MTQ3LTczZTMxYWUwZjE1OTpzdHJpbmc6TEhQIiwidHlwZSI6IjNiZGJlNzVkLTViMmItNDgyMi04ODMwLTRkMDg1NDBlNmY4ZTpzdHJpbmc6T3JnYW5pemF0aW9uIiwicmVmZXJlbmNlIjoiYzk0ZTMxODgtZTc1Mi00YmUyLWIxMjAtZTM1MzU0ZTRhOWEwOnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEifSx7ImlkIjoiM2RmNjkyYWQtNmI0ZC00ODBhLWFhZTctNzkwOGZmMGE2YTNkOnN0cmluZzpBTCIsInR5cGUiOiJlMDIxYjAxOS05MDU3LTQyOTMtOTBhNS1lOTY1NmY4N2Y3NzQ6c3RyaW5nOk9yZ2FuaXphdGlvbiIsInJlZmVyZW5jZSI6IjUyYTcyMGM2LTg2ZWYtNDFmNC1hZTIwLTU2YjI5YzBjZjZkYzpzdHJpbmc6dXJuOnV1aWQ6ODM5YTdjNTQtNmI0MC00MWNiLWIxMGQtOTI5NWQ3ZTc1Zjc3In0seyJ0eXBlIjoiYzNkNTBlYTAtMTEyNy00YmQyLTg0NmYtNjg1Mjc0MjY3YjVlOnN0cmluZzpQcmFjdGl0aW9uZXIiLCJyZWZlcmVuY2UiOiI1N2U2ZjQ4ZC0yMDEzLTQ5MTEtOWI0Ni00YjU4MmEzODE5Zjc6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiJ9XSwiaWRlbnRpZmllciI6W3siaWQiOiI2Nzk1YmNiNi04NjlhLTQ1NTUtYTRjOC0zNTcxMzZjMmI3YjA6c3RyaW5nOkFDU04iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiODJiZDY3ODctNzNhNi00OWM3LWFiYzktNWEyZGIwOTAzNmUzOnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiYmYxZjJlOGEtMGFjYy00MDI5LTg2NjQtMDY5MTA3ZTdkYmIzOnN0cmluZzpBQ1NOIiwiZGlzcGxheSI6IjlkMjM3MTg0LWJkY2EtNDExMS1hMTE0LTQ3YzljNTZmMzMzODpzdHJpbmc6QWNjZXNzaW9uIElEIn1dfSwidmFsdWUiOiJlZDE3ODBiYi0yM2Q5LTQwNGUtYWEyYy1mMzc5NDcwZWMzODk6c3RyaW5nOjEyMzQ1Njc4OSJ9XSwiY2F0ZWdvcnkiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiZTJlZTNiNDMtM2FiMy00YmM4LWI4NDktNmZlZWU2OGVmYjUyOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6ImIxYmU3YmViLWZlZTQtNDRhNi05MjY0LWYzMDgzNGNmMWQxYzpzdHJpbmc6ODQwNTM5MDA2IiwiZGlzcGxheSI6Ijc4OGJkNjU3LWNkNTMtNDc4ZS05ZTg0LTdhNjlmZWZhOWQ5ZTpzdHJpbmc6Q09WSUQtMTkifV19XSwiY29kZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjgwYTkxM2UxLWRhM2EtNGUzNi04NjU3LTUwNGMzOWEzOGRmYzpzdHJpbmc6aHR0cDovL2xvaW5jLm9yZyIsImNvZGUiOiJhYjEzYmQ4Yy1hN2U1LTQxNmItOTljNC0yMWUwMjBiMWJlZjA6c3RyaW5nOjk0NTMxLTEiLCJkaXNwbGF5IjoiOWRhNWE5OWMtYWQ2Yy00N2I0LWIzMmYtNzFhODU1YTMyM2NmOnN0cmluZzpTQVJTLUNvVi0yIChDT1ZJRC0xOSkgUk5BIHBhbmVsIC0gUmVzcGlyYXRvcnkgc3BlY2ltZW4gYnkgTkFBIHdpdGggcHJvYmUgZGV0ZWN0aW9uIn1dfSwidmFsdWVDb2RlYWJsZUNvbmNlcHQiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiI0NWIwMDViOS0xZjE2LTRhOTYtOTZkYi04YzQwNWM4MTk2ZmI6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiMmNiYTVjYmYtOTdiZi00YzM0LTgzNTQtYzNlZWVkZGY4YmEzOnN0cmluZzoyNjAzODUwMDkiLCJkaXNwbGF5IjoiNjBkNTEwZDgtNjExZS00NTYxLTk3NjEtYjVjZTg2ZDA3YTcwOnN0cmluZzpOZWdhdGl2ZSJ9XX0sImVmZmVjdGl2ZURhdGVUaW1lIjoiNjM0YzBkOGQtNWRjNy00Mjc4LTg4NzQtNzlhZTBmNWRjNTYzOnN0cmluZzoyMDIwLTA5LTI4VDA2OjE1OjAwWiIsInN0YXR1cyI6ImY3MDA2ZDQ0LTNiOTUtNDQxNi1hNmI0LWMxNTI0ZThiMWM1ZDpzdHJpbmc6ZmluYWwifX0seyJmdWxsVXJsIjoiOGFmNTMwOWYtZjZjNS00NmI1LTliOGItZTQ5ZDg0MmFiZjVkOnN0cmluZzp1cm46dXVpZDozZGJmZjBkZS1kNGE0LTRlMWQtOThiZi1hZjc0MjhiOGEwNGIiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIyYzg4M2EyZi0wZWI4LTQzOWEtYTYzZS1kMmQxM2E3NjM4MWI6c3RyaW5nOlByYWN0aXRpb25lciIsIm5hbWUiOlt7InRleHQiOiI1YTU0NzBkYS1mM2QzLTRlZDEtYjA3OC04NjE0MWM0ZjM3OGU6c3RyaW5nOkRyIE1pY2hhZWwgTGltIn1dLCJxdWFsaWZpY2F0aW9uIjpbeyJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiMTc3YTY4NmMtMDU5Ni00MmVmLTk2YjQtMTIyYjQzNjI2Y2U2OnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiNDg2YjUxMjgtMDUwNy00M2EyLWExNjctZmQ0MzIxMWY1ZTY3OnN0cmluZzpNQ1IiLCJkaXNwbGF5IjoiYWQwZmRmZjctYjczNC00NmJkLWI2NzAtNjdjYWNiZTg1OWYwOnN0cmluZzpQcmFjdGl0aW9uZXIgTWVkaWNhcmUgbnVtYmVyIn1dfSwiaWRlbnRpZmllciI6W3siaWQiOiJiZTgzZjhhZS1hNjE2LTRiMGYtOWFjMy1mYzExMDMzNGM5NzA6c3RyaW5nOk1DUiIsInZhbHVlIjoiYzAxMGE5N2UtYzIxMS00YmFmLThhNjItYzAyMzRjZmM3MjFjOnN0cmluZzoxMjMyMTQifV0sImlzc3VlciI6eyJ0eXBlIjoiNGY4NWExYmYtNGI2Yy00ZjM3LTkwNGItY2NhNjA1ZTM5NTQ5OnN0cmluZzpPcmdhbml6YXRpb24iLCJyZWZlcmVuY2UiOiIwMDE3YjliNS00YjVlLTRiZGMtOWUwNi03NGRmMDY1MWU2ZTQ6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSJ9fV19fSx7ImZ1bGxVcmwiOiI3YmI0OTFmZC01NDZlLTQ3ZGEtOWY0OS02M2M0ODhiMGVjMmM6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjAyYjE1MWM5LTQ1NmEtNDdiMS04NGNiLWYyODRjNTg3NGE5YzpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjU0ODUwYTVjLWFhYjAtNGZiNi05ODU3LWVmNDY5ZThjNGNmNzpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoIChNT0gpIiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiI4MzY4YzM1NC03MWY2LTRjZWYtYjg1MC01ZmEyZWRkYmE5NDM6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiYTc0MjE2MGUtMzE0MS00ODgwLTk5MWQtNDU5YzA3YzdlOWU4OnN0cmluZzpnb3Z0IiwiZGlzcGxheSI6IjM2NTcyOWVhLTJhNjAtNGEzYy1iZTkzLTk0YTg2M2Y3YTU2OTpzdHJpbmc6R292ZXJubWVudCJ9XX1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiIyYjgzNjQwOC0yODI2LTRmMjAtOTViNS04MmNjMDg0YjUxY2Q6c3RyaW5nOnVybCIsInZhbHVlIjoiOGQzMWFiMmQtYzE1Mi00YzdhLTg1ODktZjQwY2E2NDEyYzRlOnN0cmluZzpodHRwczovL3d3dy5tb2guZ292LnNnIn0seyJzeXN0ZW0iOiI5MGEyOGZhNC1mMGEyLTQ5OWYtOTk5My05ZDA2YzNlZjY2ZmM6c3RyaW5nOnBob25lIiwidmFsdWUiOiI0OTU3YjNiZC0wMDA2LTQ5ZWItYjZjNi0yZGZhNWZmNWI1MmQ6c3RyaW5nOis2NTYzMjU5MjIwIn1dLCJhZGRyZXNzIjp7InR5cGUiOiJhNTYzODU5Ni0wYTAxLTQ5ZWUtYmUyNi02ZWYzZWQ0N2FlNjY6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiNjFjMTdiYTQtYWQyYi00MzZjLWIwYzQtZWM5YzMwMTc4MGI3OnN0cmluZzp3b3JrIiwidGV4dCI6ImI4Y2MyOTA0LTA3N2YtNDZlNS1iZjI0LTlhZTY2OTU2ZmY0NDpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoLCAxNiBDb2xsZWdlIFJvYWQsIENvbGxlZ2Ugb2YgTWVkaWNpbmUgQnVpbGRpbmcsIFNpbmdhcG9yZSAxNjk4NTQifX1dfX0seyJmdWxsVXJsIjoiNjQ2MzJlNzktNzdjZC00M2YyLWFlZTItNzA3ODVkODMwNzNlOnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIyYmZiZmY1My1lOThkLTRlZDItOTY4My00MzZjZDY2NzE1NTA6c3RyaW5nOk9yZ2FuaXphdGlvbiIsIm5hbWUiOiI0ODc1ZjQyZS05ZDY5LTQyNTctOWE5OS1mMzI0Yjc4ODE2YTE6c3RyaW5nOk1hY1JpdGNoaWUgTWVkaWNhbCBDbGluaWMiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6ImQzOGZiYjg4LWRlZTUtNDUzMi05NzE5LTc5OWI5NDQ4NWM4NTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiI4OTJhYjc3NS0wYTNlLTQwNmItYWEyZi0yZWI3NzkxMzIxYzI6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiNDExYzI3MjQtM2JmYS00ODVmLTlkMmItNDNiYTU3ODlkMTkyOnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiMjFkODBiOTEtMTZiMi00Njg1LWI3YTMtNGY1ZWE0MDI0MmNkOnN0cmluZzpMaWNlbnNlZCBIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiI4ODc4OWYxYy1mZjEwLTQ3OTAtYmI2Yi1kNDgzY2FlZWZjNzY6c3RyaW5nOnVybCIsInZhbHVlIjoiZjJmYjVjMjMtNDJlZS00MDA4LWEzOGMtMmRlZTE3NTIzYWY2OnN0cmluZzpodHRwczovL3d3dy5tYWNyaXRjaGllY2xpbmljLmNvbS5zZyJ9LHsic3lzdGVtIjoiZWQ5MWM0NDYtYTY2Mi00OGVjLThkMDctOGMxMmMyZDM1ZDg3OnN0cmluZzpwaG9uZSIsInZhbHVlIjoiOGFhZWZiOTAtN2M2My00MTAzLWIyNGItM2I2NDRiOGI0N2MxOnN0cmluZzorNjU2MTIzNDU2NyJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiZTU1NmQzMDMtYmNmMC00ZDVkLWIxNjUtNDlhZjVmNjlhOTAzOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6IjJkY2Y5YWY5LTE3N2YtNGUxNi04MGIxLWJiZmViYTQyNmIzMDpzdHJpbmc6d29yayIsInRleHQiOiJhMjg4NDRmYi0xMmRlLTQxNTktYWI1Yy1iNTRiNTEwZjZkNzE6c3RyaW5nOk1hY1JpdGNoaWUgSG9zcGl0YWwsIFRob21zb24gUm9hZCwgU2luZ2Fwb3JlIDEyMzAwMCJ9fV19fSx7ImZ1bGxVcmwiOiI2MWQ5ZmZjNi0wM2QzLTRkZDAtOTBlMi1hYTFkNzY5MzQ5NDA6c3RyaW5nOnVybjp1dWlkOjgzOWE3YzU0LTZiNDAtNDFjYi1iMTBkLTkyOTVkN2U3NWY3NyIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjkxZjI0MjI0LThkZjktNDVmNS1iNzI5LTAzNzhjNDQ5YmI4OTpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6IjllNDJkYTEzLTU2MzktNGQ0My05NjRjLWM1ZjNmNGU5OWJlNTpzdHJpbmc6TWFjUml0Y2hpZSBMYWJvcmF0b3J5IiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiI3MzdjOGYxZC01OGZlLTQ2MTItOWViMy0wNmY3NWYxOGIzOTA6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiNzczYWJjNTMtMjViMy00OTA4LTlhNTUtZDE4MzVhOTA4NDUzOnN0cmluZzpwcm92IiwiZGlzcGxheSI6ImE3MjQyMDdmLWYyY2UtNDg3Yy04NjlmLWU4YmEzMjQ1OGYxODpzdHJpbmc6SGVhbHRoY2FyZSBQcm92aWRlciJ9XSwidGV4dCI6ImE1MWI0YzkxLWY4M2UtNDliMy1iMWVlLTYxZGFkMTRkNmRlNjpzdHJpbmc6QWNjcmVkaXRlZCBMYWJvcmF0b3J5In1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiI3MGVmYzA3MS1mNmI4LTQ0OTEtYmMyMy1jOGVhNWQ0ZGQ2ODg6c3RyaW5nOnBob25lIiwidmFsdWUiOiJkMmEyZWU5MC00ZTIxLTRlN2EtODZhMS00NDZiZmE3OTY4YjY6c3RyaW5nOis2NTY3NjU0MzIxIn1dLCJhZGRyZXNzIjp7InR5cGUiOiJmMDI0Mjc0NS0yMGE0LTQ4N2MtOGNlYy03ZDkwOWNkNzg4YTY6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiMTI3M2E0NmMtYWYxYy00NjJiLThiMTgtZTkwMjc2MzgwODdmOnN0cmluZzp3b3JrIiwidGV4dCI6IjlhOTBhNzNiLTNlNWMtNDJjMi1iZmFkLWNlZmY4MzFhNWM0NzpzdHJpbmc6MiBUaG9tc29uIEF2ZW51ZSA0LCBTaW5nYXBvcmUgMDk4ODg4In19XX19XX0sImlzc3VlcnMiOlt7ImlkIjoiYzg4Y2E4NmItOWE1MC00YmE1LTg3YTEtZTVmNGU0YThhNDM3OnN0cmluZzpkaWQ6ZXRocjoweEUzOTQ3OTkyOENjNEVmRkU1MDc3NDQ4ODc4MEI5ZjYxNmJkNEI4MzAiLCJyZXZvY2F0aW9uIjp7InR5cGUiOiI0ODJmMjc2NS04NDFkLTQzZGQtYmU1OS1kMzg3Njk0NDliNzU6c3RyaW5nOk5PTkUifSwibmFtZSI6IjU1OGM1MTg2LTVmM2ItNDJkYy1iYzY2LWY5YzQ1YjkxNWVlODpzdHJpbmc6U0FNUExFIENMSU5JQyIsImlkZW50aXR5UHJvb2YiOnsidHlwZSI6ImMxNDM5MzJjLWY4MWUtNGM1Ny05OWE1LTE5YzZjMTdlMDIxOTpzdHJpbmc6RE5TLURJRCIsImxvY2F0aW9uIjoiM2IyYTdiMjktNDk4My00M2Y0LWI4OWMtNmRiMTEwN2MxMTRlOnN0cmluZzpkb25vdHZlcmlmeS50ZXN0aW5nLnZlcmlmeS5nb3Yuc2ciLCJrZXkiOiJlM2M0Y2ZkZS02NTU4LTQ4ODktYWU2ZS1mZjMxZDcxMjAxNDA6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIn19XSwibG9nbyI6Ijg0YmU4YmIzLTUwMTgtNGNmZC1iMmE5LWU4MTZlZTM1MjRkZDpzdHJpbmc6ZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFmUUFBQURJQ0FNQUFBQXB4K1BhQUFBQU0xQk1WRVVBQUFETXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNemVDbWlBQUFBQUVIUlNUbE1BUUwrQTd4QWduMkRQM3pCd3IxQ1BFbCtJL1FBQUJ3ZEpSRUZVZU5yc25kMTIyeW9RUnZrSElTSE4rei90eVVrOW9URUNRMWJUQmMyM2J5TnMwQjVHSURBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFrK0lrK0lkeDRnNU40QjlHUS9yUEE5Si9JUGZTZ3dML01FRUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEd1A1WlBvUDVyN0ZKS0FmN2N1ZkJpaFBOU2tYNWhsQTl1K0RzUDdkWC9KSzFQMlZQaVNJb2ViRXJMd1ZoNVp4KzhDMVkyMll0UDBGcGY2aGRlYSttcTFXbGl4ZmVqNlJjRHhqMDlzd1hiYmVCUXBpanVnMjBhai9TRThidm81aEV1YXZBdVNLcFFmSnhURzkxZ1VyQ1Y2alNRRTBvUGtlNHd1a2U3MDVFcXBMTld4dE10U2s0anZYR2xkK3RMbHh2Vk1ObmFrRDdtRW5kWVRWV1NuVjg2MFdVWGwzNFJNeTdCZW1weUd6TjdwQWJtWEVBNmJmdkswdTMydVRGS0tWTTByMFl3MU1UY0Z2cDhpVkxQRDArOWdIUXkrN3JTZjNlZWpwMkh1RmNzbWxkaUV6MEZ6S1hmU1J3M3FlMDhYcWQ5ZFA2UUtPTm5rdTRsRzNOU2IvUkJ0S3RLdDF0dGRCSmlZYjJWSTdicmM3dGM4SVlvdEp6SFVCMGMrTytUM3JUUXVMS3NaUnFwemtUUzdkWkk0dm8rcUpuZEVHTzhFemVjeWphYzYvSVROMktPV2FVTElUL2FMZGVVbnFwZGk3VlcyK0t5YzI5RkwzczdlM2hpNUxUU2hlV1dweVdsSDRYem12V2puaU9pRk4zWVdEaXZXSTkyV3VrNWN0MkMwcDNKemw5WU42NldJNUlWL1Z5Rjg2cjFhMTdwSDVVTUMwcFgvRHdYVlU1MjRLczVZZ0RabUw0ekd6MXc4MHAzM1BqMXBNdmNpK3RjMmNGSWptaEgyZFdWZnVhVkx1TGp5OWVUemdxT3JxZXd2MHZ1bS8xS1I0KzJhNkRoNXBYTzdWOU8rczRLUkpQQUR1eE5qdGpGQ0NrL0NsdEV6Z2Z6U3RlclN2ZFpRWmVEb3l5cXhRZ3VSMWxYbUJsSS85UFNlYlpwYk9lOGJpdnQyYkZLOVlhSzRlSGU3TkxOYXRMUDNxR1lMZkw3MVJvTXZCNlh1OTZKM1RXdDlMVG9RTTV6bThZZnhiSElFU1BaWFhXL3RvdlRTbytQcUZ4TmVzd1pxak8vWDA5T3ZCZ2k5T2NIdzdsbFV1a2N2K2RpMHJuZXFmOTl1WG9LZ2xNTXdhbGw3eC9teTBtbFA1cGlWbnYzZnVaKzE5M3hucFRZTHozU2plalBMWHBPNlR0WGJ6WHBmSVVjZUpIbVBzWEFKc2JJK2FMN2Z2c3BwVnNPWDd1YWRKOUZ2dVQ2M1B4c1pBUTNVTXh5Z0x5V3ZzazYvbHVrdTQwZmI4dHRvbERGRmIxWlFRNi9tUmt2MWlXOWkxSjZDLzFhZWpBY3ZRUFZtVXQ2RkIyY24yNkp6RE80VHNhTGNXZWFUYm83SW4wNFgwODY5Nlh4VG5ya216R0NIaW1tSnBMdU5hUGk3MWYrS09rdGU1SUs5T3JTNzRpbmdQU2ZKZDFvSVNEOVowbS9oUGhCMG8rL0xkM01NR1VyU1U2OHM5eVV6WFNPM3N1aFcrQmgrSmowb3l6MnNuWnFncGN6ZDVpd3B2UnZtS2ZYcFkvUDB5ZVNmc2dIT2hsaXd0TFM3Y0JTaVIxYVpGUDMwcStCdDNmWGJLOWhRMlRyKzRyU2MrOGRmbFhDTzJsNnBZK1BJczVwRjF4czRrbWJYVkI2ejBKV1JSZEgrNkIwdzhWZW95ZGVXbFY4NHhhVUxudlgwOHZFek5uK0hKT3UrdGZUMWNTYktQTGV3dldrYy9jMS9ZdHM0U2xKK0RIcHVuc0YzMDY5WFNydzdWaFFlbDRnSE4zUXVITzhqRWsvTzhjQytVby9wWFIrdkcwTFNuL1pYeGxYeUlvYzYwUFNoZWxkd3ZkemI0SFczSTcxcE8vMHdIWXFPSXA4djQxSlQ1MlROamY1angyNGZtRTk2V0xyRzcvYnNvTTZlaENHcEo4czAvWlYzazhxblRPZFgxQjY2SE9nYjRiNUtSZnRsNTRmQzdvdnl2WlpwWHQ2Snk0bzNacWVkT3ZNVGRzbFBVaEQwcmxXeHZWTUZ0UzBQMVVPblB2V2s4NFhkYjBESVhXL2tIaU1TTGVtN3JNTUtEbXQ5SjBIbWd0Sy8zQmc3R2hnT0dMQ2dQVDhhZnAxcGRURXg0ODg2bmd0S0YyYzlPcHNnVkRiT0tDSk9RYWtpKzFWckZpK3dyaUpwZk5hL29yU2hjclcyODZqTFlzeXlmWkxsOFNFdG5NNjVqMVNMSCt3WFZHNmpjMERZSTk4NkZ1aktKblFMVjBjMU1ydzdzTzVuL2Z3d0Rma29qOWdmRDRvemh5RkFVVk1xQlJsWXJDZDBvVW5ScmtpeUV6T1BGTkxGelR6VDVWbEJYZDNPbThvemtCdE9PZERQWmtVOWs5L1BDcExrSGFyblpVZkloWE92MC82SVN2MFNPY3ZqLzFiOXR6ZmtONUczeDdlYmRJaDM0V2ZGNnRwRHJyWUs2UFVwZC80ZkpTM2JwWGFydE9KTitTUkRCWE92MGw2bTZFeloxejM1bHc5azNSTzAxV01GQlU0SDQrMjFsTWJiOFhzMHZsdllWSHAzUFVxS0NjYU9EVXNuYk5MU1I1Y1RDK2RaK3BwVmVsQ25LYTExN2VOVE5Ra1NWRmlVMnRQK1FyU09WdlpaYVVMcXd2dFBDaC9qZE1iM1JOOTlRT2tvanY4THNRUzBrL083K3RLZitOTVQ5Nk5QMFV2THZpblJtOUpuMjR3VnJiRENiR0lkRjR4VkJOSi94SlNlNlVlby9Cai85SS83RHkwUHZybkp5NW9wU0lSUlpYMGFRVUFBUHpYM2gzVUFBQ0FRQXg3WUFEL2FuRkJDTmRhbUlBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREFtbW9lSzlIemlCNUk5RUJYbng4QUFBQUFBQUFBQUxCbUFJWktteldJbnh5T0FBQUFBRWxGVGtTdVFtQ0MiLCIkdGVtcGxhdGUiOnsibmFtZSI6IjdjOTA5NWE3LTk0OTctNDQ0OS1hYjhkLTA0YzgzOTBjZWE1MDpzdHJpbmc6SEVBTFRIQ0VSVCIsInR5cGUiOiI2N2M5MjRlYS1mYTQ0LTRkNjQtOWIxMS0wNmFjYTcxYjEwMDA6c3RyaW5nOkVNQkVEREVEX1JFTkRFUkVSIiwidXJsIjoiNTc3NWI5YjAtMDRhNC00ODlmLTg4YmItNzI0MWNiNTU1YTRmOnN0cmluZzpodHRwczovL21vaC1oZWFsdGhjZXJ0LXJlbmRlcmVyLm5ldGxpZnkuYXBwLyJ9fSwic2lnbmF0dXJlIjp7InR5cGUiOiJTSEEzTWVya2xlUHJvb2YiLCJ0YXJnZXRIYXNoIjoiZTU5NDA1MjQ0OGRmNzk4ZmI2YTBiYWU2NTdlOTQwZTBmMGM2MjdjMjdlZDIzNTE1OWQ4ZjdjOTVkZWVkYzc4NyIsInByb29mIjpbXSwibWVya2xlUm9vdCI6ImU1OTQwNTI0NDhkZjc5OGZiNmEwYmFlNjU3ZTk0MGUwZjBjNjI3YzI3ZWQyMzUxNTlkOGY3Yzk1ZGVlZGM3ODcifSwicHJvb2YiOlt7InR5cGUiOiJPcGVuQXR0ZXN0YXRpb25TaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjEtMDgtMTdUMDc6NTY6NDEuODMyWiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIiwic2lnbmF0dXJlIjoiMHg5NjBmZjhhMDY3NDAxOWViOTk3NDIxMzQ5MTQyZGIzYzc5OGQ1ZGQ2ZDQ5NWI3OTA0ZjZkNGIzZmM2NjgzYjEzNjNjNzk4ZTM4ZjQ1YzM1ZWJjN2IyMjUxZWQ1MDUyNTY2NmM5NTMxNzFiOWM2MWU5MTk0MjE3YWQ1NGRhMGUxMzFjIn1dfQ==",
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
      "validFrom": "2021-05-18T06:43:12.152Z",
      "version": "pdt-healthcert-v2.0",
    }
  `);
});
