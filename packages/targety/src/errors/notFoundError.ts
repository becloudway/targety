import { ApiError, ErrorCode } from "./apiError";

export class NotFoundError extends ApiError {
    public static STATUS_CODE = 404;
    constructor(message: string, errorCode = ErrorCode.NotFound) {
        super(message, NotFoundError.STATUS_CODE, errorCode);
        this.name = "NotFoundError";
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
