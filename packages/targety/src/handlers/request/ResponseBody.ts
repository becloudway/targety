export interface ResponseBodyInput {
    statusCode: number;
    headers?: { [index: string]: string[] };
    body?: string | number | boolean | object;
}

export class ResponseBody {
    public statusCode: number;
    // public headers: { [index: string]: string; };
    public body: string;
    public multiValueHeaders: { [index: string]: string[] };

    constructor({ statusCode, headers, body }: ResponseBodyInput) {
        this.statusCode = statusCode;
        this.multiValueHeaders = headers || {};
        this.body = body ? (typeof body === "object" ? JSON.stringify(body) : `${body}`) : "";
    }
}
