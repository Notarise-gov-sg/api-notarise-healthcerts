/* eslint-disable @typescript-eslint/no-var-requires */
// aws-sdk is already included in AWS Lambda
// eslint-disable-next-line import/no-extraneous-dependencies
const { STS } = require("aws-sdk");

module.exports.checkIfProd = (serverless) => {
  if (
    serverless &&
    serverless.cliInputArgv &&
    serverless.cliInputArgv instanceof Array
  ) {
    const args = serverless.cliInputArgv;
    const stgIndex = args.indexOf("--stage");
    const stage = stgIndex !== -1 ? args[stgIndex + 1] : "";
    if (stage.endsWith("prod")) return stage;
  }
  return "";
};

module.exports.getAccountId = async () => {
  if (process.env.IS_OFFLINE) return "123456789012";
  else {
    try {
      const sts = new STS();
      const result = await sts.getCallerIdentity().promise();
      if (typeof result.Account !== "string") throw new Error("No account!");
      return result.Account;
    } catch (e) {
      return "*";
    }
  }
};
