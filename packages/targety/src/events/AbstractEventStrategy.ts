import { Event } from "../handlers/event/Event";
import { GenericEventBody } from "../handlers/event/GenericEvent";

export abstract class AbstractEventStrategy {
    abstract getTarget(events: Event[], GenericEvent: GenericEventBody): Event;
}
