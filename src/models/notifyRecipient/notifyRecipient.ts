import { publish } from "../../services/sns";
import { getSpmTemplateInput, SpmPayload } from "./notification";
import { config } from "../../config";
import { getLogger } from "../../common/logger";
import { TestData } from "../healthCert";

const { trace } = getLogger("src/models/notifyRecipient");

interface NotifyRecipientProps {
  url: string;
  qrCode: string;
  nric?: string;
  passportNumber: string;
  testData: TestData[];
  validFrom: string;
}

/* eslint-disable @typescript-eslint/camelcase */
export const notifyRecipient = async ({
  url,
  qrCode,
  nric,
  passportNumber,
  testData,
  validFrom
}: NotifyRecipientProps) => {
  if (!config.notification.enabled) {
    trace(
      `Notification is disabled: Enable it by setting NOTIFICATION_ENABLED=true`
    );
    return;
  }

  if (!nric) {
    trace("Skipping SPM notification as the cert doesnt contain an NRIC");
    return;
  }
  const template = getSpmTemplateInput(
    qrCode,
    passportNumber,
    testData,
    validFrom
  );
  const notification: SpmPayload = {
    notification_req: {
      uin: nric,
      channel_mode: "SPM",
      delivery: "IMMEDIATE",
      template_layout: [template],
      title: "Your notarised HealthCert is ready",
      sender_name: config.notification.senderName,
      sender_logo_small: config.notification.senderLogo,
      category: "MESSAGES",
      priority: "HIGH",
      cta: [
        {
          action_name: "View full cert",
          action_url: url,
          action_type: "HYPERLINK"
        }
      ]
    }
  };
  const { MessageId } = await publish(notification);
  trace(`Notification queued ${MessageId}`);
};
/* eslint-enable @typescript-eslint/camelcase */
