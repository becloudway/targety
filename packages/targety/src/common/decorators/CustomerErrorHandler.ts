import "reflect-metadata";

import { ROUTES_METADATA } from "../Constants";
import { ResponseBody } from "../../handlers/request/ResponseBody";
import { Handler } from "../../Handler";
import { GenericRequest } from "../../GenericRequest";

/**
 * Method to call a function on the class implementing a CustomErrorHandler
 */
export const callSelf =
    (f: string) =>
    async (request: GenericRequest, handler: Handler, error: any): Promise<ResponseBody> => {
        return await handler[f](request, error);
    };

/**
 * Type defining the HandlerFN for the CustomErrorHandler
 */
export type CustomErrorHandlerType<T extends Handler> = (
    request: GenericRequest,
    handler: T,
    error: any,
) => Promise<ResponseBody>;

export interface CustomerErrorHandlerMetaData {
    customErrorHandler: CustomErrorHandlerType<Handler>;
}

/**
 * Allows a second error handler that is used to handle errors before they are returned to the user.
 * This can be used for instance when authentication or validation fails but you don't want to return the error
 * like you would by default.
 *
 * @param handlerFn the function that when returning something will be returned instead of the
 * normal error response when undefined the error is still thrown and handled as usual
 */
export const CustomErrorHandler = <T extends Handler>(handlerFn: CustomErrorHandlerType<T>): MethodDecorator => {
    return (target, key, descriptor: PropertyDescriptor): PropertyDescriptor => {
        const routes = Reflect.getMetadata(ROUTES_METADATA, target) || {};
        if (!routes[key]) {
            routes[key] = {};
        }

        routes[key].customErrorHandler = handlerFn;

        Reflect.defineMetadata(ROUTES_METADATA, routes, target);
        return descriptor;
    };
};
