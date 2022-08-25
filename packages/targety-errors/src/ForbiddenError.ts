import { ApiError } from "./ApiError";
import { ErrorCode } from "./ErrorCode";

export class ForbiddenError extends ApiError {
    public static STATUS_CODE = 403;
    constructor(message: string, metadata: Record<string, unknown> = {}, errorCode = ErrorCode.Forbidden) {
        super(message, metadata, ForbiddenError.STATUS_CODE, errorCode);
        this.name = "ForbiddenError";
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
