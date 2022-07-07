import { getLogger } from "src/common/logger";
import { CodedError } from "src/common/error";
import { WorkflowContextData } from "src/types";
import { config } from "src/config";
import { IncomingWebhook } from "@slack/webhook";
import { payloadTemplate } from "./sendSlackNotificationTemplate";

const { info, error } = getLogger("src/models/sendSlackNotification");

export const sendSlackNotification = async (
  codedError: CodedError,
  context: WorkflowContextData
) => {
  // Disable Slack notifications in offline or local development
  if (config.isOffline) {
    const infoWithRef = info.extend(`reference:${context.reference}`);
    infoWithRef(
      "Skipped Slack notification in offline mode: ",
      codedError.toString()
    );
    return;
  }

  const errorWithRef = error.extend(`reference:${context.reference}`);
  const SLACK_WEBHOOK_URL = config.slack.webhookUrl;
  const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);

  try {
    const payload = payloadTemplate(codedError, context);
    await webhook.send(payload);
  } catch (e) {
    const codedErr = new CodedError(
      "SLACK_NOTIFICATION_ERROR",
      "Unable to send Slack notification",
      `${JSON.stringify(context)} - ${e instanceof Error ? e.message : e}`
    );
    errorWithRef(codedErr.toString()); // Log without throwing again
  }
};
