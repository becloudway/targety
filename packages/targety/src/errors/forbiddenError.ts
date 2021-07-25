import { ApiError, ErrorCode } from "./apiError";

export class ForbiddenError extends ApiError {
    public static STATUS_CODE = 403;
    constructor(message: string, errorCode = ErrorCode.Forbidden) {
        super(message, ForbiddenError.STATUS_CODE, errorCode);
        this.name = "ForbiddenError";
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
