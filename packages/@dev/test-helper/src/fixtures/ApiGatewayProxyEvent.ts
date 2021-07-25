/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* tslint:disable:object-literal-sort-keys */
export interface ProxyEventInput {
    body?: string;
    headers?: { [key: string]: string[] };
    pathParameters?: any[];
    queryStringParameters?: any[];
}

export function get(input: ProxyEventInput = {}) {
    return {
        body: input.body || JSON.stringify({ hello: "world" }),
        headers: {},
        multiValueHeaders: {
            Accept: ["text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "application/json"],
            "Accept-Encoding": ["gzip, deflate, sdch"],
            "Accept-Language": ["en-US,en;q=0.8"],
            "Cache-Control": ["max-age=0"],
            "CloudFront-Forwarded-Proto": ["https"],
            "CloudFront-Is-Desktop-Viewer": ["true"],
            "CloudFront-Is-Mobile-Viewer": ["false"],
            "CloudFront-Is-SmartTV-Viewer": ["false"],
            "CloudFront-Is-Tablet-Viewer": ["false"],
            "CloudFront-Viewer-Country": ["US"],
            "Content-Type": ["application/json"],
            Cookie: ["accessToken=1234;"],
            Origin: ["http://localhost:3000"],
            Host: ["http://localhost:3000"],
            "Upgrade-Insecure-Requests": ["1"],
            Referer: ["http://localhost:3000"],
            "User-Agent": ["Custom User Agent String"],
            Via: ["1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)"],
            "X-Amz-Cf-Id": ["cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA=="],
            "X-Forwarded-For": ["127.0.0.1, 127.0.0.2"],
            "X-Forwarded-Port": ["443"],
            "X-Forwarded-Proto": ["https"],
            ...input.headers,
        },
        httpMethod: "PUT",
        path: "/test-endpont/1234",
        pathParameters: {
            id: "1234",
            ...input.pathParameters,
        },
        queryStringParameters: {
            age: "undefined",
            boolean: "true",
            foo: "bar",
            isFalse: "false",
            name: "null",
            number: "123.45",
            realBool: true,
            realNumber: 123,
            ...input.queryStringParameters,
        },
        requestContext: {
            identity: {
                // @ts-ignore
                accountId: null,
                sourceIp: "127.0.0.1",
                userAgent: "Custom User Agent String",
            },
            requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        },
        resource: "/test-endpont/{id}",
    };
}
