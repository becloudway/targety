import { Event } from "../handlers/event/Event";
import { AbstractEventStrategy } from "./AbstractEventStrategy";

import { SNSEventRecord } from "aws-lambda";
import { ANY_SELECTOR } from "../common/Constants";

const checkSource = (e: Event, t: SNSEventRecord): boolean => e.type === t.EventSource;
const checkTarget = (e: Event, t: SNSEventRecord): boolean =>
    e.target === t.EventSubscriptionArn || e.target === ANY_SELECTOR;

export class SNSEventStrategy extends AbstractEventStrategy {
    private checks(e: Event, t: SNSEventRecord): boolean {
        return checkSource(e, t) && checkTarget(e, t);
    }

    public getTarget(events: Event[], event: SNSEventRecord): Event {
        return events.find((v) => this.checks(v, event));
    }
}
