import { authorizedIssuers } from "./authorizedIssuersMap";

export const isAuthorizedIssuer = (domain: string): boolean => {
  return authorizedIssuers.has(domain.toLowerCase());
};

export const getIssuer = authorizedIssuers.get;
