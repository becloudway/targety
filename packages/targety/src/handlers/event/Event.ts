import { EventType } from "../../common/enums/EventType";

export interface EventConfig {
    /** Corresponds to the api method in the handler */
    target: string;
    /** Resource path, e.g. /users/{id}/profile */
    type: EventType;
    name: string;
}

export interface ExtendedEventConfig<T> extends EventConfig {
    metaData?: T;
}

export class Event {
    public constructor(private config: ExtendedEventConfig<unknown>) {}

    public getMetaData<T>(): T | undefined {
        return this.config.metaData as T | undefined;
    }

    public get target(): string {
        return this.config.target;
    }

    public get type(): EventType {
        return this.config.type;
    }

    public get name(): string {
        return this.config.name;
    }
}
