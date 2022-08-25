import { ApiError } from "./ApiError";
import { ErrorCode } from "./ErrorCode";

export class ValidationError extends ApiError {
    public static STATUS_CODE = 400;
    constructor(
        message: string | object,
        metadata: Record<string, unknown> = {},
        errorCode = ErrorCode.ValidationError,
    ) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }
        super(message, metadata, ValidationError.STATUS_CODE, errorCode);
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
