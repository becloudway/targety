export interface GenericEvent<T> {
    Records: T[];
}

export interface GenericEventBody {
    eventSource?: string;
    EventSource?: string;
    eventName?: string;
}
