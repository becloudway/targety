import Logger from "pino";

const getLogLevel = (): Logger.Level => {
    if (process.env.LOG_LEVEL) {
        return process.env.LOG_LEVEL as Logger.Level;
    }
    return "fatal";
};

const logLevel = getLogLevel();

const logger = Logger({
    level: logLevel,
    name: "APP",
});

export const LOGGER: Logger.Logger = logger;
