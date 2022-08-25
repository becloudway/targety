const base = require("./jest.config.base.js");

module.exports = {
    ...base,
    projects: ["<rootDir>/packages/*/jest.config.js"],
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 71,
            functions: 74,
            lines: 83,
            statements: 82,
        },
    },
};
