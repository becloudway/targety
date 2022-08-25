import { Event } from "../handlers/event/Event";
import { AbstractEventStrategy } from "./AbstractEventStrategy";

import { S3EventRecord } from "aws-lambda";
import { ANY_SELECTOR } from "../common/Constants";

const checkSource = (e: Event, t: S3EventRecord): boolean => e.type === t.eventSource;
const checkTarget = (e: Event, t: S3EventRecord): boolean => e.target === t.eventName || e.target === ANY_SELECTOR;
const checkConfigurationId = (e: Event, t: S3EventRecord): boolean =>
    !e.getMetaData<{ configurationId: string }>()?.configurationId ||
    e.getMetaData<{ configurationId: string }>()?.configurationId === t.s3.configurationId;

export class S3EventStrategy extends AbstractEventStrategy {
    private checks(e: Event, t: S3EventRecord): boolean {
        return checkSource(e, t) && checkTarget(e, t) && checkConfigurationId(e, t);
    }

    public getTarget(events: Event[], event: S3EventRecord): Event {
        return events.find((v) => this.checks(v, event));
    }
}
