import fse from "fs-extra";

type mergedEntry = {
  name: string;
  id: string;
  domain?: string;
};

type apiKeyIdEntry = {
  id: string;
  name: string;
};

type domainEntry = {
  domain: string;
  name: string;
};

const params = process.argv.slice(2);
if (params.length < 2) {
  throw new Error("Provider api key id path required");
}

/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const apiKeyIdsPath = params[0];
const apiKeyIdsEntries = fse.readFileSync(apiKeyIdsPath).toString();
const apiKeyIds: apiKeyIdEntry[] = JSON.parse(apiKeyIdsEntries);

const domainsPath = params[1];
const domainsEntries = fse.readFileSync(domainsPath).toString();
const domains: domainEntry[] = JSON.parse(domainsEntries);

const merged: mergedEntry[] = [];
const domainsDict: { [key: string]: string[] } = {};
domains.forEach((entry) => {
  if (domainsDict[entry.name] !== undefined) {
    domainsDict[entry.name].push(entry.domain);
  } else {
    domainsDict[entry.name] = [entry.domain];
  }
});

apiKeyIds.forEach((entry) => {
  if (domainsDict[entry.name] !== undefined) {
    domainsDict[entry.name].forEach((domain) => {
      merged.push({ ...entry, domain });
    });
  } else {
    merged.push(entry);
  }
});

merged.sort(function (a, b) {
  return a.domain !== undefined ? -1 : b.domain !== undefined ? 1 : 0;
});

fse.outputFileSync(
  "src/static/provider_apikeyid.merged.json",
  JSON.stringify(merged, null, 2)
);
