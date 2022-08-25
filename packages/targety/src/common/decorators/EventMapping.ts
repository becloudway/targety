import "reflect-metadata";

import { ANY_SELECTOR, EVENT, EVENTS_METADATA, EVENT_TARGET } from "../Constants";
import { EventType } from "../enums/EventType";
import { EventMappingConfig } from "../interfaces/EventMappingConfig";

const defaultEventMappingConfig = {
    [EVENT_TARGET]: ANY_SELECTOR,
    [EVENT]: EventType.ANY_EVENT,
};

export interface EventMetadata {
    type: EventType;
    target: string;
    metadata?: Record<string, unknown>;
}

export const RequestMapping = (config: EventMappingConfig = defaultEventMappingConfig): MethodDecorator => {
    const metadata: EventMetadata = {
        type: config.event,
        target: config.eventTarget,
        metadata: config.metadata,
    };

    return (target, key, descriptor: PropertyDescriptor) => {
        const routes = Reflect.getMetadata(EVENTS_METADATA, target) || {};
        routes[key] = {
            ...metadata,
            ...(routes[key] || {}),
        };
        Reflect.defineMetadata(EVENTS_METADATA, routes, target);
        return descriptor;
    };
};

const createMappingDecorator =
    (eventType: EventType) =>
    (eventTarget: string = ANY_SELECTOR, metadata: Record<string, unknown> = {}): MethodDecorator =>
        RequestMapping({ [EVENT_TARGET]: eventTarget, [EVENT]: eventType, metadata });

export const S3 = createMappingDecorator(EventType.S3);
export const SNS = createMappingDecorator(EventType.SNS);
export const SQS = createMappingDecorator(EventType.SQS);
export const AnyEvent = createMappingDecorator(EventType.ANY_EVENT);
export const LambdaAuthorizer = createMappingDecorator(EventType.LAMBDA_AUTHORIZER);
