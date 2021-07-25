import { UnauthorizedError, ApiError, ForbiddenError } from "../errors";
import { logAuditEvent, AuditEventType, StateType } from "../logging";
import { Middleware, Request } from "..";
import { MiddlewareFollowUp } from "../MiddlewareHandler";
import { ResponseBody } from "../ResponseBody";
import { Context } from "../common/interfaces";
import { Route } from "../Route";

/**
 * Logs an audit entry for a failed request when the error is
 * Forbidden or Unauthorized
 *
 * @remark
 * Also logs unknown attempts and error attempts
 * - ERROR: can occur whenever something went wrong that we intended to happen. Aka. there is an api error for it
 * - UNKNOWN: can occur whenever something goes wrong that we are unaware off or did not intend.
 *
 * @param startAuditTrail start Date of the audit trail (when the middleware is activated)
 * @param awsContext the context coming from AWS
 */
function onError(
    startAuditTrail: Date,
    awsContext: Context,
): (request: Request, error: ApiError | Error) => Promise<void> {
    return async (request: Request, error: ApiError | Error): Promise<void> => {
        if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
            logAuditEvent({
                type: AuditEventType.AUTHORIZATION_ATTEMPT,
                state: StateType.FAILED,
                startTime: startAuditTrail,
                endTime: new Date(),
                data: {
                    path: request.getPath(),
                    method: request.getMethod(),
                    error: {
                        message: error.message,
                        code: error.errorCode,
                    },
                    statusCode: error.statusCode,
                },
                userAgent: request.getUserAgent(),
                forwardedIps: request.getForwardedIps(),
                awsRequestId: awsContext?.awsRequestId,
            });
        } else if (error instanceof ApiError) {
            logAuditEvent({
                type: AuditEventType.AUTHORIZATION_ATTEMPT,
                state: StateType.ERROR,
                startTime: startAuditTrail,
                endTime: new Date(),
                data: {
                    path: request.getPath(),
                    method: request.getMethod(),
                    error: {
                        message: error.message,
                        code: error.errorCode,
                    },
                    statusCode: error.statusCode,
                },
                userAgent: request.getUserAgent(),
                forwardedIps: request.getForwardedIps(),
                awsRequestId: awsContext?.awsRequestId,
            });
        } else {
            logAuditEvent({
                type: AuditEventType.AUTHORIZATION_ATTEMPT,
                state: StateType.UNKNOWN,
                startTime: startAuditTrail,
                endTime: new Date(),
                data: {
                    path: request.getPath(),
                    method: request.getMethod(),
                    error: {
                        message: error.message,
                        code: "UNKNOWN",
                    },
                    statusCode: "UNKNOWN",
                },
                userAgent: request.getUserAgent(),
                forwardedIps: request.getForwardedIps(),
                awsRequestId: awsContext?.awsRequestId,
            });
        }
    };
}

/**
 * Logs a successful audit entry when a call that was authorized did succeed
 *
 * @param startAuditTrail start Date of the audit trail (when the middleware is activated)
 * @param awsContext the context coming from AWS
 */
function onSuccess(
    startAuditTrail: Date,
    awsContext: Context,
): (request: Request, response: ResponseBody) => Promise<ResponseBody> {
    return async (request: Request, response: ResponseBody): Promise<ResponseBody> => {
        logAuditEvent({
            type: AuditEventType.AUTHORIZATION_ATTEMPT,
            state: StateType.SUCCESS,
            startTime: startAuditTrail,
            endTime: new Date(),
            data: {
                path: request.getPath(),
                method: request.getMethod(),
                body: request.getBody() || {},
                pathParams: request.getPathParams() || {},
                queryParams: request.getQueryParams() || {},
                statusCode: response.statusCode,
            },
            userAgent: request.getUserAgent(),
            forwardedIps: request.getForwardedIps(),
            awsRequestId: awsContext?.awsRequestId,
        });
        return response;
    };
}

/**
 *  Middleware that logs audit entries
 */
export const auditLog: Middleware = async (
    request: Request,
    action: Route,
    context: Context,
): Promise<MiddlewareFollowUp | void> => {
    const startAuditTrail = new Date();
    const awsContext = context;

    return {
        onError: onError(startAuditTrail, awsContext),
        onSuccess: onSuccess(startAuditTrail, awsContext),
    };
};
