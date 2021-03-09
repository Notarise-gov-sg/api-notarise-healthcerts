import { getData } from "@govtechsg/open-attestation";
import { createNotarizedHealthCert } from "./createNotarizedHealthCert";
import exampleHealthcertWrapped from "../../../../test/fixtures/example_healthcert_with_nric_wrapped.json";
import { mockDate, unmockDate } from "../../../../test/utils";

const sampleDocument = exampleHealthcertWrapped as any;
const uuid = "e35f5d2a-4198-4f8f-96dc-d1afe0b67119";
const storedUrl = "https://example.com";

beforeAll(mockDate);
afterAll(unmockDate);

it("should wrap a document and sign the document", async () => {
  const createdDocument = await createNotarizedHealthCert(
    sampleDocument,
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
          "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiYTFjMmQyODItNmMxZi00ZTQyLWEzMzUtZTg4OGRhNGQxYjM0OnN0cmluZzpURVNUMDAxIiwibmFtZSI6ImMyNzI3NTNkLWRjYTItNDk5Zi1iNTQzLTM4MTQ0OWU4NTA3NDpzdHJpbmc6SGVhbHRoQ2VydCIsInZhbGlkRnJvbSI6IjhjMWVlYWVkLWU4MTItNDliMi1iZTY2LTg2OGIxZmNiNDJmZTpzdHJpbmc6MjAyMC0xMS0yMCIsImZoaXJWZXJzaW9uIjoiNTg2ZDQ4NjEtYzlmZC00ZmE4LTk0NmEtMWIwZGJiMzY2MWM5OnN0cmluZzo0LjAuMSIsImZoaXJCdW5kbGUiOnsicmVzb3VyY2VUeXBlIjoiM2ZkOWI1MjAtN2JiYS00NzczLWJjMTgtMTZmMGY1N2U0NjlmOnN0cmluZzpCdW5kbGUiLCJ0eXBlIjoiMGRkNDZkZGEtODY0Yy00ZTgwLWI0NmUtYzc4MDE2MjFmYzdmOnN0cmluZzpjb2xsZWN0aW9uIiwiZW50cnkiOlt7InJlc291cmNlVHlwZSI6IjdkMTI5MWJiLWIxMTQtNDI0Yi1iMDY2LTE1ZmQyMmFlOWRiNTpzdHJpbmc6UGF0aWVudCIsImV4dGVuc2lvbiI6W3sidXJsIjoiMmVlNGRmNjItYjViZS00MWQ0LWI4ZWYtYWI4ZTE4NTdlMjA4OnN0cmluZzpodHRwOi8vaGw3Lm9yZy9maGlyL1N0cnVjdHVyZURlZmluaXRpb24vcGF0aWVudC1uYXRpb25hbGl0eSIsImNvZGUiOnsidGV4dCI6ImVhOTUzMmQ1LTlhMmQtNDRlYS05ZDFlLTlmZDMyN2M4MzY0NTpzdHJpbmc6U0cifX1dLCJpZGVudGlmaWVyIjpbeyJ0eXBlIjoiMDExYzEzYmUtMzE5Ny00ZDA4LTk0ZTMtYzNkMzExZTgxNjNkOnN0cmluZzpQUE4iLCJ2YWx1ZSI6ImEwZTE0YTUwLTZkMGUtNDk4Ni1iYWE1LThmMmQyZDZkNTZlYjpzdHJpbmc6RTc4MzExNzdHIn0seyJ0eXBlIjp7InRleHQiOiIyZmUyZjIzMy05MzBmLTRlYmItODFmZi1iYmI1MzdhM2Y3ZjI6c3RyaW5nOk5SSUMifSwidmFsdWUiOiI4ODkyMTc2Zi0yZGMzLTQ0ODctOTc1Ni1iOWJmNWUyN2EwYmI6c3RyaW5nOlM5MDk4OTg5WiJ9XSwibmFtZSI6W3sidGV4dCI6IjM0OGY0YThiLTBiMTktNDkyZi05YThhLTk0MTkxZjE3NDg1YzpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiNWE3MWI3Y2ItMWNkNy00NzBjLTgzMWItYzBiMDkzMDJmMmZjOnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiIzN2ZhODRjNy0yMjg1LTQ0N2EtOTRmOS04MWUyMzA2MTY2MTE6c3RyaW5nOjE5OTAtMDEtMTUifSx7InJlc291cmNlVHlwZSI6IjQ2NjUxMzk3LTlhMzAtNDFkYS1iOGQ1LTVlMzk2MTRjMzM1YjpzdHJpbmc6U3BlY2ltZW4iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiYWM5NjQ3ODAtOWFiNS00M2U2LTg3NmMtN2Y2M2IxMjIxNDlkOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6IjgwYTM3YTM0LWZhYjEtNGZjOS1iOGFjLWUzNGVkYTZhNDA2YTpzdHJpbmc6MjU4NTAwMDAxIiwiZGlzcGxheSI6IjdmMDFmMGUwLTIxN2UtNDFhYi04MTA1LWUzOGYwMmViNWUxNzpzdHJpbmc6TmFzb3BoYXJ5bmdlYWwgc3dhYiJ9XX0sImNvbGxlY3Rpb24iOnsiY29sbGVjdGVkRGF0ZVRpbWUiOiI1MjcwODc5Yi05OTBkLTRlN2EtYmM3Ny1jNWU5ZWJkZjM5NWY6c3RyaW5nOjIwMjAtMDktMjdUMDY6MTU6MDBaIn19LHsicmVzb3VyY2VUeXBlIjoiNjY2M2I0NjEtYWYwYy00YTI0LWI3ODgtNThiOGY3MjM3NjE5OnN0cmluZzpPYnNlcnZhdGlvbiIsImlkZW50aWZpZXIiOlt7InZhbHVlIjoiNzFlYmNkYWMtOTU1My00MmFmLWE3M2ItNmJlYTQyNmM3MzVhOnN0cmluZzoxMjM0NTY3ODkiLCJ0eXBlIjoiYzQxMjliMWMtY2U5NC00ZDk5LWI4NTktMjc2NzQ2OTJlYzc2OnN0cmluZzpBQ1NOIn1dLCJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiMzdkZDBjMTMtZGMxMy00ZDY4LWFhZDYtMzgwOGMzNzg2NWViOnN0cmluZzpodHRwOi8vbG9pbmMub3JnIiwiY29kZSI6IjUwYmUwOWE4LTAwNzMtNGUxMS1iMGNkLWZjOTg5NGM4OGYzMjpzdHJpbmc6OTQ1MzEtMSIsImRpc3BsYXkiOiI5YmYxOWFkNC1jMTFiLTQzOWUtOWUxNS05ZTJmODhiZGY5Nzg6c3RyaW5nOlJldmVyc2UgdHJhbnNjcmlwdGlvbiBwb2x5bWVyYXNlIGNoYWluIHJlYWN0aW9uIChyUlQtUENSKSB0ZXN0In1dfSwidmFsdWVDb2RlYWJsZUNvbmNlcHQiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiI0YWQ1ODBiNS1iYWQ2LTQxZjEtYmJkYS0xZDlmNGY5ODFiY2M6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiNWM2NTRlMWUtNmNjOS00NGViLTllOTktNGU5ZGVjZDU2ODZjOnN0cmluZzoyNjAzODUwMDkiLCJkaXNwbGF5IjoiNzI2Y2E5NjgtMjk0MS00Yzc2LTg3MWQtYWM1N2JhOWNkMDVmOnN0cmluZzpOZWdhdGl2ZSJ9XX0sImVmZmVjdGl2ZURhdGVUaW1lIjoiYzhlYzhhNWYtYWY1ZS00MzYyLTgwM2YtZGMyNzAwM2ZhYjEzOnN0cmluZzoyMDIwLTA5LTI4VDA2OjE1OjAwWiIsInN0YXR1cyI6IjFlYTBkZmE5LWRiMzQtNDFlMy1hNDkwLWRkZWQ0YjM1NGExOTpzdHJpbmc6ZmluYWwiLCJwZXJmb3JtZXIiOnsibmFtZSI6W3sidGV4dCI6ImE3NzI1MDE5LWNkNDYtNDEyNS05MDAzLTdmNDE2NGMyOTY2MjpzdHJpbmc6RHIgTWljaGFlbCBMaW0ifV19LCJxdWFsaWZpY2F0aW9uIjpbeyJpZGVudGlmaWVyIjoiMDExMTY1OWEtNTRhMi00MjYwLWJlMzUtZDNlMmQzZmVlYTAwOnN0cmluZzpNQ1IgMTIzMjE0IiwiaXNzdWVyIjoiZjQzNTRjYzQtYzJhOS00YTk2LWE1OTQtODE1YmNkY2FmNjdjOnN0cmluZzpNT0gifV19LHsicmVzb3VyY2VUeXBlIjoiNDc0ODg4NjYtNjkyMC00MWIwLWJjNzMtMDM1ZmMxMDY3MDFmOnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiNzc3OGM2ZTgtZTI5My00NzJiLWJiNmEtNDNmMWFiNDg1YzlkOnN0cmluZzpNYWNSaXRjaGllIE1lZGljYWwgQ2xpbmljIiwidHlwZSI6IjA0OGQ1ZGM4LTg1ZmMtNDQyZC1hMThlLTdmY2UwNDk0ZDczNTpzdHJpbmc6TGljZW5zZWQgSGVhbHRoY2FyZSBQcm92aWRlciIsImVuZHBvaW50Ijp7ImFkZHJlc3MiOiI5NjkzYjdhOS0yMzI5LTRiOTgtODVmNi1hNThjNWNlNGI5ZTU6c3RyaW5nOmh0dHBzOi8vd3d3Lm1hY3JpdGNoaWVjbGluaWMuY29tLnNnIn0sImNvbnRhY3QiOnsidGVsZWNvbSI6W3sic3lzdGVtIjoiYjU5YjI2NDYtNWVjYi00NWM0LThmOGEtODAwYzBjMWI4MDhmOnN0cmluZzpwaG9uZSIsInZhbHVlIjoiZjk5MDMzNjYtMTgyNS00Njc5LWI1MzUtNjk5ODdkZGQyYWQ5OnN0cmluZzorNjU2MzExMzExMSJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiYmY0OTE0NDYtMDAzMy00NzBlLThhOTQtMjc4ZmIyNWRkZDY2OnN0cmluZzpwaHlzaWNhbCIsInVzZSI6Ijc0ZTEwMTMzLTcyNTUtNGRjNy04NjNiLTgxYjA1MDZiMWFhMjpzdHJpbmc6d29yayIsInRleHQiOiI3NjFlNDI0OC1iNTI0LTRjODctOGM0ZC0xZDYyZTg3ZjhjZWY6c3RyaW5nOk1hY1JpdGNoaWUgSG9zcGl0YWwgVGhvbXNvbiBSb2FkIFNpbmdhcG9yZSAxMjMwMDAifX19LHsicmVzb3VyY2VUeXBlIjoiMTE3YzhjNjQtYzcyNy00ZGY2LWE3YjItMGE1Mjk3YTZjZTFhOnN0cmluZzpPcmdhbml6YXRpb24iLCJuYW1lIjoiMjQzYTliN2ItMzczOC00MWIzLWJiNzQtMGFjY2IyYzFmYWNjOnN0cmluZzpNYWNSaXRjaGllIExhYm9yYXRvcnkiLCJ0eXBlIjoiOTNiMzI4ODgtOTI2MC00NWYyLWE4ZTAtOTE3YzkwOWRiZThkOnN0cmluZzpBY2NyZWRpdGVkIExhYm9yYXRvcnkiLCJjb250YWN0Ijp7InRlbGVjb20iOlt7InN5c3RlbSI6IjM4MDY3NDQ1LTNkNDctNDYyNS1hYjE0LTNmNjk3MjlkODYwYzpzdHJpbmc6cGhvbmUiLCJ2YWx1ZSI6ImUzNDU2MWNlLWQ0MGEtNDE4NC05ZGRkLTM3ODU3OTIzMjg3ZTpzdHJpbmc6KzY1NjI3MTExODgifV0sImFkZHJlc3MiOnsidHlwZSI6ImNjNTcwZDBkLTUzOWEtNGY0Ny05MjExLTlkMWYzMzZkZmVjMjpzdHJpbmc6cGh5c2ljYWwiLCJ1c2UiOiJjMjViZTJhNS04NjUzLTRjZGMtOWQ1ZS0wNjM5OTBmZjY2M2Y6c3RyaW5nOndvcmsiLCJ0ZXh0IjoiOGI0OGYzYzAtNTc1NC00ZmQ3LTk5YTgtMjM0NDNmNDRlOGMzOnN0cmluZzoyIFRob21zb24gQXZlbnVlIDQgU2luZ2Fwb3JlIDA5ODg4OCJ9fX1dfSwiaXNzdWVycyI6W3siaWQiOiI3YzZhNWFmMS1hMTg3LTQ5NTktYjk5My1iYzg1NmZiN2MzYzc6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCIsInJldm9jYXRpb24iOnsidHlwZSI6IjhmNmY2OGI0LTQwNzMtNDc5Ni05YTlhLWI4MDM3NmUzNTk4NjpzdHJpbmc6Tk9ORSJ9LCJuYW1lIjoiNGQ2MTRiYzctNDk2NC00YmI5LTkyYjYtNGM4YWQzNmQ3ZTgwOnN0cmluZzpTQU1QTEUgQ0xJTklDIiwiaWRlbnRpdHlQcm9vZiI6eyJ0eXBlIjoiNjI3YmE4NjYtYjcxNC00MTcyLWJiOGUtYmFhYzcwYzdmYzJkOnN0cmluZzpETlMtRElEIiwibG9jYXRpb24iOiI5ZGRlN2RjOC1lMTk4LTQ1ZDItYmJjNi1jYzg2NDgyMWEwMzQ6c3RyaW5nOmRvbm90dmVyaWZ5LnRlc3RpbmcudmVyaWZ5Lmdvdi5zZyIsImtleSI6Ijg5MjRjOWRhLTYzNjQtNDZhZi04MTc1LTAzMDM1OTk5NWNkNDpzdHJpbmc6ZGlkOmV0aHI6MHhFMzk0Nzk5MjhDYzRFZkZFNTA3NzQ0ODg3ODBCOWY2MTZiZDRCODMwI2NvbnRyb2xsZXIifX1dLCJsb2dvIjoiOGU5NDFkY2ItM2MzNi00NGZiLWFlZTEtODgxMzY2MzQ2ZGY4OnN0cmluZzpkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQWZRQUFBRElDQU1BQUFBcHgrUGFBQUFBTTFCTVZFVUFBQURNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16ZUNtaUFBQUFBRUhSU1RsTUFRTCtBN3hBZ24yRFAzekJ3cjFDUEVsK0kvUUFBQndkSlJFRlVlTnJzbmQxMjJ5b1FSdmtISVNITit6L3R5VWs5b1RFQ1ExYlRCYzIzYnlOczBCNUdJREFSQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQWsrSWsrSWR4NGc1TjRCOUdRL3JQQTlKL0lQZlNnd0wvTUVFQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUR3UDVaUG9QNXI3RkpLQWY3Y3VmQmloUE5Ta1g1aGxBOXUrRHNQN2RYL0pLMVAyVlBpU0lvZWJFckx3Vmg1WngrOEMxWTIyWXRQMEZwZjZoZGVhK21xMVdsaXhmZWo2UmNEeGowOXN3WGJiZUJRcGlqdWcyMGFqL1NFOGJ2bzVoRXVhdkF1U0twUWZKeFRHOTFnVXJDVjZqU1FFMG9Qa2U0d3VrZTcwNUVxcExOV3h0TXRTazRqdlhHbGQrdExseHZWTU5uYWtEN21FbmRZVFZXU25WODYwV1VYbDM0Uk15N0JlbXB5R3pON3BBYm1YRUE2YmZ2SzB1MzJ1VEZLS1ZNMHIwWXcxTVRjRnZwOGlWTFBEMCs5Z0hReSs3clNmM2VlanAySHVGY3NtbGRpRXowRnpLWGZTUnczcWUwOFhxZDlkUDZRS09Obmt1NGxHM05TYi9SQnRLdEt0MXR0ZEJKaVliMlZJN2JyYzd0YzhJWW90SnpIVUIwYytPK1QzclRRdUxLc1pScXB6a1RTN2RaSTR2bytxSm5kRUdPOEV6ZWN5amFjNi9JVE4yS09XYVVMSVQvYUxkZVVucXBkaTdWVzIrS3ljMjlGTDNzN2UzaGk1TFRTaGVXV3B5V2xINFh6bXZXam5pT2lGTjNZV0RpdldJOTJXdWs1Y3QyQzBwM0p6bDlZTjY2V0k1SVYvVnlGODZyMWExN3BINVVNQzBwWC9Ed1hWVTUyNEtzNVlnRFptTDR6R3oxdzgwcDMzUGoxcE12Y2krdGMyY0ZJam1oSDJkV1ZmdWFWTHVMank5ZVR6Z3FPcnFld3YwdnVtLzFLUjQrMmE2RGg1cFhPN1Y5TytzNEtSSlBBRHV4Tmp0akZDQ2svQ2x0RXpnZnpTdGVyU3ZkWlFaZURveXlxeFFndVIxbFhtQmxJLzlQU2ViWnBiT2U4Yml2dDJiRks5WWFLNGVIZTdOTE5hdExQM3FHWUxmTDcxUm9NdkI2WHU5NkozVFd0OUxUb1FNNXptOFlmeGJISUVTUFpYWFcvdG92VFNvK1BxRnhOZXN3WnFqTy9YMDlPdkJnaTlPY0h3N2xsVXVrY3YrZGkwcm5lcWY5OXVYb0tnbE1Nd2FsbDd4L215MG1sUDVwaVZudjNmdVorMTkzeG5wVFlMejNTamVqUExYcE82VHRYYnpYcGZJVWNlSkhtUHNYQUpzYkkrYUw3ZnZzcHBWc09YN3VhZEo5RnZ1VDYzUHhzWkFRM1VNeHlnTHlXdnNrNi9sdWt1NDBmYjh0dG9sREZGYjFaUVE2L21Sa3YxaVc5aTFKNkMvMWFlakFjdlFQVm1VdDZGQjJjbjI2SnpETzRUc2FMY1dlYVRibzdJbjA0WDA4Njk2WHhUbnJrbXpHQ0hpbW1KcEx1TmFQaTcxZitLT2t0ZTVJSzlPclM3NGluZ1BTZkpkMW9JU0Q5WjBtL2hQaEIwbysvTGQzTU1HVXJTVTY4czl5VXpYU08zc3VoVytCaCtKajBveXoyc25acWdwY3pkNWl3cHZSdm1LZlhwWS9QMHllU2ZzZ0hPaGxpd3RMUzdjQlNpUjFhWkZQMzBxK0J0M2ZYYks5aFEyVHIrNHJTYys4ZGZsWENPMmw2cFkrUElzNXBGMXhzNGttYlhWQjZ6MEpXUlJkSCs2QjB3OFZlb3lkZVdsVjg0eGFVTG52WDA4dkV6Tm4rSEpPdSt0ZlQxY1NiS1BMZXd2V2tjL2MxL1l0czRTbEorREhwdW5zRjMwNjlYU3J3N1ZoUWVsNGdITjNRdUhPOGpFay9POGNDK1VvL3BYUit2RzBMU24vWlh4bFh5SW9jNjBQU2hlbGR3dmR6YjRIVzNJNzFwTy8wd0hZcU9JcDh2NDFKVDUyVE5qZjVqeDI0Zm1FOTZXTHJHNy9ic29NNmVoQ0dwSjhzMC9aVjNrOHFuVE9kWDFCNjZIT2diNGI1S1JmdGw1NGZDN292eXZaWnBYdDZKeTRvM1pxZWRPdk1UZHNsUFVoRDBybFd4dlZNRnRTMFAxVU9uUHZXazg0WGRiMERJWFcva0hpTVNMZW03ck1NS0RtdDlKMEhtZ3RLLzNCZzdHaGdPR0xDZ1BUOGFmcDFwZFRFeDQ4ODZuZ3RLRjJjOU9wc2dWRGJPS0NKT1Fha2krMVZyRmkrd3JpSnBmTmEvb3JTaGNyVzI4NmpMWXN5eWZaTGw4U0V0bk02NWoxU0xIK3dYVkc2amMwRFlJOTg2RnVqS0puUUxWMGMxTXJ3N3NPNW4vZnd3RGZrb2o5Z2ZENG96aHlGQVVWTXFCUmxZckNkMG9VblJya2l5RXpPUEZOTEZ6VHpUNVZsQlhkM09tOG96a0J0T09kRFBaa1U5azkvUENwTGtIYXJuWlVmSWhYT3YwLzZJU3YwU09jdmovMWI5dHpma041RzN4N2ViZEloMzRXZkY2dHBEcnJZSzZQVXBkLzRmSlMzYnBYYXJ0T0pOK1NSREJYT3YwbDZtNkV6WjF6MzVsdzlrM1JPMDFXTUZCVTRINCsyMWxNYmI4WHMwdmx2WVZIcDNQVXFLQ2NhT0RVc25iTkxTUjVjVEMrZForcHBWZWxDbkthMTE3ZU5UTlFrU1ZGaVUydFArUXJTT1Z2WlphVUxxd3Z0UENoL2pkTWIzUk45OVFPa29qdjhMc1FTMGsvTzcrdEtmK05NVDk2TlAwVXZMdmluUm05Sm4yNHdWcmJEQ2JHSWRGNHhWQk5KL3hKU2U2VWVvL0JqLzlJLzdEeTBQdnJuSnk1b3BTSVJSWlgwYVFVQUFQelgzaDNVQUFDQVFBeDdZQUQvYW5GQkNOZGFtSUFCQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEQW1tb2VLOUh6aUI1STlFQlhueDhBQUFBQUFBQUFBTEJtQUlaS216V0lueHlPQUFBQUFFbEZUa1N1UW1DQyIsIiR0ZW1wbGF0ZSI6eyJuYW1lIjoiN2M0NDIxNzMtMjMwYS00MmNiLTlkY2EtOWViYTIyYWMzNjAzOnN0cmluZzpIRUFMVEhDRVJUIiwidHlwZSI6IjU0MWVjMWE0LTJkYjItNDdjNi04OGNhLTcxZGIxYjczNTlkMzpzdHJpbmc6RU1CRURERURfUkVOREVSRVIiLCJ1cmwiOiI5NzUyM2Y5Yi1lYmY2LTQ2YjYtOTI5YS0wMmRmMTY2YzQ5MTE6c3RyaW5nOmh0dHBzOi8vbW9oLWhlYWx0aGNlcnQtcmVuZGVyZXIubmV0bGlmeS5hcHAvIn19LCJzaWduYXR1cmUiOnsidHlwZSI6IlNIQTNNZXJrbGVQcm9vZiIsInRhcmdldEhhc2giOiJmZjM0M2FhMjQzMjg0MTExN2NlMzNmMWEwYmNlNzU0ODhmYzUxZDg5MDhmZDZmMTMzZWYyZDRhZjE4YjllYmMyIiwicHJvb2YiOltdLCJtZXJrbGVSb290IjoiZmYzNDNhYTI0MzI4NDExMTdjZTMzZjFhMGJjZTc1NDg4ZmM1MWQ4OTA4ZmQ2ZjEzM2VmMmQ0YWYxOGI5ZWJjMiJ9LCJwcm9vZiI6W3sidHlwZSI6Ik9wZW5BdHRlc3RhdGlvblNpZ25hdHVyZTIwMTgiLCJjcmVhdGVkIjoiMjAyMC0xMC0wN1QwOTo1NjoxMC42OTFaIiwicHJvb2ZQdXJwb3NlIjoiYXNzZXJ0aW9uTWV0aG9kIiwidmVyaWZpY2F0aW9uTWV0aG9kIjoiZGlkOmV0aHI6MHhFMzk0Nzk5MjhDYzRFZkZFNTA3NzQ0ODg3ODBCOWY2MTZiZDRCODMwI2NvbnRyb2xsZXIiLCJzaWduYXR1cmUiOiIweDI5NjYzYTZiZDhiYzA5MTdmMzdkMWIyMGViNjQ0N2M5ZTc4OGQ1MTc3NWNhOWZlYWExZjk4YjYyYWVhODZiYTAyMDIyZjhhMzFkOWE1Y2IwYmU3YWFhYzY1ZDZhMTJkZjc0YmQzZTBlNzkxMTEzMmNiZGUxNzhhMTg2ZTZhMDViMWIifV19",
          "filename": "healthcert.txt",
          "type": "text/open-attestation",
        },
      ],
      "fhirBundle": Object {
        "entry": Array [
          Object {
            "birthDate": "1990-01-15",
            "extension": Array [
              Object {
                "code": Object {
                  "text": "SG",
                },
                "url": "http://hl7.org/fhir/StructureDefinition/patient-nationality",
              },
            ],
            "gender": "female",
            "identifier": Array [
              Object {
                "type": "PPN",
                "value": "E7831177G",
              },
              Object {
                "type": Object {
                  "text": "NRIC",
                },
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
          Object {
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
          Object {
            "code": Object {
              "coding": Array [
                Object {
                  "code": "94531-1",
                  "display": "Reverse transcription polymerase chain reaction (rRT-PCR) test",
                  "system": "http://loinc.org",
                },
              ],
            },
            "effectiveDateTime": "2020-09-28T06:15:00Z",
            "identifier": Array [
              Object {
                "type": "ACSN",
                "value": "123456789",
              },
            ],
            "performer": Object {
              "name": Array [
                Object {
                  "text": "Dr Michael Lim",
                },
              ],
            },
            "qualification": Array [
              Object {
                "identifier": "MCR 123214",
                "issuer": "MOH",
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
          Object {
            "contact": Object {
              "address": Object {
                "text": "MacRitchie Hospital Thomson Road Singapore 123000",
                "type": "physical",
                "use": "work",
              },
              "telecom": Array [
                Object {
                  "system": "phone",
                  "value": "+6563113111",
                },
              ],
            },
            "endpoint": Object {
              "address": "https://www.macritchieclinic.com.sg",
            },
            "name": "MacRitchie Medical Clinic",
            "resourceType": "Organization",
            "type": "Licensed Healthcare Provider",
          },
          Object {
            "contact": Object {
              "address": Object {
                "text": "2 Thomson Avenue 4 Singapore 098888",
                "type": "physical",
                "use": "work",
              },
              "telecom": Array [
                Object {
                  "system": "phone",
                  "value": "+6562711188",
                },
              ],
            },
            "name": "MacRitchie Laboratory",
            "resourceType": "Organization",
            "type": "Accredited Laboratory",
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
      "name": "HealthCert",
      "notarisationMetadata": Object {
        "notarisedOn": "1970-01-01T00:00:01.000Z",
        "passportNumber": "E7831177G",
        "reference": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
        "url": "https://example.com",
      },
      "validFrom": "2020-11-20",
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
