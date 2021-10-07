import cookie from "cookie";
import get from "lodash.get";
import toString from "lodash.tostring";
import * as querystring from "querystring";
import URLParse from "url-parse";
import { ContentType } from "../../common/enums";
import { HttpMethod } from "../../common/types";
import { GenericRequest, RequestType } from "../../GenericRequest";
import { LambdaProxyEvent } from "./LambdaProxyEvent";

export interface LambdaIdentity {
    accountId: string | null;
    sourceIp: string;
    userAgent: string | null;
    [key: string]: string | null | boolean;
}

export interface Cookies {
    [key: string]: string[];
}

/**
 * Turns a lambda proxy event into a request object.
 *
 * @class Request
 */
export class Request extends GenericRequest {
    public isAuthenticated: boolean;
    private body: object | string;
    private token = new Map<string, string>();
    public headers: { [key: string]: string[] };
    private contentType: ContentType;
    private cookies: Cookies;
    private ip: string;
    private params: { [key: string]: string };
    private query: { [key: string]: string };
    private path: string;
    private resource: string;
    private xhr: boolean;
    private method: HttpMethod;
    private referer: URLParse;
    private userAgent: string;
    private identity: LambdaIdentity;
    private rawLambdaEvent: LambdaProxyEvent;
    private stage: string;
    private origin: string;
    private requestId: string;

    /**
     * @param {LambdaProxyEvent} apiGateWayProxyEvent The event passed to the lambda function
     * with lambda-proxy type integration
     */
    constructor(apiGateWayProxyEvent: LambdaProxyEvent) {
        super();

        /** Parsed and normalized headers */
        this.headers = this.parseHeaders(apiGateWayProxyEvent);
        this.contentType = this.getHeader("content-type") as ContentType;

        /** Parses json or urlencoded string to JSON body or null */
        this.body = this.parseBody(apiGateWayProxyEvent);

        /** * Parsed cookies or empty object */
        this.cookies = this.parseCookies(this.headers.cookie);

        this.ip = get(apiGateWayProxyEvent, "requestContext.identity.sourceIp") || "";

        /**
         * This property is an object containing properties mapped to the named route “parameters”. For example,
         * if you have the route /user/:name, then the “name” property is available as req.params.name.
         * This object defaults to {}.
         */
        this.params = get(apiGateWayProxyEvent, "pathParameters") || {};

        /** * Passed query string parameters. Defaults to {}. */
        this.query = get(apiGateWayProxyEvent, "queryStringParameters") || {};

        /** * Contains the path part of the request URL. */
        this.path = get(apiGateWayProxyEvent, "path") || "";

        /** * Contains the resource path. */
        this.resource = get(apiGateWayProxyEvent, "resource") || "";

        /**
         * A Boolean property that is true if the request’s X-Requested-With header field is “XMLHttpRequest”,
         * indicating that the request was issued by a client library such as jQuery.
         */
        this.xhr = false;

        this.method = (toString(get(apiGateWayProxyEvent, "httpMethod")).toUpperCase() || "GET") as HttpMethod;

        /** Parsed referring including parsed query */
        this.referer = URLParse(toString(this.headers.referer), true);

        /** User agent passed from API Gateway */
        this.userAgent = get(apiGateWayProxyEvent, "requestContext.identity.userAgent") || "";

        /** AWS Lambda Identity (source: apiGateway, Cognito, or custom). Can be extended for internal api purpose */
        this.identity = get(apiGateWayProxyEvent, "requestContext.identity");

        /** Api gateway returns the stage in it's context */
        this.stage = get(apiGateWayProxyEvent, "requestContext.stage");

        /** the request's ID which is a unique identifier used by AWS for an event */
        this.requestId = get(apiGateWayProxyEvent, "requestContext.requestId");

        /** The origin domain coming from the request */
        this.origin = this.getHeader("origin");

        /** Raw API Gateway event */
        this.rawLambdaEvent = apiGateWayProxyEvent;
    }

    /**
     * Returns the field from the requestContext object from AWS API Gateway
     *
     * Returns undefined if nothing is found.
     * The Referrer and Referer fields are interchangeable.
     * @param {string} propertyPath
     * @returns {string|object}
     */
    public getContext(propertyPath: string): string | object {
        return get(this.rawLambdaEvent, `requestContext.${propertyPath}`);
    }

    public getQueryParams<T>(defaults?: Partial<T>): T {
        return { ...((defaults as object) || {}), ...(this.query as object) } as T;
    }
    public setQueryParams(obj: { [key: string]: string }): void {
        this.query = obj;
    }
    public getPathParams<T>(): T {
        return this.params as unknown as T;
    }
    public setPathParams(obj: { [key: string]: string }): void {
        this.params = obj;
    }
    public getBody<T extends object>(defaults?: Partial<T>): T {
        return { ...((defaults as object) || {}), ...(this.body as object) } as T;
    }
    public setBody(obj: string | object): void {
        this.body = obj;
    }
    public getCookies(): Cookies {
        return this.cookies;
    }
    public getResource(): string {
        return this.resource;
    }
    public getPath(): string {
        return this.path;
    }
    public getMethod(): HttpMethod {
        return this.method;
    }
    public getHeaders(): { [key: string]: string[] } {
        return this.headers;
    }
    public getIp(): string {
        return this.ip;
    }
    public getUserAgent(): string {
        return this.userAgent;
    }

    /**
     * Returns the list of forwarded IP addresses
     */
    public getForwardedIps(): string[] {
        return this.headers["x-forwarded-for"] || [];
    }

    public getTokens(): Map<string, string> {
        return this.token;
    }

    /**
     * Returns the cookie value, case-insensitive
     *
     * Returns undefined if nothing is found.
     * @param {string} name
     */
    public getCookie(name: string): string {
        const [cookie] = this.cookies[name.toLowerCase()] || [];
        return cookie;
    }

    /**
     * Returns the cookie for a specific environment if found
     *
     * @param name the cookie name
     * @param env the environment for which to find a cookie
     * @param strip strip the environment when true
     * @returns string
     */
    public getEnvCookie(name: string, env: string, strip = true): string {
        const cookies = this.cookies[name.toLowerCase()];
        if (!cookies) {
            return;
        }

        const cookie = cookies.find((v) => v.startsWith(env + "---"));
        if (cookie && strip) {
            return cookie.replace(`${env}---`, "");
        }

        return cookie;
    }

    /**
     * Returns the header value, case-insensitive
     *
     * Returns undefined if nothing is found.
     * @param {string} field
     */
    public getHeader(field: string): string {
        const header: string[] = this.headers[field.toLowerCase()];
        return header && header.join(",");
    }

    /**
     * Parses and normalizes the headers
     * @param lambdaEvent
     */
    private parseHeaders(lambdaEvent: LambdaProxyEvent): { [key: string]: string[] } {
        const lambdaHeaders = { ...get(lambdaEvent, "multiValueHeaders") };

        const headers: { [key: string]: string[] } = Object.keys(lambdaHeaders).reduce(
            (result: { [key: string]: string[] }, key) => {
                result[key.toLowerCase()] = lambdaHeaders[key];
                return result;
            },
            {},
        );

        // enforce 'referer' too because the internet can't decide
        if (headers.referrer) {
            headers.referer = headers.referrer;
            delete headers.referrer;
        }

        return headers;
    }

    /**
     * Parses the cookie headers and returns the cookies
     * this method will preserve multiple values for one key.
     *
     * @param cookieHeaders the cookie headers to be parsed
     */
    private parseCookies(cookieHeaders: string[] = []): Cookies {
        const parsedCookies = cookieHeaders.join(";").split(";");

        const result = new Map<string, string[]>();
        parsedCookies.forEach((v) => {
            const parseResult = cookie.parse(v);
            const [key] = Object.keys(parseResult);

            if (!key) return;
            const k = key.toLowerCase();

            if (!result.has(k)) {
                result.set(k, []);
            }

            result.get(k).push(parseResult[key]);
        });

        return Object.fromEntries(result);
    }

    /**
     * Parses body
     * @param lambdaEvent
     */
    private parseBody(lambdaEvent: LambdaProxyEvent): object | string {
        const bodyString = get(lambdaEvent, "body") || null;

        if (!bodyString) {
            return null;
        }
        if (typeof bodyString !== "string") {
            return bodyString;
        }

        if (this.contentType && this.contentType.match(ContentType.JSON)) {
            try {
                return JSON.parse(bodyString);
            } catch (e) {
                throw new Error("Request body contains invalid JSON");
            }
        } else if (this.contentType && this.contentType.match(ContentType.URL_ENCODED)) {
            return querystring.decode(bodyString);
        }

        return bodyString;
    }

    public getReferer(): URLParse {
        return this.referer;
    }

    /**
     * Returns the host which equals the api gateway url or if coming from the frontend the frontend url
     */
    public getHost(): string {
        return this.getHeader("host");
    }

    /**
     * Returns the Stage for backend calls based on the stage value from ApiGateway API
     */
    public getStage(): string {
        return this.stage;
    }

    /**
     * Returns the host with the appropriate stage
     * @param path optional path that will be appended, make sure to start it with a "/"
     */
    public getFullRequestHost(path = ""): string {
        return `${this.getForwardedProtocol() || "https"}://${this.getHost()}/${this.getStage()}${path}`;
    }

    /**
     * Returns the host with no stage or path
     */
    public getFullRequestBaseHost(): string {
        return `${this.getForwardedProtocol() || "https"}://${this.getHost()}`;
    }

    /**
     * Returns the full origin url basically prefixing http:// for localhost if not present
     */
    public getOrigin(): string {
        return this.getHeader("Origin");
    }

    /**
     * Returns the protocol (fi. https) if set by cloudfront
     */
    public getForwardedProtocol(): string {
        return this.getHeader("X-Forwarded-Proto");
    }

    /**
     * Returns true when the request is coming from localhost
     */
    public isLocalhost(): boolean {
        return !!this.getOrigin()?.includes("localhost");
    }

    public getRequestId(): string {
        return this.requestId;
    }

    public setParams(input: Record<string, string>): void {
        this.params = input;
    }

    public getType(): RequestType {
        return RequestType.REQUEST;
    }
}
