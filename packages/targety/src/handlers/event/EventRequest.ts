import { GenericRequest, RequestType } from "../../GenericRequest";

export class EventRequest<T> extends GenericRequest {
    public constructor(private _event: T) {
        super();
    }

    get event(): T {
        return this._event;
    }

    public getType(): RequestType {
        return RequestType.EVENT;
    }
}
