import { ApiError, ErrorCode } from "./apiError";

export class ValidationError extends ApiError {
    public static STATUS_CODE = 400;
    constructor(message: string | object, errorCode = ErrorCode.ValidationError) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }
        super(message, ValidationError.STATUS_CODE, errorCode);
        this.name = "ValidationError";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
