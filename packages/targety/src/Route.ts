import { HttpMethod } from "./common/types";

export interface RouteConfig {
    /** Corresponds to the api method in the handler */
    name: string;
    /** Resource path, e.g. /users/{id}/profile */
    path: string;
    method: HttpMethod;
}

export interface ExtendedRouteConfig<T> extends RouteConfig {
    metaData?: T;
}

export class Route {
    public constructor(private config: ExtendedRouteConfig<unknown>) {}

    public getMetaData<T>(): T | undefined {
        return this.config.metaData as T | undefined;
    }

    public get path(): string {
        return this.config.path;
    }

    public get method(): HttpMethod {
        return this.config.method;
    }

    public get name(): string {
        return this.config.name;
    }
}
