import * as Logger from "bunyan";

const { SUPPRESS_AUDIT_LOGS } = process.env;

export const AUDIT_LOGGER: Logger = Logger.createLogger({
    level: SUPPRESS_AUDIT_LOGS ? Logger.ERROR : Logger.INFO,
    name: "AUDIT",
});

/**
 * Possible types of audit events
 */
export enum AuditEventType {
    AUTHORIZATION_ATTEMPT = "AUTHORIZATION_ATTEMPT",
}

/**
 * The final state of the event that occurred
 */
export enum StateType {
    /** Authentication attempt failed */
    FAILED = "FAILED",
    /** Authentication attempt was a success */
    SUCCESS = "SUCCESS",
    /** Something unknown happened after or before the user authenticated */
    UNKNOWN = "UNKNOWN",
    /** An API error was thrown after successful authentication */
    ERROR = "ERROR",
}

/**
 * Data that should be part of an audit log event
 */
export interface AuditEvent {
    type: AuditEventType;
    state: StateType;
    data?: object;
    forwardedIps?: Array<string>;
    userAgent?: string;
    identity?: object;
    startTime: Date;
    endTime: Date;
    tookMs?: number;
    awsRequestId?: string;
}

/**
 * Logs an audit event as an info log entry
 *
 * @param event the event that occurred
 */
export const logAuditEvent = (event: AuditEvent): void => {
    event.tookMs = event.endTime.getMilliseconds() - event.startTime.getMilliseconds();
    AUDIT_LOGGER.info(event);
};

/**
 * Logs an audit event as a warning log entry
 *
 * @param event the event that occurred
 */
export const logCriticalAuditEvent = (event: AuditEvent): void => {
    event.tookMs = event.endTime.getMilliseconds() - event.startTime.getMilliseconds();
    AUDIT_LOGGER.warn(event);
};
