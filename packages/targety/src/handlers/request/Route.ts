import { HttpMethod } from "../../common/types";
import { Target, TargetConfig } from "../../Target";

export interface RouteConfig extends TargetConfig {
    path: string;
    method: HttpMethod;
}

export class Route extends Target<RouteConfig> {
    public get path(): string {
        return this.config.path;
    }

    public get method(): HttpMethod {
        return this.config.method;
    }
}
