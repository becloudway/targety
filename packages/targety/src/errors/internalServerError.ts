import { ApiError, ErrorCode } from "./apiError";

export class InternalServerError extends ApiError {
    public static STATUS_CODE = 500;
    constructor(message: string, errorCode = ErrorCode.InternalServerError) {
        super(message, InternalServerError.STATUS_CODE, errorCode);
        this.name = "InternalServerError";
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
