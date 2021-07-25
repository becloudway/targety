import { HttpMethod } from "./common/types";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HandlerMetaDataConfig {}

export interface ExtenderHandlerMetaDataConfig<T> extends HandlerMetaDataConfig {
    metaData?: T;
}

export class HandlerMetaData {
    public constructor(private config: ExtenderHandlerMetaDataConfig<unknown>) {}

    public getMetaData<T>(): T | undefined {
        return this.config.metaData as T | undefined;
    }
}
