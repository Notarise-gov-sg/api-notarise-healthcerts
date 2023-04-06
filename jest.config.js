module.exports = {
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "\\.html": "jest-raw-loader",
    "\\.txt": "jest-raw-loader",
    "\\.subject": "jest-raw-loader",
  },
  moduleNameMapper: {
    axios: "axios/dist/node/axios.cjs",
  },
};
