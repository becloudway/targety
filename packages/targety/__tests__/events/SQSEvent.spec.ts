/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Event } from "@dev/test-helper";
import { Context, SQSEvent } from "aws-lambda";
import { Handler, Middleware } from "../../src";
import { SQS } from "../../src/common/decorators/EventMapping";
import { EventRequest } from "../../src";

const getSqsStub = jest.fn().mockReturnValue({ test: "data" });

class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [];

    @SQS()
    public async handleSQSEvent(req: SQSEvent, context: Context, metadata: any): Promise<unknown> {
        return getSqsStub(req, context, metadata);
    }
}

let handlerImplementation: Handler;
let request: EventRequest<unknown>;

describe("Handler", () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        request = new EventRequest(Event.GenericRecordsObject(Event.sqsEvent()));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("#handle", () => {
        it("should handle an incoming event request for sqs", async () => {
            const result = await handlerImplementation.handle(request);
            expect(getSqsStub).toBeCalledWith((request.event as any).Records[0], undefined, { _metadata: new Map() });
            expect(result).toEqual([{ status: "fulfilled", value: { test: "data" } }]);
        });
    });
});
