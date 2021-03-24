import healthcertWithNric from "../../../test/fixtures/example_notarized_healthcert_with_nric_wrapped.json";
import { notifyRecipient } from "./notifyRecipient";
import { publish } from "../../services/sns";
import { TestData } from "../healthCert";

jest.mock("../../services/sns");
jest.mock("../../config", () => ({
  config: {
    documentName: "HealthCert",
    notification: {
      enabled: true,
      senderName: "NOTARISE",
      senderLogo: "",
      templateID: "000",
      sns: {
        region: "ap-southeast-1",
        endpoint: {
          protocol: "http:",
          host: "localhost:4566",
          port: 4566,
          hostname: "localhost",
          pathname: "/",
          path: "/",
          href: "http://localhost:4566/"
        }
      },
      topicArn: "arn:aws:sns:ap-southeast-1:000000000000:PLACEHOLDER_SNS_TOPIC"
    }
  }
}));

const mockPublish = publish as jest.Mock;
const mockTestData: TestData = {
  provider: "{}",
  lab: "{}",
  swabType: "a",
  patientName: "Person",
  swabCollectionDate: "testdatetime1",
  performerName: "",
  performerMcr: "",
  observationDate: "",
  nric: "a",
  nationality: "",
  gender: "",
  passportNumber: "",
  birthDate: "{}",
  testType: "test1",
  testResult: "Negative"
};

describe("notifyRecipient", () => {
  beforeEach(() => {
    mockPublish.mockReset();
  });
  it("should send the right SPM notification if healthcert contains an NRIC", async () => {
    mockPublish.mockResolvedValue({ MessageId: "foobar" });
    await notifyRecipient({
      validFrom: "2020-11-16T06:26:19.160Z",
      url: "https://foo.bar/uuid",
      qrCode: "somestring",
      nric: "S9098989Z",
      passportNumber: "E7831177G",
      testData: [mockTestData]
    });
    expect(mockPublish.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "notification_req": Object {
            "category": "MESSAGES",
            "channel_mode": "SPM",
            "cta": Array [
              Object {
                "action_name": "View full cert",
                "action_type": "HYPERLINK",
                "action_url": "https://foo.bar/uuid",
              },
            ],
            "delivery": "IMMEDIATE",
            "priority": "HIGH",
            "sender_logo_small": "",
            "sender_name": "NOTARISE",
            "template_layout": Array [
              Object {
                "template_id": "SAFETRAVEL-QR-NTF-02",
                "template_input": Object {
                  "date": "2020-11-16T06:26:19.160Z",
                  "name": "Person",
                  "passport": "E7831177G",
                  "qrcode": "somestring",
                  "testdatetime": "testdatetime1",
                  "testresult": "Negative",
                  "testtype": "test1",
                  "title": "COVID-19 HEALTHCERT",
                },
              },
            ],
            "title": "Your notarised HealthCert is ready",
            "uin": "S9098989Z",
          },
        },
      ]
    `);
  });
  it("should skip sending an SPM notification if healthcert does not contain an NRIC", async () => {
    const healthcertWithoutNric = {
      ...healthcertWithNric
    } as any;
    const passportNumberIdentifier =
      healthcertWithoutNric.data.fhirBundle.entry[0].identifier[0];
    // remove nric identifier
    healthcertWithoutNric.data.fhirBundle.entry[0].identifier = [
      passportNumberIdentifier
    ];

    await notifyRecipient({
      validFrom: "2020-11-16T06:26:19.160Z",
      url: "https://foo.bar/uuid",
      qrCode: "somestring",
      passportNumber: "E7831177G",
      testData: [
        mockTestData,
        {
          ...mockTestData,
          swabCollectionDate: "testdatetime2",
          testType: "test2"
        }
      ]
    });
    expect(mockPublish).not.toHaveBeenCalled();
  });
  it("should create the right notification message if there are 2 tests", async () => {
    mockPublish.mockResolvedValue({ MessageId: "foobar" });
    await notifyRecipient({
      validFrom: "2020-11-16T06:26:19.160Z",
      url: "https://foo.bar/uuid",
      qrCode: "somestring",
      nric: "S9098989Z",
      passportNumber: "E7831177G",
      testData: [
        mockTestData,
        {
          ...mockTestData,
          swabCollectionDate: "testdatetime2",
          testType: "test2"
        }
      ]
    });
    expect(mockPublish.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "notification_req": Object {
            "category": "MESSAGES",
            "channel_mode": "SPM",
            "cta": Array [
              Object {
                "action_name": "View full cert",
                "action_type": "HYPERLINK",
                "action_url": "https://foo.bar/uuid",
              },
            ],
            "delivery": "IMMEDIATE",
            "priority": "HIGH",
            "sender_logo_small": "",
            "sender_name": "NOTARISE",
            "template_layout": Array [
              Object {
                "template_id": "SAFETRAVEL-QR-NTF-03",
                "template_input": Object {
                  "date": "2020-11-16T06:26:19.160Z",
                  "name": "Person",
                  "passport": "E7831177G",
                  "qrcode": "somestring",
                  "testdatetime": "testdatetime1",
                  "testdatetime2": "testdatetime2",
                  "testresult": "Negative",
                  "testresult2": "Negative",
                  "testtype": "test1",
                  "testtype2": "test2",
                  "title": "COVID-19 HEALTHCERT",
                },
              },
            ],
            "title": "Your notarised HealthCert is ready",
            "uin": "S9098989Z",
          },
        },
      ]
    `);
  });
});
