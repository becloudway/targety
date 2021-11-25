import { LevelWithSilent } from "./Levels";
import { LogFn } from "./LogFn";

export interface BaseLogger {
    level: LevelWithSilent | string;
    fatal: LogFn;
    error: LogFn;
    warn: LogFn;
    info: LogFn;
    debug: LogFn;
    trace: LogFn;
    silent: LogFn;
}
