module.exports = {
    ignore: ["/node_modules/"],
    presets: [["@babel/preset-env", { targets: { node: "current", esmodules: true } }], "@babel/typescript"],
    plugins: [
        "@babel/proposal-object-rest-spread",
        "@babel/plugin-syntax-dynamic-import",
        "babel-plugin-transform-typescript-metadata",
        [
            "@babel/plugin-proposal-decorators",
            {
                legacy: true,
            },
        ],
        [
            "@babel/plugin-proposal-class-properties",
            {
                loose: true,
            },
        ],
        "@babel/plugin-proposal-json-strings",
        "@babel/plugin-proposal-export-namespace-from",
        "@babel/plugin-proposal-numeric-separator",
        "@babel/plugin-proposal-throw-expressions",
        "@babel/plugin-proposal-export-default-from",
        "@babel/plugin-proposal-logical-assignment-operators",
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-do-expressions",
        "@babel/plugin-proposal-function-bind",
    ],
};
