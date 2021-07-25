import { LOGGER } from "../../logging";

export enum LogLevel {
    INFO = "info",
    DEBUG = "debug",
    SILLY = "silly",
}

export function Log(additionalMessage?: string, level: LogLevel = LogLevel.DEBUG): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        ((LOGGER as any)[level] as Function)(
            `calling ${target.constructor.name}.${propertyKey}${additionalMessage ? " - " + additionalMessage : ""}`,
        );
    };
}
