const base = require("../../jest.config.base.js");

module.exports = {
    ...base,
    transform: {
        "^.+\\.[jt]sx?$": "../../jest-preprocess.js",
    },
    name: "targety-logger",
    roots: ["<rootDir>/src", "<rootDir>/__tests__"],
    displayName: "Targety Logger",
    setupFiles: ["./__tests__/testSetup.js"],
};
