import { APIGateway } from "aws-sdk";

const options: APIGateway.ClientConfiguration = {
  endpoint: "",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
  region: "",
};

export const apig = new APIGateway(options);
