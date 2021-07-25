import "reflect-metadata";

import { METHOD, PATH, ROUTES_METADATA } from "../Constants";
import { RequestMethod } from "../enums/RequestMethod";
import { RequestMappingConfig } from "../interfaces/RequestMappingConfig";

const defaultRequestConfig = {
    [PATH]: "/",
    [METHOD]: RequestMethod.GET,
};

export const RequestMapping = (config: RequestMappingConfig = defaultRequestConfig): MethodDecorator => {
    const path = config[PATH];
    const method = config[METHOD];

    return (target, key, descriptor: PropertyDescriptor) => {
        const routes = Reflect.getMetadata(ROUTES_METADATA, target) || {};
        routes[key] = {
            method,
            path,
            ...(routes[key] || {}),
        };
        Reflect.defineMetadata(ROUTES_METADATA, routes, target);
        return descriptor;
    };
};

const createMappingDecorator = (method: RequestMethod) => (path?: string | string[]): MethodDecorator =>
    RequestMapping({ [PATH]: path, [METHOD]: method });

export const Get = createMappingDecorator(RequestMethod.GET);
export const Post = createMappingDecorator(RequestMethod.POST);
export const Put = createMappingDecorator(RequestMethod.PUT);
export const Delete = createMappingDecorator(RequestMethod.DELETE);
export const Patch = createMappingDecorator(RequestMethod.PATCH);
export const Options = createMappingDecorator(RequestMethod.OPTIONS);
export const Head = createMappingDecorator(RequestMethod.HEAD);
