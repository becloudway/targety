const base = require("../../jest.config.base.js");

module.exports = {
    ...base,
    transform: {
        "^.+\\.[jt]sx?$": "../../jest-preprocess.js",
    },
    name: "targety-common",
    roots: ["<rootDir>/src", "<rootDir>/__tests__"],
    displayName: "Targety Common",
    //setupFiles: ["./__tests__/testSetup.js"],
};
