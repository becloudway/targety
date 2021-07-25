module.exports = {
    transform: {
        "^.+\\.[jt]sx?$": "./jest-preprocess.js",
    },
    testRegex: "(/__tests__/.*.(test|spec)).(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    coveragePathIgnorePatterns: ["(tests/.*.mock).(jsx?|tsx?)$", ".*/lib/.*"],
    verbose: true,
    testEnvironment: "node",
    coverageDirectory: "<rootDir>/coverage/",
};
