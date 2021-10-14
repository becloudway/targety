/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApiGateWayProxyEvent } from "@dev/test-helper";
import "reflect-metadata";
import { CORS, DefaultCORS, Get, Handler, LambdaProxyEvent, Middleware, Request, ResponseBody, S3 } from "../src";

const getProfileStub = jest.fn().mockReturnValue({ test: "data" });
const getS3Stub = jest.fn().mockReturnValue({ test: "data" });

@DefaultCORS({ ExposedHeaders: [], AllowCredentials: true, AllowHeaders: ["x-api-key"] })
class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [];

    @Get("/test-endpont/{id}")
    @CORS({ ExposedHeaders: ["x-test"] })
    public async getProfile(req: Request) {
        return getProfileStub(req);
    }

    @Get("/")
    @CORS({ ExposedHeaders: ["x-test"] })
    public async rootPath(req: Request) {
        return getProfileStub(req);
    }

    @S3("some-event")
    public async handleS3Event(req: Request) {
        return getS3Stub(req);
    }
}

class UndefinedMiddlewareImplementation extends Handler {
    public middleware: Middleware[];

    @Get("/test-endpont/{id}")
    public async getProfile(req: Request) {
        return getProfileStub(req);
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
        it("returns 500 response when Routepath is unknown", async () => {
            event.httpMethod = "PATCH";
            request = new Request(event);
            const response = await handlerImplementation.handle(request);
            expect(response.statusCode).toEqual(404);
        });
        it("invokes correct path", async () => {
            const result = await handlerImplementation.handle(request);
            console.log(result);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it("issue-1: should not fail when no middleware is defined", async () => {
            const impl = new UndefinedMiddlewareImplementation();
            await impl.handle(request);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it("invokes options", async () => {
            event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = "OPTIONS";
            event.resource = "/test-endpont/{id}";
            request = new Request(event);
            const response = await handlerImplementation.handle(request);
            expect(response).toMatchSnapshot();
        });
        it("applies middleware and continues to correct path if middleware does not contain response", async () => {
            const middlewareMock = jest.fn().mockResolvedValue("OK");
            handlerImplementation.middleware.push(middlewareMock);
            const response = await handlerImplementation.handle(request);
            expect(middlewareMock).toHaveBeenCalledTimes(1);
            expect(middlewareMock).toHaveBeenCalledWith(request, expect.anything(), undefined);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it("applies middleware and returns middleware ApiResponse", async () => {
            const middlewareMock = jest.fn().mockResolvedValue(new ResponseBody({ statusCode: 406 }));
            handlerImplementation.middleware.push(middlewareMock);
            const response = await handlerImplementation.handle(request);
            expect(middlewareMock).toHaveBeenCalledTimes(1);
            expect(middlewareMock).toHaveBeenCalledWith(request, expect.anything(), undefined);
            expect(getProfileStub).not.toHaveBeenCalled();
            expect(response.statusCode).toEqual(406);
        });
    });

    describe("#ProxyPaths", () => {
        /**
         * Inconsistency issues on multiple runs
         */
        for (let i = 0; i < 20; i++) {
            it(`invokes proxy complex path, attempt #${i + 1}`, async () => {
                event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
                event.httpMethod = "GET";
                event.resource = "/{proxy+}";
                event.path = "/test-endpont/1234";
                request = new Request(event);
                await handlerImplementation.handle(request);
                expect(getProfileStub).toHaveBeenCalledTimes(1);
                expect(getProfileStub).toHaveBeenCalledWith(request);
            });
        }

        it("invokes proxy root path", async () => {
            event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = "GET";
            event.resource = "/{proxy+}";
            event.path = "/";
            request = new Request(event);
            await handlerImplementation.handle(request);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });

        it("invokes proxy test-endpoint path", async () => {
            event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = "GET";
            event.resource = "/{proxy+}";
            event.path = "/test-endpont/1234";
            request = new Request(event);
            await handlerImplementation.handle(request);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });

        it("invokes nothing with a bogus path", async () => {
            event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = "GET";
            event.resource = "/{proxy+}";
            event.path = "/test-endpont/pizza/test123";
            request = new Request(event);
            await handlerImplementation.handle(request);
            expect(getProfileStub).not.toHaveBeenCalled();
        });

        it("invokes nothing with a path that does not exist", async () => {
            event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
            event.httpMethod = "GET";
            event.resource = "/{proxy+}";
            event.path = "/test-endpont";
            request = new Request(event);
            await handlerImplementation.handle(request);
            expect(getProfileStub).not.toHaveBeenCalled();
        });
    });
});
