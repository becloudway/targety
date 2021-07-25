/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApiGateWayProxyEvent } from "@dev/test-helper";
import { LambdaProxyEvent, Request } from "../src/Request";

describe("Request", () => {
    let event: LambdaProxyEvent;
    let request: Request;

    beforeEach(() => {
        event = (ApiGateWayProxyEvent.get() as unknown) as LambdaProxyEvent;
        request = new Request(event);
    });

    describe("#constructor", () => {
        it("throws when body is invalid json", () => {
            event.body = '{"hello":"world",}';
            expect(() => new Request(event)).toThrow("Request body contains invalid JSON");
        });
        it("allows an empty body", () => {
            event.body = null;
            request = new Request(event);
            expect(request.getBody()).toEqual({});
        });
        it("does not parse a body that is not a string", () => {
            event.body = JSON.stringify({ hello: "world" });
            request = new Request(event);
            expect(request.getBody()).toEqual(JSON.parse(event.body));
        });
        it("can have a string body with unknown encoding but parses it", () => {
            event = (ApiGateWayProxyEvent.get({
                headers: { "Content-Type": ["text/html"] },
            }) as unknown) as LambdaProxyEvent;
            event.body = "a random string";
            request = new Request(event);
            expect(request.getBody()).toEqual({ ...(event.body as any) });
        });
        it("accepts urlEncoded data and transforms body to json object", () => {
            const body =
                "email_channel=nina%40gibtsnicht.com.uat1&mobile_channel=&Onkologie=on&Immunologie=on&Psoriasis=on&Psoriasis+Arthritis=on&Diabetes=on&HIV%2FAIDS=on&Hepatitis+C=on&Prostatakarzinom=on&Mammakarzinom=on&Multiples+Myelom=on&Schizophrenie=on&Ovarialkarzinom=on&Psychiatrie=on";
            event = (ApiGateWayProxyEvent.get({
                body,
                headers: { "Content-Type": ["application/x-www-form-urlencoded"] },
            }) as unknown) as LambdaProxyEvent;
            request = new Request(event);
            expect(request.getBody()).toHaveProperty("email_channel", "nina@gibtsnicht.com.uat1");
        });
        it("parses headers and multiValueHeaders", () => {
            request = new Request(event);
            expect(request.getHeader("accept")).toEqual([...event.multiValueHeaders.Accept].join(","));
        });
    });

    describe("#getters", () => {
        it("#getUserAgent", () => {
            expect(request.getUserAgent()).toEqual(event.requestContext.identity.userAgent);
        });
        it("#getUserAgent: defaults to emtpy string", () => {
            delete event.requestContext.identity.userAgent;
            request = new Request(event);
            expect(request.getUserAgent()).toEqual("");
        });
        it("#getBody: returns json body", () => {
            expect(request.getBody()).toEqual(JSON.parse(event.body));
        });
        it("#getPath", () => {
            expect(request.getPath()).toEqual(event.path);
        });
        it("#getPath: default empty string", () => {
            delete event.path;
            request = new Request(event);
            expect(request.getPath()).toEqual("");
        });
        it("#getResource: default empty string", () => {
            delete event.resource;
            request = new Request(event);
            expect(request.getResource()).toEqual("");
        });
        it("#getPathParams", () => {
            expect(request.getPathParams()).toEqual(event.pathParameters);
        });
        it("#getPathParams: sets to empty object by default", () => {
            delete event.pathParameters;
            request = new Request(event);
            expect(request.getPathParams()).toEqual({});
        });
        it("#getQueryParams: sets to empty object by default", () => {
            delete event.queryStringParameters;
            request = new Request(event);
            expect(request.getQueryParams()).toEqual({});
        });
        it("#getQueryParams", () => {
            expect(request.getQueryParams()).toEqual(event.queryStringParameters);
        });
        it("#getQueryParam", () => {
            expect(request.getQueryParam<string>("foo")).toEqual(event.queryStringParameters.foo);
        });
        it("#getQueryParam: fetches and casts a number", () => {
            expect(request.getQueryParam<number>("number")).toEqual(parseFloat(event.queryStringParameters.number));
        });
        it("#getQueryParam: fetches and casts a booolean", () => {
            expect(request.getQueryParam<boolean>("boolean")).toBeTruthy();
            expect(request.getQueryParam<boolean>("isFalse")).toBeFalsy();
        });
        it("#getQueryParam: fetches and casts a null string", () => {
            expect(request.getQueryParam<boolean>("name")).toBeNull();
        });
        it("#getQueryParam: fetches and casts an undefined string", () => {
            expect(request.getQueryParam<boolean>("age")).toBeUndefined();
        });
        it("#getQueryParam: returns undefined for non existing", () => {
            expect(request.getQueryParam<boolean>("notexisting")).toBeUndefined();
        });
        it("#getQueryParam: does not convert bool or number when already bool or number", () => {
            expect(request.getQueryParam<boolean>("realBool")).toBeTruthy();
            expect(request.getQueryParam<number>("realNumber")).toEqual(123);
        });
        it("#getMethod", () => {
            expect(request.getMethod()).toEqual(event.httpMethod);
        });
        it("#getMethod: defaults to GET", () => {
            delete event.httpMethod;
            request = new Request(event);
            expect(request.getMethod()).toEqual("GET");
        });
        it("#getResource: returns resource path", () => {
            expect(request.getResource()).toEqual(event.resource);
        });
        it("#getHeaders", () => {
            const headers = request.getHeaders();
            expect(headers["content-type"]).toEqual(event.multiValueHeaders["Content-Type"]);
            expect(headers.accept).toEqual(expect.arrayContaining(event.multiValueHeaders.Accept));
        });
        it("#getHeaders: defaults to empty object", () => {
            delete event.headers;
            delete event.multiValueHeaders;
            request = new Request(event);
            expect(request.getHeaders()).toEqual({});
        });
        it("#getHeader: allows getting a single header", () => {
            expect(request.getHeader("accept")).toEqual(event.multiValueHeaders.Accept.join(","));
        });
        it("#getHeader: ignores case", () => {
            expect(request.getHeader("accePt")).toMatch(event.multiValueHeaders.Accept.join(","));
        });
        it("#getHeader: returns undefined if not exists", () => {
            expect(request.getHeader("doesnotexist")).toBeUndefined();
        });
        it("#getContext: allows getting a requestContext property", () => {
            expect(request.getContext("identity")).toEqual(event.requestContext.identity);
            expect(request.getContext("unknown")).toBeUndefined();
        });

        it("#getPathParam: allows getting a single pathParam", () => {
            expect(request.getPathParam("id")).toEqual("1234");
        });
        it("#getPathParam: returns undefened if not exists", () => {
            expect(request.getPathParam("unexisting")).toBeUndefined();
        });
        it("#getCookies", () => {
            expect(request.getCookies()).toBeInstanceOf(Object);
            expect(request.getCookie("accessToken")).toEqual("1234");
        });
        it("#getIp", () => {
            expect(request.getIp()).toEqual(event.requestContext.identity.sourceIp);
        });
        it("#getIp: returns empty string if not set", () => {
            delete event.requestContext.identity.sourceIp;
            request = new Request(event);
            expect(request.getIp()).toEqual("");
        });
    });
});
