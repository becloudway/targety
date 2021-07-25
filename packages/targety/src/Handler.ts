import { LOGGER } from "./logging";
import { CLASS_METADATA, ROUTES_METADATA } from "./common/Constants";
import { HttpMethod } from "./common/types";
import { Request } from "./Request";
import { Response } from "./Response";
import { ResponseBody } from "./ResponseBody";
import { OptionsHandler } from "./OptionsHandler";
import { CustomerErrorHandlerMetaData, CustomErrorHandlerType } from "./common/decorators/CustomerErrorHandler";
import { Middleware, MiddlewareHandler } from "./MiddlewareHandler";
import { Context } from "./common/interfaces";
import { InternalServerError, NotFoundError } from "./errors";
import { Strings } from "./utils";
import { Route, RouteConfig } from "./Route";
import { HandlerMetaData } from "./HandlerMetaData";
import { CorsMetaData } from "./common/decorators";

export interface Routes {
    [key: string]: Route;
}

interface HandlerInterface {
    [key: string]: (request: Request) => Promise<ResponseBody>;
}

export abstract class Handler implements HandlerInterface {
    [key: string]: any;
    /**
     * Middleware is executed before the handler code. There are two types of middleware:
     *
     * 1) middleware that modifies the request object (express.js like functionality)
     * 2) middleware that returns a [[ResponseBody]] and interrupts the flow
     * 3) middleware that returns an object containing an onError and onSuccess
     *    function which can be resolved after the execution of the handler code.
     *
     * @protected
     * @abstract
     * @type {Middleware[]}
     * @memberof Handler
     */
    protected abstract middleware: Middleware[] = [];
    private handlerMetaData: HandlerMetaData = this.getClassMetaData();

    /**
     * Parses the action from the request, executes the middleware
     * and invokes the correct action on the handler implementation.
     */
    public async handle(request: Request, context?: Context): Promise<ResponseBody> {
        let customErrorHandler: CustomErrorHandlerType<Handler> | undefined = undefined;
        let middleWareHandler: MiddlewareHandler;
        let route: Route;

        try {
            if (request.getMethod() === "OPTIONS") {
                return await this.handleOptions(request);
            }

            route = this.getRouteConfig(request);

            middleWareHandler = new MiddlewareHandler(route, this.middleware);
            customErrorHandler = route.getMetaData<CustomerErrorHandlerMetaData>().customErrorHandler;

            // return the response from the middleware when a response is given
            const prematureResponse = await middleWareHandler.handle(request, context);
            if (prematureResponse) {
                return prematureResponse;
            }

            const result = await this[route.name](request);
            return (await middleWareHandler.handleSuccessFollowUps(request, result)) || result;
        } catch (e) {
            // Allows the route itself to handle errors in their own way when required
            await middleWareHandler?.handleFailureFollowUps(request, e);
            const customErrorResponse = customErrorHandler && (await customErrorHandler(request, this, e));

            const finalError = customErrorResponse || Response.fromError(request, e);

            // only log stacks for internal server errors as an error
            finalError.statusCode === InternalServerError.STATUS_CODE
                ? LOGGER.error("An internal server error occurred", e)
                : LOGGER.warn("An known error occurred", e);

            return finalError;
        }
    }

    /**
     * Handles incoming option callbacks for the Handler.handle method
     *
     * @param request the incoming request
     */
    protected async handleOptions(request: Request): Promise<ResponseBody> {
        const actions = this.getOptionsConfig(request);
        const corsMetaData = this.handlerMetaData.getMetaData<CorsMetaData>();

        const config = {
            allowCredentials: corsMetaData.AllowCredentials,
            allowedHeaders: [...corsMetaData.AllowHeaders],
            exposedHeaders: [...corsMetaData.ExposedHeaders],
        };

        actions.forEach((rc) => {
            const meta = rc.getMetaData<CorsMetaData>();
            config.allowedHeaders.push(...(meta?.AllowHeaders || []));
            config.exposedHeaders.push(...(meta?.ExposedHeaders || []));
            if (!config.allowCredentials) config.allowCredentials = meta.AllowCredentials;
        });

        const optionsHandler = new OptionsHandler(
            [],
            config.allowedHeaders,
            config.exposedHeaders,
            config.allowCredentials,
        );

        return optionsHandler.optionsResponse(request, actions);
    }

    /**
     * Parses the request so that it can be handled by our OptionsHandler
     *
     * @param request the incoming request
     */
    protected getOptionsConfig(request: Request): Route[] {
        const path: string = request.getResource();

        if (!path) {
            throw new NotFoundError("Route undefined");
        }

        const routesMetadata = Reflect.getMetadata(ROUTES_METADATA, this) as Routes;
        const routeNames: string[] = Object.keys(routesMetadata).filter((a) =>
            Strings.equalsTrimmedCaseInsensitive(path, routesMetadata[a].path),
        );

        if (!routeNames || routeNames.length === 0) {
            throw new NotFoundError("Route undefined");
        }

        return routeNames.map((routeName: string) => {
            const requestedAction: RouteConfig = routesMetadata[routeName];

            return new Route({
                name: routeName,
                path: requestedAction.path,
                method: requestedAction.method,
                metaData: requestedAction,
            });
        });
    }

    /**
     * Parses [[HandlerAction]] from request
     * @throws {Error} Unknown Route error
     */
    protected getRouteConfig(request: Request): Route {
        const path: string = request.getResource();
        const method: HttpMethod = request.getMethod();

        if (!path || !method) {
            throw new NotFoundError("Route undefined");
        }

        const routesMetadata = Reflect.getMetadata(ROUTES_METADATA, this) as Routes;
        const routeName: string = Object.keys(routesMetadata).find(
            (a) =>
                Strings.equalsTrimmedCaseInsensitive(path, routesMetadata[a].path) &&
                Strings.equalsTrimmedCaseInsensitive(method, routesMetadata[a].method),
        );
        if (!routeName) {
            throw new NotFoundError("Route undefined");
        }

        const requestedAction: RouteConfig = routesMetadata[routeName];
        const route = new Route({
            name: routeName,
            path: requestedAction.path,
            method: requestedAction.method,
            metaData: requestedAction,
        });

        return route;
    }

    protected getClassMetaData(): HandlerMetaData {
        const classMetaData = Reflect.getMetadata(CLASS_METADATA, this.constructor);
        return new HandlerMetaData({ metaData: classMetaData });
    }
}
