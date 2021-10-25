const base = require("../../jest.config.base.js");

module.exports = {
    ...base,
    transform: {
        "^.+\\.[jt]sx?$": "../../jest-preprocess.js",
    },
    name: "targety-errors",
    roots: ["<rootDir>/src", "<rootDir>/__tests__"],
    displayName: "Targety Errors",
    setupFiles: ["./__tests__/testSetup.js"],
};
