import Logger from "pino";
import { LoggerWrapper } from "./LoggerWrapper";

/**
 * Returns the log level defined in the ENV variable LOG_LEVEL
 * or returns the default log level aka. fatal
 */
const getLogLevel = (): Logger.Level => {
    if (process.env.LOG_LEVEL) {
        return process.env.LOG_LEVEL as Logger.Level;
    }
    return "fatal";
};

const logLevel = getLogLevel();

/**
 * Creates the default logger
 */
const logger = new LoggerWrapper({
    level: logLevel,
    name: "DEFAULT",
    base: undefined,
});

export const LOGGER: LoggerWrapper = logger;

/**
 * Creates a logger with the defined log level see [[getLogLevel]] and additional properties
 * for the options see: https://github.com/pinojs/pino/blob/master/docs/api.md#options for detailed information
 * about the available options.
 *
 * Optionally install @types/pino for better type support
 *
 * @param name the name of the logger
 * @param options the aditional options according to pino
 */
export const createLogger = (name: string, options: Logger.LoggerOptions): LoggerWrapper =>
    new LoggerWrapper({
        level: logLevel,
        name,
        base: undefined,
        ...options,
    });
