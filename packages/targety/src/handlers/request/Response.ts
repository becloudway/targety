/* tslint:disable:object-literal-sort-keys */
import {
    ApiError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "../../errors";
import { Strings } from "../../utils";
import cookie from "cookie";
import { ContentType } from "../../common/enums/ContentType";
import { Request } from "./Request";
import { ResponseBody, ResponseBodyInput } from "./ResponseBody";
import yn from "yn";
import { URL } from "url";

const { ALLOW_LOCALHOST } = process.env;

export interface ResponseOptions {
    cors?: boolean;
    defaultHeaders?: boolean;
}

export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    domain?: string;
    path?: string;
    sameSite?: "lax" | "strict" | "none";
    expires?: Date;
}

interface JsonObject {
    [key: string]: any;
}

/**
 * Wrapper for ApiGateway Response
 *
 * ```
 * // { statusCode: 200, body: { success: true }};
 * return Response.ok(request, { success: true });
 *
 * // { statusCode: 403, body: { error: ... }};
 * const forbiddenError = new ForbiddenError();
 * return Response.fromError(request, forbiddenError);
 *
 * // { statusCode: 302, body: '' } with redirect header;
 * const forbiddenError = new ForbiddenError();
 * return Response.redirect(request, 'https://redirect/to');
 * ```
 */
export class Response<T> {
    private allowedOrigins: string[] = Strings.toList(process.env.ALLOWED_ORIGINS || "*");
    private body: T; // ResponseBodyInput['body'] = '';
    private status: ResponseBodyInput["statusCode"];
    private headers: ResponseBodyInput["headers"];
    private contentType: string;
    private cors = true;
    private defaultHeaders = true;
    private baseUrl: string;
    private allowLocalhost: boolean = yn(ALLOW_LOCALHOST);

    constructor(statusCode: number, request: Request, options?: ResponseOptions) {
        this.status = statusCode;
        this.cors = options && options.cors === false ? options.cors : this.cors;
        this.defaultHeaders = options?.defaultHeaders === false ? options.defaultHeaders : this.defaultHeaders;
        if (this.cors) {
            this.setCorsHeaders(request);
        }

        if (this.defaultHeaders) {
            this.setDefaultHeaders(request);
        }
    }

    public static render(request: Request, options?: ResponseOptions): Response<string> {
        // don't load the default headers on a render as they might interfere with the rendered page
        const response = Response.response<string>(200, request, { defaultHeaders: false, ...options });
        response.setHeader("Content-Type", ContentType.HTML);
        return response;
    }

    public static redirect(request: Request, redirectUrl: string, options?: ResponseOptions): Response<null> {
        // don't load the default headers on a redirect as they might interfere with the frontend
        const response = Response.response<null>(302, request, { defaultHeaders: false, ...options });
        response.setHeader("location", redirectUrl);
        response.setHeader("content-type", ContentType.HTML);
        return response;
    }

    public static ok(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(200, request, options);
    }

    public static accepted(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(202, request, options);
    }

    public static created(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(201, request, options);
    }

    public static noContent(request: Request, options?: ResponseOptions): Response<null> {
        return Response.response<null>(204, request, options);
    }

    public static badRequest(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(400, request, options);
    }

    public static conflict(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(409, request, options);
    }

    public static notFound(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(404, request, options);
    }

    public static internalServerError(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(500, request, options);
    }

    public static unauthorized(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(401, request, options);
    }

    public static forbidden(request: Request, options?: ResponseOptions): Response<JsonObject> {
        return Response.response<JsonObject>(403, request, options);
    }

    public static fromError(request: Request, error: ApiError | Error, options?: ResponseOptions): ResponseBody {
        const convertError = (err: ApiError | Error, defaultMessage?: string) => {
            const errorMessage = err.message || defaultMessage;
            return errorMessage
                ? {
                      message: errorMessage,
                      errorCode: (err as ApiError).errorCode,
                      awsRequestId: request.getRequestId(),
                  }
                : err;
        };

        if (error instanceof InternalServerError) {
            return Response.internalServerError(request, options).send(convertError(error));
        }

        if (error instanceof ConflictError) {
            return Response.conflict(request, options).send(convertError(error));
        }

        if (error instanceof NotFoundError) {
            return Response.notFound(request, options).send(convertError(error));
        }

        if (error instanceof UnauthorizedError) {
            return Response.unauthorized(request, options).send(convertError(error));
        }

        if (error instanceof BadRequestError) {
            return Response.badRequest(request, options).send(convertError(error));
        }

        if (error instanceof ForbiddenError) {
            return Response.forbidden(request, options).send(convertError(error, "Forbidden"));
        }

        if (error instanceof ValidationError) {
            return Response.badRequest(request, options).send({
                message: "Validation error",
                errorCode: "ValidationError",
                ...JSON.parse(error.message),
                awsRequestId: request.getRequestId(),
            });
        }

        return Response.internalServerError(request, options).send(convertError(error));
    }

    private static corsResponse(request: Request, allowedOrigins: string[]): string {
        const origin = request.getOrigin();
        if (allowedOrigins.includes("*") || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return origin;
        }
        return null;
    }

    private static response<T>(statusCode: number, request: Request, options?: ResponseOptions): Response<T> {
        return new Response<T>(statusCode, request, options);
    }

    /**
     * Sets contentType based on body and stringifies the body before returning [[ResponseBody]]
     */
    public send(body: T | string = null): ResponseBody {
        body = body == null ? this.body : body;

        if (!this.getHeader("content-type")) {
            this.setHeader("content-type", "text");
            this.contentType = "text";
        }

        if (typeof body === "object") {
            this.setHeader("content-type", "application/json");
            return this.send(JSON.stringify(body));
        }

        if (typeof body !== "string") {
            body = JSON.stringify(body) as unknown as string;
        }

        const responseBody = new ResponseBody({
            body: body as unknown as string,
            headers: this.headers,
            statusCode: this.status,
        });
        return responseBody;
    }

    public addCookie(key: string, val: string, options: CookieOptions = {}): Response<T> {
        const cookieHeader = this.headers["set-cookie"] || [];
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: true,
            domain: new URL(this.baseUrl).host,
            path: "/",
            sameSite: "none",
            ...options,
        };
        cookieHeader.push(cookie.serialize(key, val, cookieOptions));
        this.headers["set-cookie"] = cookieHeader;

        return this;
    }

    /**
     * Set header `field` to `val`, or pass
     * an object of header fields.
     *
     * Examples:
     *
     *    res.set('Foo', ['bar', 'baz']);
     *    res.set('Accept', 'application/json');
     *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
     *
     * Aliased as `res.header()`.
     *
     * @param {String|Object} field
     * @param {String|Array} [val]
     * @return {Response} for chaining
     * @public
     */
    public setHeader(field: string, val: string | string[]): Response<T> {
        const value: string[] = val ? (Array.isArray(val) ? val.map((v) => `${v}`) : [`${val}`]) : [];

        if (typeof this.headers === "undefined") {
            this.headers = {};
        }

        this.headers[field.toLowerCase()] = value;

        return this;
    }

    /**
     * Removes a header from the headers object
     *
     * @param field the field to be removed
     */
    public removeHeader(field: string): void {
        if (this.headers[field]) {
            delete this.headers[field];
        }
    }

    /**
     * Get value for header `field`.
     *
     * @param {String} field
     * @return {String}
     * @public
     */
    private getHeader(field: string): string | undefined {
        return typeof this.headers !== "undefined"
            ? this.headers[field.toLowerCase()] && this.headers[field.toLowerCase()][0]
            : undefined;
    }

    /**
     * Sets some default headers, that can be overridden if needed.
     * Loosely based on: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
     */
    private setDefaultHeaders(request: Request): void {
        if (!this.allowLocalhost) {
            this.setHeader("Strict-Transport-Security", "max-age=31536000");
        }

        this.setHeader("X-Frame-Options", "DENY");
        this.setHeader("Cache-Control", "no-store");
        this.setHeader("X-Content-Type-Options", "nosniff");
        this.setHeader("Content-Security-Policy", "'self'");

        this.setHeader("X-AWS-Request-Id", request.getRequestId());
    }

    private setCorsHeaders(request: Request): void {
        this.setHeader("Access-Control-Allow-Origin", Response.corsResponse(request, this.allowedOrigins));
        this.setHeader("Access-Control-Allow-Credentials", "true");
    }

    public setHeaders(headers: ResponseBodyInput["headers"]): void {
        for (const header in headers) {
            if (Object.prototype.hasOwnProperty.call(headers, header)) {
                this.setHeader(header, headers[header]);
            }
        }
    }

    public setBaseUrl(baseUrl: string): void {
        this.baseUrl = baseUrl;
    }
}
