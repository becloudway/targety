const babelOptions = {
    configFile: "./babel.config.js",
};

module.exports = require("babel-jest").createTransformer(babelOptions);
