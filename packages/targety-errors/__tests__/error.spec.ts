import {
    ApiError,
    BadRequestError,
    ConflictError,
    ErrorCode,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "../src";

describe("./errors", () => {
    describe("#ApiError", () => {
        const errorMessage = "message";
        const errorCode = ErrorCode.BadRequest;
        const error = new ApiError(errorMessage, {}, 404, errorCode);

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("has a message", () => {
            expect(error.message).toEqual(errorMessage);
        });

        it("has a statusCode", () => {
            expect(error.statusCode).toEqual(404);
        });

        it("has an errorCode", () => {
            expect(error.errorCode).toEqual(errorCode);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("ApiError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("ApiError");
        });
    });

    describe("#BadRequestError", () => {
        const error = new BadRequestError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a BadRequestError", () => {
            expect(error).toBeInstanceOf(BadRequestError);
        });

        it("is a not a ForbiddenError", () => {
            expect(error).not.toBeInstanceOf(ForbiddenError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.BadRequest);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("BadRequestError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("BadRequestError");
        });
    });

    describe("#ConflictError", () => {
        const error = new ConflictError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a ConflictError", () => {
            expect(error).toBeInstanceOf(ConflictError);
        });

        it("is a not a ForbiddenError", () => {
            expect(error).not.toBeInstanceOf(ForbiddenError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.Conflict);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("ConflictError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("ConflictError");
        });
    });
    describe("#ForbiddenError", () => {
        const error = new ForbiddenError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a ForbiddenError", () => {
            expect(error).toBeInstanceOf(ForbiddenError);
        });

        it("is a not a BadRequestError", () => {
            expect(error).not.toBeInstanceOf(BadRequestError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.Forbidden);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("ForbiddenError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("ForbiddenError");
        });
    });
    describe("#UnauthorizedError", () => {
        const error = new UnauthorizedError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a UnauthorizedError", () => {
            expect(error).toBeInstanceOf(UnauthorizedError);
        });

        it("is a not a BadRequestError", () => {
            expect(error).not.toBeInstanceOf(BadRequestError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.Unauthorized);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("UnauthorizedError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("UnauthorizedError");
        });
    });
    describe("#NotFoundError", () => {
        const error = new NotFoundError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a NotFoundError", () => {
            expect(error).toBeInstanceOf(NotFoundError);
        });

        it("is a not a BadRequestError", () => {
            expect(error).not.toBeInstanceOf(BadRequestError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.NotFound);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("NotFoundError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("NotFoundError");
        });
    });
    describe("#ValidationError", () => {
        const error = new ValidationError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a ValidationError", () => {
            expect(error).toBeInstanceOf(ValidationError);
        });

        it("is a not a BadRequestError", () => {
            expect(error).not.toBeInstanceOf(BadRequestError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.ValidationError);
        });

        it("allows for a validationErrorObject to be the errorMessage", () => {
            const validatioMessage = { fields: [{ key: "hello", value: "world" }] };
            const validationError = new ValidationError(validatioMessage);
            expect(typeof validationError.message).toEqual("string");
            expect(validationError.message).toEqual(JSON.stringify(validatioMessage));
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("ValidationError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("ValidationError");
        });
    });
    describe("#InternalServerError", () => {
        const error = new InternalServerError("errorMessage");

        it("is an Error", () => {
            expect(error).toBeInstanceOf(Error);
        });

        it("is an ApiError", () => {
            expect(error).toBeInstanceOf(ApiError);
        });

        it("is a InternalServerError", () => {
            expect(error).toBeInstanceOf(InternalServerError);
        });

        it("is a not a BadRequestError", () => {
            expect(error).not.toBeInstanceOf(BadRequestError);
        });

        it("has a default errorCode", () => {
            expect(error.errorCode).toEqual(ErrorCode.InternalServerError);
        });

        it("has a stacktrace", () => {
            expect(error.stack).toMatch("InternalServerError:");
        });

        it("has a name", () => {
            expect(error.name).toEqual("InternalServerError");
        });
    });
});
