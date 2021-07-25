import * as Logger from "bunyan";
import debugStream from "bunyan-debug-stream";

const getLogLevel = (): Logger.LogLevel => {
    if (process.env.LOG_LEVEL && Logger.levelFromName[process.env.LOG_LEVEL as Logger.LogLevelString]) {
        return process.env.LOG_LEVEL as Logger.LogLevel;
    }
    return Logger.INFO;
};

const logger = process.env.DEBUG
    ? Logger.createLogger({
          name: "DEBUG_LOGGER",
          streams: [
              {
                  level: "debug",
                  type: "raw",
                  stream: debugStream({
                      basepath: __dirname, // this should be the root folder of your project.
                      forceColor: true,
                  }),
              },
          ],
          serializers: debugStream.serializers,
      })
    : Logger.createLogger({
          level: getLogLevel(),
          name: "APP",
      });

export const LOGGER: Logger = logger;
