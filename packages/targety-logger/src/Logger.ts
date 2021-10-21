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
    name: "DEFAULT",
});

export const LOGGER: Logger.Logger = logger;
export const createLogger = (name: string, options: Logger.LoggerOptions): Logger.Logger =>
    Logger({
        level: logLevel,
        name,
        ...options,
    });
