/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Event } from "@dev/test-helper";
import { Context, SNSEvent } from "aws-lambda";
import { Handler, Middleware } from "../../src";
import { SNS } from "../../src/common/decorators/EventMapping";
import { EventRequest } from "../../src";

const getSnsStub = jest.fn().mockReturnValue({ test: "data" });

class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [];

    @SNS()
    public async handleSNSEvent(req: SNSEvent, context: Context, metadata: any): Promise<unknown> {
        return getSnsStub(req, context, metadata);
    }
}

let handlerImplementation: Handler;
let request: EventRequest<unknown>;

describe("Handler", () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        request = new EventRequest(Event.GenericRecordsObject(Event.snsEvent()));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("#handle", () => {
        it("should handle an incoming event request for sns", async () => {
            const result = await handlerImplementation.handle(request);
            expect(getSnsStub).toBeCalledWith((request.event as any).Records[0], undefined, { _metadata: new Map() });
            expect(result).toEqual([{ status: "fulfilled", value: { test: "data" } }]);
        });
    });
});
