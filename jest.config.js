module.exports = {
  transform: {
    "^.+\\.ts?$": "babel-jest",
    "\\.html": "jest-raw-loader",
    "\\.txt": "jest-raw-loader",
    "\\.subject": "jest-raw-loader",
  },

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
};
