import { ApiError } from "./ApiError";
import { ErrorCode } from "./ErrorCode";

export class BadRequestError extends ApiError {
    public static STATUS_CODE = 400;
    constructor(message: string, metadata: Record<string, unknown> = {}, errorCode = ErrorCode.BadRequest) {
        super(message, metadata, BadRequestError.STATUS_CODE, errorCode);
        this.name = "BadRequestError";
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
