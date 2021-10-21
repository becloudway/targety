/**
 * ErrorCode is a string representation of the type of error
 */
export enum ErrorCode {
    // DEFAULT ERROR CODES
    BadRequest = "BadRequest",
    Conflict = "Conflict",
    Forbidden = "Forbidden",
    InternalServerError = "InternalServerError",
    NotFound = "NotFound",
    Unauthorized = "Unauthorized",
    ValidationError = "ValidationError",
}

/**
 * ApiError Class
 *
 * @remarks Used by the ApiGateway Lambdas
 */
export class ApiError extends Error {
    public errorCode: ErrorCode;
    public statusCode: number;

    public metadata = new Map<string, unknown>();

    public static STATUS_CODE: number;

    constructor(message: string, statusCode: number, errorCode: ErrorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.name = "ApiError";
    }

    public metadataToJson(): Record<string, unknown> {
        return Object.fromEntries(this.metadata);
    }
}
