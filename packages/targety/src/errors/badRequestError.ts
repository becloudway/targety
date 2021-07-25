import { ApiError, ErrorCode } from "./apiError";

export class BadRequestError extends ApiError {
    public static STATUS_CODE = 400;
    constructor(message: string, errorCode = ErrorCode.BadRequest) {
        super(message, BadRequestError.STATUS_CODE, errorCode);
        this.name = "BadRequestError";
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
