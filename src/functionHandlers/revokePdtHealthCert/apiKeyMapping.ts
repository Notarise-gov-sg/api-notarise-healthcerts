import _ from "lodash";
import providerApiKeyMapping from "../../static/provider_apikeyid.merged.json";

// Get provider domain given API key
export const getProvider = (providerApiKey: any) =>
  _.find(providerApiKeyMapping, { id: providerApiKey });
