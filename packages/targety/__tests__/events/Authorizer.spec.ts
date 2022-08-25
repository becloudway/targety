import { Event } from "@dev/test-helper";
import { Handler, LambdaRequestAuthorizer, Middleware } from "../../src";
import { LambdaAuthorizerRequest } from "../../src";
import { Context } from "../../src/common/interfaces";

const authorizerStub = jest.fn().mockReturnValue({ result: "ok" });

class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [];

    @LambdaRequestAuthorizer()
    public async authorizer(req: LambdaAuthorizerRequest, context: Context): Promise<unknown> {
        return authorizerStub(req, context);
    }
}

let handlerImplementation: Handler;
let request: LambdaAuthorizerRequest;

describe("Authorizer", () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        request = new LambdaAuthorizerRequest(Event.RequestAuthorizer() as any);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("#handle", () => {
        it("should handle an incoming event request for lambda authorization", async () => {
            const result = await handlerImplementation.handle(request);
            expect(authorizerStub).toBeCalledWith(new LambdaAuthorizerRequest(request.body), undefined);
            expect(result).toEqual({ result: "ok" });
        });
    });
});
