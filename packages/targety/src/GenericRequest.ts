import { Metadata } from ".";

export enum RequestType {
    EVENT = "EVENT",
    REQUEST = "REQUEST",
    AUTH_REQUEST = "AUTH_REQUEST",
    UNKNOWN = "UNKNOWN",
}

export class GenericRequest {
    private _metadata: Metadata = new Metadata();

    public isType(type: RequestType): boolean {
        return this.getType() === type;
    }

    /**
     * Returns the metadata for the given request.
     */
    public get metadata(): Metadata {
        return this._metadata;
    }

    public getType(): RequestType {
        return RequestType.UNKNOWN;
    }
}
