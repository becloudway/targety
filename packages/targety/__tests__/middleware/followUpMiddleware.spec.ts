/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApiGateWayProxyEvent } from "@dev/test-helper";
import "reflect-metadata";
import { GenericRequest } from "../../src";
import { ApiError } from "../../src/errors";
import { MiddlewareFollowUp } from "../../src/MiddlewareHandler";
import {
    CORS,
    DefaultCORS,
    Get,
    Handler,
    LambdaProxyEvent,
    Middleware,
    Request,
    ResponseBody,
    Response,
    S3,
} from "../../src";
import { ErrorCode } from "../../lib/errors";

const getProfileStub = jest.fn().mockReturnValue({ test: "data" });
const getS3Stub = jest.fn().mockReturnValue({ test: "data" });

const errorMiddleware: Middleware = async (): Promise<MiddlewareFollowUp> => {
    console.log("Loaded middleware");
    return {
        onError: async (request: GenericRequest, e: ApiError | Error): Promise<ResponseBody> => {
            return Response.forbidden(request as Request).send({ hidden: "The error is now hidden" });
        },
        onSuccess: async (request: GenericRequest, response: ResponseBody): Promise<ResponseBody> => {
            return response;
        },
    };
};

@DefaultCORS({ ExposedHeaders: [], AllowCredentials: true, AllowHeaders: ["x-api-key"] })
class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [errorMiddleware];

    @Get("/test-endpont/{id}")
    @CORS({ ExposedHeaders: ["x-test"] })
    public async getProfile(req: Request) {
        throw new ApiError("some", 400, ErrorCode.Forbidden);
    }
}

let handlerImplementation: any;
let event: LambdaProxyEvent;
let request: any;

describe("Handler", () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
        event.httpMethod = "GET";
        event.resource = "/test-endpont/{id}";
        request = new Request(event);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("is an abstract class that needs extending", () => {
        expect(handlerImplementation).toBeInstanceOf(Handler);
    });

    describe("setValidDomains", () => {
        const originalValue = process.env.NO_ALLOWED_DOMAINS;
        beforeAll(() => {
            process.env.NO_ALLOWED_DOMAINS = "false";
        });

        afterAll(() => {
            process.env.NO_ALLOWED_DOMAINS = originalValue;
        });
    });

    describe("#handle", () => {
        it("invokes correct path", async () => {
            const result = await handlerImplementation.handle(request);
            expect(result).toMatchSnapshot();
        });
    });
});
