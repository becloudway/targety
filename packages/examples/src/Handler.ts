import { Get, Handler, Middleware, Request, Response, ResponseBody } from "targety";

export class ExampleHandler extends Handler {
    protected middleware: Middleware[];

    @Get("/test")
    public async getTestMethod(request: Request): Promise<ResponseBody> {
        return Response.ok(request).send({ test: "ok" });
    }
}
