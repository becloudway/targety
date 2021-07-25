/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApiGateWayProxyEvent } from "@dev/test-helper";
import "reflect-metadata";
import { CORS, DefaultCORS, Get, LambdaProxyEvent, Request, ResponseBody } from "../src";
import { Handler } from "../src/Handler";
import { Middleware } from "../src/MiddlewareHandler";

const getProfileStub = jest.fn();

@DefaultCORS({ ExposedHeaders: [], AllowCredentials: true, AllowHeaders: ["x-api-key"] })
class HandlerImplementation extends Handler {
    protected middleware: Middleware[] = [];

    @Get("/test-endpont/{id}")
    @CORS({ ExposedHeaders: ["x-test"] })
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
        event = (ApiGateWayProxyEvent.get() as unknown) as LambdaProxyEvent;
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
            const response = await handlerImplementation.handle(request);
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it("invokes options", async () => {
            event = (ApiGateWayProxyEvent.get() as unknown) as LambdaProxyEvent;
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
            expect(middlewareMock).toHaveBeenCalledWith(
                request,
                handlerImplementation.getRouteConfig(request),
                undefined,
            );
            expect(getProfileStub).toHaveBeenCalledTimes(1);
            expect(getProfileStub).toHaveBeenCalledWith(request);
        });
        it("applies middleware and returns middleware ApiResponse", async () => {
            const middlewareMock = jest.fn().mockResolvedValue(new ResponseBody({ statusCode: 406 }));
            handlerImplementation.middleware.push(middlewareMock);
            const response = await handlerImplementation.handle(request);
            expect(middlewareMock).toHaveBeenCalledTimes(1);
            expect(middlewareMock).toHaveBeenCalledWith(
                request,
                handlerImplementation.getRouteConfig(request),
                undefined,
            );
            expect(getProfileStub).not.toHaveBeenCalled();
            expect(response.statusCode).toEqual(406);
        });
    });

    describe("#getRouteConfig", () => {
        it("parses a routeConfig from a request", () => {
            const route = handlerImplementation.getRouteConfig(request);

            expect(route.method).toEqual("GET");
            expect(route.name).toEqual("getProfile");
            expect(route.path).toEqual("/test-endpont/{id}");
        });
        it("returns Undefined Route error when METHOD + PATH is not in routeConfig", () => {
            event.httpMethod = "PATCH";
            request = new Request(event);
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow("Route undefined");
        });
        it("returns Undefined Route error when METHOD is missing", () => {
            delete request.method;
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow("Route undefined");
        });
        it("returns Undefined Route error when PATH is missing", () => {
            event.httpMethod = "PATCH";
            request = new Request(event);
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow("Route undefined");
        });
    });

    describe("#getOptionsConfig", () => {
        it("should get the required config for an option call", () => {
            const routes = handlerImplementation.getOptionsConfig(request);

            expect(routes.length).toEqual(1);

            const route = routes[0];

            expect(route.method).toEqual("GET");
            expect(route.name).toEqual("getProfile");
            expect(route.path).toEqual("/test-endpont/{id}");
        });
        it("returns Undefined Route error when PATH is missing", () => {
            request = new Request(event);
            delete request.resource;
            expect(() => handlerImplementation.getRouteConfig(request)).toThrow("Route undefined");
        });
    });
});
