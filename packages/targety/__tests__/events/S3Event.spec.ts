/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Event } from "@dev/test-helper";
import { S3Event } from "aws-lambda";
import { ANY_SELECTOR } from "../../src/common/Constants";
import { Handler, Middleware } from "../../src";
import { S3 } from "../../src/common/decorators/EventMapping";
import { EventRequest } from "../../src";
import { Context } from "vm";

const getS3Stub = jest.fn().mockReturnValue({ test: "data" });

class HandlerImplementation extends Handler {
    public middleware: Middleware[] = [];

    @S3(ANY_SELECTOR, { configurationId: "testConfigRule" })
    public async handleS3Event(req: S3Event, context: Context, metadata: any): Promise<unknown> {
        return getS3Stub(req, context, metadata);
    }
}

let handlerImplementation: Handler;
let request: EventRequest<unknown>;

describe("Handler", () => {
    beforeEach(() => {
        handlerImplementation = new HandlerImplementation();
        request = new EventRequest(Event.GenericRecordsObject(Event.s3Event({ awsRegion: "eu-west-1" })));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("#handle", () => {
        it("should handle an incoming event request for S3", async () => {
            const result = await handlerImplementation.handle(request);
            expect(getS3Stub).toBeCalledWith((request.event as any).Records[0], undefined, { _metadata: new Map() });
            expect(result).toEqual([{ status: "fulfilled", value: { test: "data" } }]);
        });
    });
});
