import { createUnwrappedDocument } from "./createUnwrappedHealthCert";
import exampleHealthcertWrapped from "../../../../test/fixtures/v1/example_healthcert_with_nric_wrapped.json";
import exampleHealthcertV2Wrapped from "../../../../test/fixtures/v2/example_healthcert_with_nric_wrapped.json";
import { mockDate, unmockDate } from "../../../../test/utils";

const sampleDocument = exampleHealthcertWrapped as any;
const sampleDocumentV2 = exampleHealthcertV2Wrapped as any;
const uuid = "e35f5d2a-4198-4f8f-96dc-d1afe0b67119";
const storedUrl = "https://example.com";

beforeAll(mockDate);
afterAll(unmockDate);

it("should create the unwrapped document from input data", () => {
  const createdDocument = createUnwrappedDocument(
    sampleDocument,
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
  `);
});

it("should create the unwrapped v2 document from input data", () => {
  const createdDocument = createUnwrappedDocument(
    sampleDocumentV2,
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
      "data": "eyJ2ZXJzaW9uIjoiaHR0cHM6Ly9zY2hlbWEub3BlbmF0dGVzdGF0aW9uLmNvbS8yLjAvc2NoZW1hLmpzb24iLCJkYXRhIjp7ImlkIjoiOTBmMmRkYWYtMGRjYS00NjkyLTljZjQtODdjZWY0YTk4NjE1OnN0cmluZzo3NmNhZjNmOS01NTkxLTRlZjEtYjc1Ni0xY2I0N2E3NmRlZGUiLCJ2ZXJzaW9uIjoiMzQ0MmM0ZWMtZWM5Ni00YmNkLWFjMzgtYzk5OTlmMTA3OWY4OnN0cmluZzpwZHQtaGVhbHRoY2VydC12Mi4wIiwidHlwZSI6IjAyYmNmYzExLWI5M2UtNDIwYS1hZGU3LTk5MTZkZWQwOTJlYTpzdHJpbmc6UENSIiwidmFsaWRGcm9tIjoiOTcxODM5NTgtYjBhOC00ZTAyLTgyYjctZTlmZmRiNzIwMDcyOnN0cmluZzoyMDIxLTA1LTE4VDA2OjQzOjEyLjE1MloiLCJmaGlyVmVyc2lvbiI6IjI2NDRmNjdiLWNjNmQtNDRjMy1iYmQ5LWIwM2M5ODlhZTljZDpzdHJpbmc6NC4wLjEiLCJmaGlyQnVuZGxlIjp7InJlc291cmNlVHlwZSI6Ijk1MzlkNTlhLTA4ZWMtNDE2Mi1hMzU4LWI1MGQzNTA0OThiMjpzdHJpbmc6QnVuZGxlIiwidHlwZSI6ImJkZmNjMWU1LTVmY2MtNGIzOS05NTU0LTc1Mjk5MzkzZjc4ZTpzdHJpbmc6Y29sbGVjdGlvbiIsImVudHJ5IjpbeyJmdWxsVXJsIjoiYzBiZTkzMmQtZmY5Ny00ZjUwLWEwYzAtNmRhOTJlMDc5MzcwOnN0cmluZzp1cm46dXVpZDpiYTdiN2M4ZC1jNTA5LTRkOWQtYmU0ZS1mOTliNmRlMjllMjMiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIzOTE4NzdiYS0yZjk4LTQwMjctODQ0MS04ODUyY2EzNGFlNzk6c3RyaW5nOlBhdGllbnQiLCJleHRlbnNpb24iOlt7InVybCI6IjM5ZGVhNjI3LTlhMDQtNDRlNy05NjkwLWYzM2JiNWYwNmE0NDpzdHJpbmc6aHR0cDovL2hsNy5vcmcvZmhpci9TdHJ1Y3R1cmVEZWZpbml0aW9uL3BhdGllbnQtbmF0aW9uYWxpdHkiLCJleHRlbnNpb24iOlt7InVybCI6ImFiMjE4ZGZiLTBlNzgtNDUyYS1iYjE5LTg5ZDZlMTIwMTk4YTpzdHJpbmc6Y29kZSIsInZhbHVlQ29kZWFibGVDb25jZXB0Ijp7InRleHQiOiIxMTNjNjAyMS0wOTgyLTQ2NWItYjJkNi02ZTFkNjZjNDZmZGQ6c3RyaW5nOlBhdGllbnQgTmF0aW9uYWxpdHkiLCJjb2RpbmciOlt7InN5c3RlbSI6Ijg4Y2MyZDdmLTQxZTktNGFmYi05MTNmLWY4ZjY5NjY1ZTJiMTpzdHJpbmc6dXJuOmlzbzpzdGQ6aXNvOjMxNjYiLCJjb2RlIjoiNmNmZjA5MzgtMDY1My00YmVhLTkxOGUtMzMxYmRkYWZhMDQ0OnN0cmluZzpTRyJ9XX19XX1dLCJpZGVudGlmaWVyIjpbeyJpZCI6IjhlMDEzMjlmLTUwZDUtNDQ4Mi1hNzRiLTE4YTM2ZmFjNDVlYzpzdHJpbmc6UFBOIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjhkYmUyMmJlLTYwODAtNDMxNS1iYTVhLWU5Njg4YTE4ZGZmMzpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS92Mi0wMjAzIiwiY29kZSI6IjJmOTYwNGIwLWJhNWUtNGFhZS1iNzdkLTEyOTBiMzYyNDc1NzpzdHJpbmc6UFBOIiwiZGlzcGxheSI6IjljNzcxNGUzLWYwY2QtNDMxYS05NGQ2LWIyY2NjN2JkMjc5NTpzdHJpbmc6UGFzc3BvcnQgTnVtYmVyIn1dfSwidmFsdWUiOiIwMmZmNzczMi0yZTEwLTQ0YTYtOGEwMC1iNDY2OGI3N2Y1ODQ6c3RyaW5nOkU3ODMxMTc3RyJ9LHsiaWQiOiJiMDM4MWE1Yi0xMmVhLTRhYWEtODA4ZC03ZDQyZTZiZDQyNjI6c3RyaW5nOk5SSUMtRklOIiwidmFsdWUiOiJmYjUyOTIxOS04NjI1LTRmZWYtYWFhZS1jZTZlOTk4M2NkNjM6c3RyaW5nOlM5MDk4OTg5WiJ9XSwibmFtZSI6W3sidGV4dCI6IjlkYzE3NGRmLTFiM2UtNDBlYS05NTAxLTBiODJhMDQwYTAxNDpzdHJpbmc6VGFuIENoZW4gQ2hlbiJ9XSwiZ2VuZGVyIjoiZDM1YWRiZWMtOTZlYy00NDljLWJjNmItZjFkZGVjMDMyZDU2OnN0cmluZzpmZW1hbGUiLCJiaXJ0aERhdGUiOiIxYmE1ZTE3Ny00MDc4LTQyNWUtYmZjNy1mMTRjODU1ODNiMzc6c3RyaW5nOjE5OTAtMDEtMTUifX0seyJmdWxsVXJsIjoiOTE1OWJlYTAtY2I2Ni00ODI4LWEwM2ItNzUwOGZiNDZkNDRiOnN0cmluZzp1cm46dXVpZDowMjc1YmZhZi00OGZiLTQ0ZTAtODBjZC05YzUwNGY4MGU2YWUiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJhNjIwMjZmMC05YmFhLTRkY2UtYWIyNC00NzQxM2FkMTcxN2I6c3RyaW5nOlNwZWNpbWVuIiwidHlwZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjU1ODMwY2QyLTNiMmQtNDg1OS1iMTE0LTkyZGI3OTYwMWViOTpzdHJpbmc6aHR0cDovL3Nub21lZC5pbmZvL3NjdCIsImNvZGUiOiI0NTU3ZGI4Zi00ZjNjLTRlZGItODg5Yy0yYmQ4MTVhZWJjM2I6c3RyaW5nOjI1ODUwMDAwMSIsImRpc3BsYXkiOiJkYzg1ZGU1NS05Y2Y5LTRjM2MtOThjMC01OGNkODgxMWM3YTI6c3RyaW5nOk5hc29waGFyeW5nZWFsIHN3YWIifV19LCJjb2xsZWN0aW9uIjp7ImNvbGxlY3RlZERhdGVUaW1lIjoiZmVkMzkwNmUtMTFmNi00ZTQwLTg3Y2EtNzEyMmFkZDY4ZjY1OnN0cmluZzoyMDIwLTA5LTI3VDA2OjE1OjAwWiJ9fX0seyJmdWxsVXJsIjoiOTBkNWZjY2QtNTc0YS00Yzc5LTk5MmYtYjMzMDEzOTFiZDczOnN0cmluZzp1cm46dXVpZDo3NzI5OTcwZS1hYjI2LTQ2OWYtYjNlNS0zNmE0MmVjMjQxNDYiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiJhY2RiMjZkNy0zNjdhLTQ5ZWUtYjNlYy01N2E2N2RkZGYzNTg6c3RyaW5nOk9ic2VydmF0aW9uIiwicGVyZm9ybWVyIjpbeyJ0eXBlIjoiMmQyZGRmM2QtYmZjNy00ZDkxLTg0ZGYtMjMwY2VkOTY1ZWFiOnN0cmluZzpQcmFjdGl0aW9uZXIiLCJyZWZlcmVuY2UiOiI1NzgwODg0Yi1hOTQ5LTQ4MTItOTU2Yi01OGZmZTJiZDU5MDk6c3RyaW5nOnVybjp1dWlkOjNkYmZmMGRlLWQ0YTQtNGUxZC05OGJmLWFmNzQyOGI4YTA0YiJ9XSwiaWRlbnRpZmllciI6W3siaWQiOiJjMDI3Y2IyNC01ZTEwLTQ2ODMtOTZiZS02ZmJmMjQzN2QwNGM6c3RyaW5nOkFDU04iLCJ0eXBlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiOTg1YmY3YTctMjIzZS00OTFhLTgxYjgtZDIyMTczNDYzMjdlOnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiMzgyOTQ1YTYtNjFiNy00MGY0LThmYzgtNzBjMjg3NjQ0ZTdmOnN0cmluZzpBQ1NOIiwiZGlzcGxheSI6ImM1ZjY4ZTc4LWU0YWEtNDMzNi1iYjEyLWVlYTk2MTg4YTZkMTpzdHJpbmc6QWNjZXNzaW9uIElEIn1dfSwidmFsdWUiOiJlNDYyMGRmMS1iYWJkLTQ3ZTktOTcxNy1iMzliYzQ5ZjMzZmU6c3RyaW5nOjEyMzQ1Njc4OSJ9XSwiY2F0ZWdvcnkiOlt7ImNvZGluZyI6W3sic3lzdGVtIjoiZjQ4MTIxNzgtM2I5Mi00YmQ3LWFiMDktMWU1ZWZlNzQ0YzFiOnN0cmluZzpodHRwOi8vc25vbWVkLmluZm8vc2N0IiwiY29kZSI6ImVmNzlmOGFlLTBjYWUtNDEyZC04OTMxLThmMzZkZDUzMThkNDpzdHJpbmc6ODQwNTM5MDA2IiwiZGlzcGxheSI6ImFlYzNmN2E3LWEzMzMtNGIwNS1iOGNiLWY4NjgwOGMzZDM5NTpzdHJpbmc6Q09WSUQtMTkifV19XSwiY29kZSI6eyJjb2RpbmciOlt7InN5c3RlbSI6IjljZjE1Y2Y0LTcwZTgtNDk3Zi1iOTVhLWM5MGE5NzBhNTU4MTpzdHJpbmc6aHR0cDovL2xvaW5jLm9yZyIsImNvZGUiOiJkMzllZWViYy02Y2IyLTRmZGQtODQwZi1jODc5YTBmNDg1ZTQ6c3RyaW5nOjk0NTMxLTEiLCJkaXNwbGF5IjoiYWQ0ZGQxYzYtMmM2MC00ZmU2LWI1MGUtY2RiZmNiNDM0NmVhOnN0cmluZzpTQVJTLUNvVi0yIChDT1ZJRC0xOSkgUk5BIHBhbmVsIC0gUmVzcGlyYXRvcnkgc3BlY2ltZW4gYnkgTkFBIHdpdGggcHJvYmUgZGV0ZWN0aW9uIn1dfSwidmFsdWVDb2RlYWJsZUNvbmNlcHQiOnsiY29kaW5nIjpbeyJzeXN0ZW0iOiI1N2FhODU0NC00ZWYxLTQzY2UtYWYzMi0wM2E4ZDkxZmVmZGI6c3RyaW5nOmh0dHA6Ly9zbm9tZWQuaW5mby9zY3QiLCJjb2RlIjoiM2U2OGU1OWQtYzMyOS00MWFiLTg4YjQtOGYzM2Q0NWQzNTliOnN0cmluZzoyNjAzODUwMDkiLCJkaXNwbGF5IjoiZTQzOTBiMWYtODVjZi00ZTgyLTlkMjQtMjc0ZmIwMjI4NjEzOnN0cmluZzpOZWdhdGl2ZSJ9XX0sImVmZmVjdGl2ZURhdGVUaW1lIjoiZDQ1NTUzMjgtYmU5MS00OGQ2LThhOTQtMmQ2ZjdhMTM1NTg5OnN0cmluZzoyMDIwLTA5LTI4VDA2OjE1OjAwWiIsInN0YXR1cyI6IjhiYWM2NDBjLTY0ZDEtNGE5ZC1hNTg0LWMwNDk3NzgyMjBmNjpzdHJpbmc6ZmluYWwifX0seyJmdWxsVXJsIjoiMjkzNGY4MTktY2Q1ZS00NzIwLWE4ZmUtYzdmNWRjMTY0M2Q5OnN0cmluZzp1cm46dXVpZDozZGJmZjBkZS1kNGE0LTRlMWQtOThiZi1hZjc0MjhiOGEwNGIiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIxODQ3ZTBlMi0yZDhmLTRjNWMtODI5Yi1lYjc2OWYxYTYxNmE6c3RyaW5nOlByYWN0aXRpb25lciIsIm5hbWUiOlt7InRleHQiOiI0NzFmMjk3OS1lMzY2LTQ2NWYtYTkwYS0yYTkwMDYwYTMyOTg6c3RyaW5nOkRyIE1pY2hhZWwgTGltIn1dLCJxdWFsaWZpY2F0aW9uIjpbeyJjb2RlIjp7ImNvZGluZyI6W3sic3lzdGVtIjoiYTVmZWI3NDItNGU0Zi00YzE3LTkwYTYtNmU3MTNhODdkNTE0OnN0cmluZzpodHRwOi8vdGVybWlub2xvZ3kuaGw3Lm9yZy9Db2RlU3lzdGVtL3YyLTAyMDMiLCJjb2RlIjoiMDIyYzRmMWEtNTE1My00YTgzLTg0NmEtNmUyMTQyODY3ZGJmOnN0cmluZzpNQ1IiLCJkaXNwbGF5IjoiMTY2MzI1MzQtNWU2OS00ZGM3LTlmOGEtYzM4ZjRhMjUyM2VjOnN0cmluZzpQcmFjdGl0aW9uZXIgTWVkaWNhcmUgbnVtYmVyIn1dfSwiaWRlbnRpZmllciI6W3siaWQiOiJlZTdlODhjOS01MjdjLTQ1ZTItYTdiNi01MTBlMjA4NTkwZTU6c3RyaW5nOk1DUiIsInZhbHVlIjoiYWNlYWZmMmYtYzhjOC00ZDk3LWI1YWQtNTUxOTU0NWU5NTI5OnN0cmluZzoxMjMyMTQifV0sImlzc3VlciI6eyJ0eXBlIjoiNzM2ODI3MGYtNTkwNy00NTA1LWIyMGMtYTA2ZGNmZDkwNTQyOnN0cmluZzpPcmdhbml6YXRpb24iLCJyZWZlcmVuY2UiOiI3YTBmOWIzYy1hMWIyLTRhZjctODJmNC0xYjFhZmY5N2I2ZTE6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSJ9fV19fSx7ImZ1bGxVcmwiOiI0NmZkMDFmMy0xNWUwLTRhZjEtYWQ3YS0yOTY2M2VmYmM0ZmQ6c3RyaW5nOnVybjp1dWlkOmJjNzA2NWVlLTQyYWEtNDczYS1hNjE0LWFmZDhhN2IzMGIxZSIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjZjOGNiMDIyLTRmNTYtNDM1OC1hODQyLWQyMjQ4MTFlMmQ2MjpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6ImVmZjJkOWIxLTA2NzktNDYzYi05M2I0LWI2ODkyMzU1MmYyMzpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoIChNT0gpIiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiI5ZjQ1MjRmZi1jZTNlLTQzNmUtYjA1Mi02NzE0OTY5NWJmNDE6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiZjYzYTRhMzUtYjdiNS00M2MwLTgzZDUtMGZhY2Y1MWJkOTljOnN0cmluZzpnb3Z0IiwiZGlzcGxheSI6IjlmMDg0OGFmLWVlODktNDcxZi05N2NiLWExNmM3NDU4OTEzZTpzdHJpbmc6R292ZXJubWVudCJ9XX1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiI4NTIyYzE4NC0yMDU4LTQyNDctYjFjYi0yOWU2YzU1YzRjNDg6c3RyaW5nOnVybCIsInZhbHVlIjoiN2ZhMjI3MjAtOWU2YS00OWJiLWJlNzQtMjhkZjgxZGE4YWE4OnN0cmluZzpodHRwczovL3d3dy5tb2guZ292LnNnIn0seyJzeXN0ZW0iOiIwMTQwZDU1NS1mNDMxLTQyZTQtYmRmYS0zZGZiOTg3Zjg1YzE6c3RyaW5nOnBob25lIiwidmFsdWUiOiI4ZjIwYTU2Yi1lMWVmLTQ3YjUtOTM0OC1mMDhkYzI2NDAyZDY6c3RyaW5nOis2NTYzMjU5MjIwIn1dLCJhZGRyZXNzIjp7InR5cGUiOiI1MDE1OWU1Yi04NzVmLTQxMzAtYjViNi1hZGFkNjMyMDllMGQ6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiYmVmNDIzYzktMDRkNS00ZTM2LWI1ZWQtYTcwZjAxZTQyOWY2OnN0cmluZzp3b3JrIiwidGV4dCI6IjliYjkzZWQ3LWM2MTItNGVhNi05ZTU1LWY1OWZjMDdmNTAwNjpzdHJpbmc6TWluaXN0cnkgb2YgSGVhbHRoLCAxNiBDb2xsZWdlIFJvYWQsIENvbGxlZ2Ugb2YgTWVkaWNpbmUgQnVpbGRpbmcsIFNpbmdhcG9yZSAxNjk4NTQifX1dfX0seyJmdWxsVXJsIjoiNGZmOTM3OGEtM2EzMi00ZGZmLWE1NTQtODdlMjQ4MDcxODExOnN0cmluZzp1cm46dXVpZDpmYTIzMjhhZi00ODgyLTRlYWEtOGMyOC02NmRhYjQ2OTUwZjEiLCJyZXNvdXJjZSI6eyJyZXNvdXJjZVR5cGUiOiIzYmRkMzZlMy0xNzMwLTQzOGUtODA1OC00YWUzNmIzNjA3OTg6c3RyaW5nOk9yZ2FuaXphdGlvbiIsIm5hbWUiOiJlOTU5NDAyOS1jMWQ3LTRjOTYtOWRlYi05OTE0ZDczZWYzZjA6c3RyaW5nOk1hY1JpdGNoaWUgTWVkaWNhbCBDbGluaWMiLCJ0eXBlIjpbeyJjb2RpbmciOlt7InN5c3RlbSI6ImZkZjU5MGNiLTgxYzctNGU3YS05OGI5LTc1M2RiNWMyNmM3MTpzdHJpbmc6aHR0cDovL3Rlcm1pbm9sb2d5LmhsNy5vcmcvQ29kZVN5c3RlbS9vcmdhbml6YXRpb24tdHlwZSIsImNvZGUiOiJlZjgxMzRhZC1mZWUzLTRkMDAtOTZmZC02NDUxMTRjYWY0OTg6c3RyaW5nOnByb3YiLCJkaXNwbGF5IjoiNjVhMjRjZDAtM2VjZC00YTllLTlkOWEtNjAxMTQ5NzFkMGM0OnN0cmluZzpIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJ0ZXh0IjoiN2NkNGFjODUtM2ZiOC00OGUyLWEwMzItMjdjMzc0NjgxNjEyOnN0cmluZzpMaWNlbnNlZCBIZWFsdGhjYXJlIFByb3ZpZGVyIn1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiJlZDc4MzEwMy1iNTMwLTRjNGMtODc4Yi05OTYxZTM2NDc5NTA6c3RyaW5nOnVybCIsInZhbHVlIjoiMjU2YzY4NGMtZDI1YS00YzRhLTg5OWItOGVhMzlmNGE2NTcyOnN0cmluZzpodHRwczovL3d3dy5tYWNyaXRjaGllY2xpbmljLmNvbS5zZyJ9LHsic3lzdGVtIjoiYzcwM2ZkM2ItMzIxYi00ZmQ4LWI2MTAtYTA2YmRhMWQ0ZTNlOnN0cmluZzpwaG9uZSIsInZhbHVlIjoiMTA0MmNlOTctNmIyOC00YzA2LThkNjUtZTJlZGY2NTQ1OTdhOnN0cmluZzorNjU2MTIzNDU2NyJ9XSwiYWRkcmVzcyI6eyJ0eXBlIjoiZGRjNWQ1MGEtZmU3Mi00NDI4LWFhZmUtYTkyNmEzYzE1NWJiOnN0cmluZzpwaHlzaWNhbCIsInVzZSI6IjIxNDE0ZDIzLTEzMTMtNDg0Yi04OWFlLTViYTM1NGU2NTRlMjpzdHJpbmc6d29yayIsInRleHQiOiJhZWEyNDdmNi1iNjBjLTRkMzQtODhiNC0xMzAzNDQxYjYyNGI6c3RyaW5nOk1hY1JpdGNoaWUgSG9zcGl0YWwsIFRob21zb24gUm9hZCwgU2luZ2Fwb3JlIDEyMzAwMCJ9fV19fSx7ImZ1bGxVcmwiOiIwMDhhMTBjOC05NWViLTQ4NjMtYmQ1Ni03MTEwODhiNDdjMWI6c3RyaW5nOnVybjp1dWlkOjgzOWE3YzU0LTZiNDAtNDFjYi1iMTBkLTkyOTVkN2U3NWY3NyIsInJlc291cmNlIjp7InJlc291cmNlVHlwZSI6IjI5OTlhOTZmLTkxZmMtNDY4NS1hZGMwLTdmZTM4OGYzYWE5NjpzdHJpbmc6T3JnYW5pemF0aW9uIiwibmFtZSI6ImFiNDg2NmI5LWY1NDQtNDhlOC05NTIwLWQ4YTQ0YWFkZTc0MjpzdHJpbmc6TWFjUml0Y2hpZSBMYWJvcmF0b3J5IiwidHlwZSI6W3siY29kaW5nIjpbeyJzeXN0ZW0iOiIwODM1NmRmOS1lNTdlLTQ1NjctOWMyZS1hNTE5NjJjZjQ2OGI6c3RyaW5nOmh0dHA6Ly90ZXJtaW5vbG9neS5obDcub3JnL0NvZGVTeXN0ZW0vb3JnYW5pemF0aW9uLXR5cGUiLCJjb2RlIjoiZDQ1ZDUxNGQtNWM4ZC00YjY1LWJmOTctYTg2Y2JmZTFjNjgxOnN0cmluZzpwcm92IiwiZGlzcGxheSI6IjdiYTZkNzE5LTkzOGEtNGQ2Yy04NWJhLWE4MzBiOGJhOTk0ZjpzdHJpbmc6SGVhbHRoY2FyZSBQcm92aWRlciJ9XSwidGV4dCI6Ijg3NzRmMTQ2LTI3M2EtNDVmMS04NGUyLTMwMzgwNTkxMGFlYzpzdHJpbmc6QWNjcmVkaXRlZCBMYWJvcmF0b3J5In1dLCJjb250YWN0IjpbeyJ0ZWxlY29tIjpbeyJzeXN0ZW0iOiI4YjYwNzE5ZS1lZTBhLTRhYjktYjJjZi03MWVkZDdmNjAyNjY6c3RyaW5nOnBob25lIiwidmFsdWUiOiI3ZjhiY2JiYS1iNDFiLTQ1ODItYTBhNy1hZDhiY2RiMWNmMTE6c3RyaW5nOis2NTY3NjU0MzIxIn1dLCJhZGRyZXNzIjp7InR5cGUiOiJjMjZkMWRlMC1lMjNlLTQ2MWMtOThjNi0yYTg4YzU5MGEwODY6c3RyaW5nOnBoeXNpY2FsIiwidXNlIjoiMjg5Y2M1NzYtYTVlMi00MDQ0LWFmZmUtNjY4YTBkNDBiNWFhOnN0cmluZzp3b3JrIiwidGV4dCI6Ijg5ZTcwZDA1LWU4N2YtNDIzZC1hNTBkLTZjYmMxNTZiZDQxYjpzdHJpbmc6MiBUaG9tc29uIEF2ZW51ZSA0LCBTaW5nYXBvcmUgMDk4ODg4In19XX19XX0sImlzc3VlcnMiOlt7ImlkIjoiYjQwNTMzN2YtN2NiYy00Nzk3LWEwYjktNmQxNDFhYmUwYjM3OnN0cmluZzpkaWQ6ZXRocjoweEUzOTQ3OTkyOENjNEVmRkU1MDc3NDQ4ODc4MEI5ZjYxNmJkNEI4MzAiLCJyZXZvY2F0aW9uIjp7InR5cGUiOiI2YzZlYjdhOC1hNzE4LTQzZjYtYWRhNy0zN2Q0OTI0MGE0Yjc6c3RyaW5nOk5PTkUifSwibmFtZSI6ImYwNjc0NjRlLTY5ZTEtNDdlZi05MzYyLTEwNGVlYzA1MmYyNjpzdHJpbmc6U0FNUExFIENMSU5JQyIsImlkZW50aXR5UHJvb2YiOnsidHlwZSI6IjA4MWE3YTRjLTRiYzctNDE5OS1hOTBkLTY4Y2E0ODBhYjY5NzpzdHJpbmc6RE5TLURJRCIsImxvY2F0aW9uIjoiODc5ODZkYmYtYTI5Mi00ZTliLTg0YjgtYjNiMzIxN2UzZTYzOnN0cmluZzpkb25vdHZlcmlmeS50ZXN0aW5nLnZlcmlmeS5nb3Yuc2ciLCJrZXkiOiI1YzM4MTQ3OC03NDNkLTQwNzAtOTkxOS0xYzA2NGI1NzlhOWE6c3RyaW5nOmRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIn19XSwibG9nbyI6IjI2ZDdhZGJlLWY1MDQtNDZhNS05ODA3LTcxNTdkNjJlM2NmZTpzdHJpbmc6ZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFmUUFBQURJQ0FNQUFBQXB4K1BhQUFBQU0xQk1WRVVBQUFETXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNek16TXpNemVDbWlBQUFBQUVIUlNUbE1BUUwrQTd4QWduMkRQM3pCd3IxQ1BFbCtJL1FBQUJ3ZEpSRUZVZU5yc25kMTIyeW9RUnZrSElTSE4rei90eVVrOW9URUNRMWJUQmMyM2J5TnMwQjVHSURBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFrK0lrK0lkeDRnNU40QjlHUS9yUEE5Si9JUGZTZ3dML01FRUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFEd1A1WlBvUDVyN0ZKS0FmN2N1ZkJpaFBOU2tYNWhsQTl1K0RzUDdkWC9KSzFQMlZQaVNJb2ViRXJMd1ZoNVp4KzhDMVkyMll0UDBGcGY2aGRlYSttcTFXbGl4ZmVqNlJjRHhqMDlzd1hiYmVCUXBpanVnMjBhai9TRThidm81aEV1YXZBdVNLcFFmSnhURzkxZ1VyQ1Y2alNRRTBvUGtlNHd1a2U3MDVFcXBMTld4dE10U2s0anZYR2xkK3RMbHh2Vk1ObmFrRDdtRW5kWVRWV1NuVjg2MFdVWGwzNFJNeTdCZW1weUd6TjdwQWJtWEVBNmJmdkswdTMydVRGS0tWTTByMFl3MU1UY0Z2cDhpVkxQRDArOWdIUXkrN3JTZjNlZWpwMkh1RmNzbWxkaUV6MEZ6S1hmU1J3M3FlMDhYcWQ5ZFA2UUtPTm5rdTRsRzNOU2IvUkJ0S3RLdDF0dGRCSmlZYjJWSTdicmM3dGM4SVlvdEp6SFVCMGMrTytUM3JUUXVMS3NaUnFwemtUUzdkWkk0dm8rcUpuZEVHTzhFemVjeWphYzYvSVROMktPV2FVTElUL2FMZGVVbnFwZGk3VlcyK0t5YzI5RkwzczdlM2hpNUxUU2hlV1dweVdsSDRYem12V2puaU9pRk4zWVdEaXZXSTkyV3VrNWN0MkMwcDNKemw5WU42NldJNUlWL1Z5Rjg2cjFhMTdwSDVVTUMwcFgvRHdYVlU1MjRLczVZZ0RabUw0ekd6MXc4MHAzM1BqMXBNdmNpK3RjMmNGSWptaEgyZFdWZnVhVkx1TGp5OWVUemdxT3JxZXd2MHZ1bS8xS1I0KzJhNkRoNXBYTzdWOU8rczRLUkpQQUR1eE5qdGpGQ0NrL0NsdEV6Z2Z6U3RlclN2ZFpRWmVEb3l5cXhRZ3VSMWxYbUJsSS85UFNlYlpwYk9lOGJpdnQyYkZLOVlhSzRlSGU3TkxOYXRMUDNxR1lMZkw3MVJvTXZCNlh1OTZKM1RXdDlMVG9RTTV6bThZZnhiSElFU1BaWFhXL3RvdlRTbytQcUZ4TmVzd1pxak8vWDA5T3ZCZ2k5T2NIdzdsbFV1a2N2K2RpMHJuZXFmOTl1WG9LZ2xNTXdhbGw3eC9teTBtbFA1cGlWbnYzZnVaKzE5M3hucFRZTHozU2plalBMWHBPNlR0WGJ6WHBmSVVjZUpIbVBzWEFKc2JJK2FMN2Z2c3BwVnNPWDd1YWRKOUZ2dVQ2M1B4c1pBUTNVTXh5Z0x5V3ZzazYvbHVrdTQwZmI4dHRvbERGRmIxWlFRNi9tUmt2MWlXOWkxSjZDLzFhZWpBY3ZRUFZtVXQ2RkIyY24yNkp6RE80VHNhTGNXZWFUYm83SW4wNFgwODY5Nlh4VG5ya216R0NIaW1tSnBMdU5hUGk3MWYrS09rdGU1SUs5T3JTNzRpbmdQU2ZKZDFvSVNEOVowbS9oUGhCMG8rL0xkM01NR1VyU1U2OHM5eVV6WFNPM3N1aFcrQmgrSmowb3l6MnNuWnFncGN6ZDVpd3B2UnZtS2ZYcFkvUDB5ZVNmc2dIT2hsaXd0TFM3Y0JTaVIxYVpGUDMwcStCdDNmWGJLOWhRMlRyKzRyU2MrOGRmbFhDTzJsNnBZK1BJczVwRjF4czRrbWJYVkI2ejBKV1JSZEgrNkIwdzhWZW95ZGVXbFY4NHhhVUxudlgwOHZFek5uK0hKT3UrdGZUMWNTYktQTGV3dldrYy9jMS9ZdHM0U2xKK0RIcHVuc0YzMDY5WFNydzdWaFFlbDRnSE4zUXVITzhqRWsvTzhjQytVby9wWFIrdkcwTFNuL1pYeGxYeUlvYzYwUFNoZWxkd3ZkemI0SFczSTcxcE8vMHdIWXFPSXA4djQxSlQ1MlROamY1angyNGZtRTk2V0xyRzcvYnNvTTZlaENHcEo4czAvWlYzazhxblRPZFgxQjY2SE9nYjRiNUtSZnRsNTRmQzdvdnl2WlpwWHQ2Snk0bzNacWVkT3ZNVGRzbFBVaEQwcmxXeHZWTUZ0UzBQMVVPblB2V2s4NFhkYjBESVhXL2tIaU1TTGVtN3JNTUtEbXQ5SjBIbWd0Sy8zQmc3R2hnT0dMQ2dQVDhhZnAxcGRURXg0ODg2bmd0S0YyYzlPcHNnVkRiT0tDSk9RYWtpKzFWckZpK3dyaUpwZk5hL29yU2hjclcyODZqTFlzeXlmWkxsOFNFdG5NNjVqMVNMSCt3WFZHNmpjMERZSTk4NkZ1aktKblFMVjBjMU1ydzdzTzVuL2Z3d0Rma29qOWdmRDRvemh5RkFVVk1xQlJsWXJDZDBvVW5ScmtpeUV6T1BGTkxGelR6VDVWbEJYZDNPbThvemtCdE9PZERQWmtVOWs5L1BDcExrSGFyblpVZkloWE92MC82SVN2MFNPY3ZqLzFiOXR6ZmtONUczeDdlYmRJaDM0V2ZGNnRwRHJyWUs2UFVwZC80ZkpTM2JwWGFydE9KTitTUkRCWE92MGw2bTZFeloxejM1bHc5azNSTzAxV01GQlU0SDQrMjFsTWJiOFhzMHZsdllWSHAzUFVxS0NjYU9EVXNuYk5MU1I1Y1RDK2RaK3BwVmVsQ25LYTExN2VOVE5Ra1NWRmlVMnRQK1FyU09WdlpaYVVMcXd2dFBDaC9qZE1iM1JOOTlRT2tvanY4THNRUzBrL083K3RLZitOTVQ5Nk5QMFV2THZpblJtOUpuMjR3VnJiRENiR0lkRjR4VkJOSi94SlNlNlVlby9Cai85SS83RHkwUHZybkp5NW9wU0lSUlpYMGFRVUFBUHpYM2gzVUFBQ0FRQXg3WUFEL2FuRkJDTmRhbUlBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBREFtbW9lSzlIemlCNUk5RUJYbng4QUFBQUFBQUFBQUxCbUFJWktteldJbnh5T0FBQUFBRWxGVGtTdVFtQ0MiLCIkdGVtcGxhdGUiOnsibmFtZSI6IjRjMjUxNjcyLTQyMDgtNDlhYi04MzM4LTVlOTUxZTA0OTMyOTpzdHJpbmc6SEVBTFRIQ0VSVCIsInR5cGUiOiJhM2NlN2NjZC00ZWFhLTQ2ZGYtOTFiYy05ZjZiN2MwNjEyM2U6c3RyaW5nOkVNQkVEREVEX1JFTkRFUkVSIiwidXJsIjoiZTI3NDk0NGItM2MyOC00OGIyLWExOTgtZThhOWUwNGE5NTliOnN0cmluZzpodHRwczovL21vaC1oZWFsdGhjZXJ0LXJlbmRlcmVyLm5ldGxpZnkuYXBwLyJ9fSwic2lnbmF0dXJlIjp7InR5cGUiOiJTSEEzTWVya2xlUHJvb2YiLCJ0YXJnZXRIYXNoIjoiMWUzZjhiNTZhMDYyNjE3MWExMWE1ZWFjNjhhY2EzZWZjYTBlNTdkNzE0NDQwN2ExOTk1ODUyZWVhMTUzNjQxNSIsInByb29mIjpbXSwibWVya2xlUm9vdCI6IjFlM2Y4YjU2YTA2MjYxNzFhMTFhNWVhYzY4YWNhM2VmY2EwZTU3ZDcxNDQ0MDdhMTk5NTg1MmVlYTE1MzY0MTUifSwicHJvb2YiOlt7InR5cGUiOiJPcGVuQXR0ZXN0YXRpb25TaWduYXR1cmUyMDE4IiwiY3JlYXRlZCI6IjIwMjEtMDgtMTZUMDI6NDk6NTQuOTQyWiIsInByb29mUHVycG9zZSI6ImFzc2VydGlvbk1ldGhvZCIsInZlcmlmaWNhdGlvbk1ldGhvZCI6ImRpZDpldGhyOjB4RTM5NDc5OTI4Q2M0RWZGRTUwNzc0NDg4NzgwQjlmNjE2YmQ0QjgzMCNjb250cm9sbGVyIiwic2lnbmF0dXJlIjoiMHgyY2QxMjk5MTcyYjFhYjc3ODQ2ZTY4MWZjMTI5ODBlM2I2OTJmYWI0ZjI3NjUwYTJjNzJhM2E0MmJiZDJiYWY0NDg5ZGM5YjEwNDRlZmJhMjFhNDNiMDI2MzhlZWEwMGZjNmE5MzIwZTU3NDExOGNlYWEyMzk5ZjE5ZDAzZTNmNzFjIn1dfQ==",
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
  "name": "HealthCert",
  "notarisationMetadata": Object {
    "notarisedOn": "1970-01-01T00:00:01.000Z",
    "passportNumber": "E7831177G",
    "reference": "e35f5d2a-4198-4f8f-96dc-d1afe0b67119",
    "url": "https://example.com",
  },
  "validFrom": "2021-05-18T06:43:12.152Z",
}
`);
});
