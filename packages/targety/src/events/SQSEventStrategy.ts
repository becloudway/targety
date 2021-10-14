import { Event } from "../handlers/event/Event";
import { AbstractEventStrategy } from "./AbstractEventStrategy";

import { SQSRecord } from "aws-lambda";
import { ANY_SELECTOR } from "../common/Constants";

const checkSource = (e: Event, t: SQSRecord): boolean => e.type === t.eventSource;
const checkTarget = (e: Event, t: SQSRecord): boolean => e.target === t.eventSourceARN || e.target === ANY_SELECTOR;

export class SQSEventStrategy extends AbstractEventStrategy {
    private checks(e: Event, t: SQSRecord): boolean {
        return checkSource(e, t) && checkTarget(e, t);
    }

    public getTarget(events: Event[], event: SQSRecord): Event {
        return events.find((v) => this.checks(v, event));
    }
}
