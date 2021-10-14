import { EventType } from "../common/enums/EventType";
import { S3EventStrategy } from "./S3EventStrategy";
import { SNSEventStrategy } from "./SNSEventStrategy";
import { SQSEventStrategy } from "./SQSEventStrategy";

export const EventStrategy = {
    [EventType.S3]: new S3EventStrategy(),
    [EventType.SQS]: new SQSEventStrategy(),
    [EventType.SNS]: new SNSEventStrategy(),
    // TODO: finish special event types
    [EventType.ANY_EVENT]: new S3EventStrategy(),
    [EventType.LAMBDA_AUTHORIZER]: new S3EventStrategy(),
};
