const path = require("path");

const babelOptions = {
    configFile: path.join(__dirname, "babel.config.js"),
};

module.exports = require("babel-jest").createTransformer(babelOptions);
