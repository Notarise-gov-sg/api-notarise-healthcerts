module.exports = {
  transform: {
    "^.+\\.ts?$": "babel-jest",
    "\\.html": "jest-raw-loader",
    "\\.txt": "jest-raw-loader",
    "\\.subject": "jest-raw-loader",
  },
};
