import { ApiError, ErrorCode } from "./apiError";

export class ConflictError extends ApiError {
    public static STATUS_CODE = 409;
    constructor(message: string, errorCode = ErrorCode.Conflict) {
        super(message, ConflictError.STATUS_CODE, errorCode);
        this.name = "ConflictError";
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
