/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Event } from "@dev/test-helper";
import { Handler, Middleware, LambdaRequestAuthorizer, S3, SNS, SQS, LambdaEntryPoint } from "../../src";

class HandlerImplementation extends Handler {
    public middleware: Middleware[];

    @LambdaRequestAuthorizer()
    public async authorizer(): Promise<any> {
        return "authorizer";
    }

    @S3()
    public async s3(): Promise<any> {
        return "s3";
    }

    @SQS()
    public async sqs(): Promise<any> {
        return "sqs";
    }

    @SNS()
    public async sns(): Promise<any> {
        return "sns";
    }
}

// tslint:disable-next-line:max-classes-per-file
class EntryPointImplementation extends LambdaEntryPoint {
    protected async initializeHandler(): Promise<Handler> {
        return new HandlerImplementation();
    }
}

let implementation: EntryPointImplementation;

describe("EntryPoint", () => {
    beforeEach(async () => {
        implementation = new EntryPointImplementation();
    });

    afterEach(() => jest.resetAllMocks());

    it("should use the handler to trigger an S3 event", async () => {
        const result = await implementation.handle(Event.GenericRecordsObject(Event.s3Event()));
        expect(result).toEqual([{ status: "fulfilled", value: "s3" }]);
    });
    it("should use the handler to trigger an SNS event", async () => {
        const result = await implementation.handle(Event.GenericRecordsObject(Event.snsEvent()));
        expect(result).toEqual([{ status: "fulfilled", value: "sns" }]);
    });
    it("should use the handler to trigger an SQS event", async () => {
        const result = await implementation.handle(Event.GenericRecordsObject(Event.sqsEvent()));
        expect(result).toEqual([{ status: "fulfilled", value: "sqs" }]);
    });
    it("should use the handler to trigger an mixed event array", async () => {
        const result = await implementation.handle(
            Event.GenericRecordsObject([Event.sqsEvent(), Event.s3Event(), Event.snsEvent()]),
        );
        expect(result).toContainEqual({ status: "fulfilled", value: "s3" });
        expect(result).toContainEqual({ status: "fulfilled", value: "sns" });
        expect(result).toContainEqual({ status: "fulfilled", value: "sqs" });
    });
    it("should use the handler to trigger an authorization request", async () => {
        const result = await implementation.handle(Event.RequestAuthorizer());
        expect(result).toEqual("authorizer");
    });
});
