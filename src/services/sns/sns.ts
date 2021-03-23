import * as AWSTypes from "aws-sdk";
import { config } from "../../config";
import { AWS } from "../awsSdk";

const sns = new AWS.SNS(config.notification.sns) as AWSTypes.SNS;

export const publish = (message: any) => {
  return sns
    .publish({
      Message: JSON.stringify(message),
      TopicArn: config.notification.topicArn
    })
    .promise();
};
