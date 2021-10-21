import { Handler } from "../..";
import { EVENTS_METADATA } from "../../common/Constants";
import { EventMetadata } from "../../common/decorators/EventMapping";
import { Context } from "../../common/interfaces";
import { InternalServerError } from "../../errors";
import { Event } from "./Event";
import { EventRequest } from "./EventRequest";
import { AbstractEventStrategy, EventStrategy } from "../../events";
import { GenericEvent, GenericEventBody } from "./GenericEvent";
import { HandlerStrategy } from "../../HandlerStrategy";
import { LOGGER } from "targety-logger";

export class EventHandler implements HandlerStrategy<EventRequest<unknown>, Event> {
    protected events: Event[] = [];

    public constructor(private parent: Handler) {
        this.events = this.createEvents();
    }

    public async getTarget(event: GenericEventBody): Promise<Event> {
        const register: AbstractEventStrategy = EventStrategy[event.eventSource || event.EventSource];
        if (!register) {
            throw new InternalServerError("No strategy found for event type");
        }
        return register.getTarget(this.events, event);
    }

    public async handle(event: EventRequest<GenericEvent<GenericEventBody>>, context: Context): Promise<any> {
        const records = event.event.Records;

        const settled = await Promise.allSettled(
            records.map(async (v) => {
                const target = await this.getTarget(v);
                if (!target) {
                    throw new InternalServerError("No handler found to handle the incoming request");
                }
                return await this.parent[target.name](v, context, event.metadata);
            }),
        );

        return settled;
    }

    private createEvents(): Event[] {
        const events: EventMetadata[] = Reflect.getMetadata(EVENTS_METADATA, this.parent);
        if (!events) {
            LOGGER.trace("No events defined for handler");
            return [];
        }
        const eventNames = Object.keys(events);

        return eventNames.map((v: string) => {
            const event: EventMetadata = events[v];
            return new Event({
                target: event.target,
                type: event.type,
                metaData: event.metadata,
                name: v,
            });
        });
    }
}
