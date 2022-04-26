import * as AWSTypes from "aws-sdk";
import { AWS } from "../awsSdk";

const options = process.env.IS_OFFLINE
  ? {
      accessKeyId: "DEFAULT_ACCESS_KEY",
      secretAccessKey: "DEFAULT_ACCESS_KEY",
      region: "ap-southeast-1",
      endpoint: new AWS.Endpoint("http://localhost:8002"),
    }
  : {};

export const dynamoDB = new AWS.DynamoDB.DocumentClient(
  options
) as AWSTypes.DynamoDB.DocumentClient;

export const getItem = (
  params: AWSTypes.DynamoDB.GetItemInput
): Promise<AWSTypes.DynamoDB.AttributeMap | null> =>
  dynamoDB
    .get(params)
    .promise()
    .then((result: any) => {
      if (result && result.Item) {
        return result.Item;
      }
      return null;
    });
export const queryItems = (
  params: AWSTypes.DynamoDB.QueryInput
): Promise<AWSTypes.DynamoDB.AttributeMap[]> =>
  dynamoDB
    .query(params)
    .promise()
    .then((result: any) => {
      if (result && result.Items) {
        return result.Items;
      }
      return [];
    });
