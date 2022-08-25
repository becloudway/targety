/* eslint-disable @typescript-eslint/ban-types */

import Pino from "pino";

import { BaseLogger } from "./BaseLogger";
import { LevelWithSilent } from "./Levels";

export class LoggerWrapper implements BaseLogger {
    private _logger: Pino.Logger;

    public constructor(optionsOrStream?: Pino.LoggerOptions | Pino.DestinationStream) {
        this._logger = Pino(optionsOrStream);
    }

    public fatal(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.fatal(obj, msg, args);
    }

    public error(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.error(obj, msg, args);
    }

    public warn(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.warn(obj, msg, args);
    }

    public info(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.info(obj, msg, args);
    }

    public debug(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.debug(obj, msg, args);
    }

    public trace(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.trace(obj, msg, args);
    }

    public silent(obj: Object, msg?: string, ...args: any[]): void {
        this._logger.silent(obj, msg, args);
    }

    public get level(): LevelWithSilent | string {
        return this._logger.level as LevelWithSilent | string;
    }

    public set level(level: LevelWithSilent | string) {
        this._logger.level = level;
    }

    public get logger(): Pino.Logger {
        return this._logger;
    }
}
