import { IncomingWebhookSendArguments } from "@slack/webhook";
import { WorkflowContextData } from "../../../types";
import { CodedError } from "../../../common/error";

export const payloadTemplate = (
  codedError: CodedError,
  context: WorkflowContextData
) => {
  const payload = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${codedError.type}*\n${codedError.message} - ${codedError.details}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "*Repo*: `#api-notarise-healthcerts`",
          },
          {
            type: "mrkdwn",
            text: `*Reference*: \`${context.reference}\``,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${JSON.stringify(
            { codedError, context },
            null,
            2
          )}\`\`\``,
        },
      },
    ],
  };

  return payload as IncomingWebhookSendArguments;
};
