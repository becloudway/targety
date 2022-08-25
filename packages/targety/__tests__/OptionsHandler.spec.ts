import { ApiGateWayProxyEvent } from "@dev/test-helper";

import { LambdaProxyEvent, OptionsHandler, Request } from "../src";
import { Route } from "../src";

describe("OptionsHandler", () => {
    let event: LambdaProxyEvent;
    let handlerAction: Route;

    const optionsHandler = new OptionsHandler(
        ["localhost:3000"],
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Force,Cache-Control,Pragma,Device-Token".split(
            ",",
        ),
        ["X-Total-Count"],
        true,
    );

    beforeEach(() => {
        event = ApiGateWayProxyEvent.get() as unknown as LambdaProxyEvent;
        event.httpMethod = "GET";
        event.resource = "/test-endpont/{id}";

        handlerAction = new Route({
            name: "test",
            path: "/test-endpont/{id}",
            method: "POST",
            metaData: {
                AllowCredentials: false,
            },
        });
    });

    ["http://localhost:3000"].forEach((domain) => {
        it(`should create a valid response for an options request for ${domain}`, () => {
            event.multiValueHeaders.origin = [domain];
            const request = new Request(event);
            const result = optionsHandler.optionsResponse(request, [handlerAction]);

            expect(result).toEqual({
                statusCode: 200,
                body: null,
                multiValueHeaders: {
                    "Access-Control-Expose-Headers": ["X-Total-Count"],
                    "Access-Control-Allow-Methods": ["OPTIONS,POST"],
                    "Access-Control-Allow-Headers": [
                        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Force,Cache-Control,Pragma,Device-Token",
                    ],
                    "Access-Control-Allow-Origin": [domain],
                    "Access-Control-Allow-Credentials": ["true"],
                },
            });
        });
    });

    it("should throw a 403 when an invalid origin is used", () => {
        event.multiValueHeaders.origin = ["https://test.be"];
        const request = new Request(event);

        expect(() => optionsHandler.optionsResponse(request, [handlerAction])).toThrow("origin isn't allowed");
    });
});
