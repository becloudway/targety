import { ApiError } from "./ApiError";
import { ErrorCode } from "./ErrorCode";

export class ConflictError extends ApiError {
    public static STATUS_CODE = 409;
    constructor(message: string, metadata: Record<string, unknown> = {}, errorCode = ErrorCode.Conflict) {
        super(message, metadata, ConflictError.STATUS_CODE, errorCode);
        this.name = "ConflictError";
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
