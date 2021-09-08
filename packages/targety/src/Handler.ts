import { LOGGER } from "./logging";
import { CLASS_METADATA, ROUTES_METADATA } from "./common/Constants";
import { Request } from "./Request";
import { Response } from "./Response";
import { ResponseBody } from "./ResponseBody";
import { OptionsHandler } from "./OptionsHandler";
import { CustomerErrorHandlerMetaData, CustomErrorHandlerType } from "./common/decorators/CustomerErrorHandler";
import { Middleware, MiddlewareHandler } from "./MiddlewareHandler";
import { Context } from "./common/interfaces";
import { InternalServerError, NotFoundError } from "./errors";
import { Route } from "./Route";
import { HandlerMetaData } from "./HandlerMetaData";
import { CorsMetaData } from "./common/decorators";
import { PathResolver } from "./PathResolver";

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
     * @type {Middleware[]}
     * @memberof Handler
     */
    protected middleware: Middleware[] = [];
    private handlerMetaData: HandlerMetaData = this.getClassMetaData();
    protected routes: Route[] = [];
    private pathResolver: PathResolver;

    public constructor() {
        this.routes = this.createRoutes();
        this.pathResolver = new PathResolver(this.routes);
    }

    /**
     * Parses the action from the request, executes the middleware
     * and invokes the correct action on the handler implementation.
     */
    public async handle(request: Request, context?: Context): Promise<ResponseBody> {
        let customErrorHandler: CustomErrorHandlerType<Handler> | undefined = undefined;
        let middleWareHandler: MiddlewareHandler;
        let route: Route;

        try {
            const resource = this.pathResolver.getFuzzyResource(request);

            if (!resource) {
                throw new NotFoundError("Resource not found");
            }

            if (request.getMethod() === "OPTIONS") {
                return await OptionsHandler.handleOptions(
                    request,
                    this.pathResolver.routeByPathFinder(resource.finalResource),
                    this.handlerMetaData.getMetaData<CorsMetaData>(),
                );
            }

            route = this.pathResolver.routeFinder(request.getMethod(), resource.finalResource);

            if (!route) {
                throw new NotFoundError("Route not found");
            }


            if (resource.isProxyPath) {
                const pathParams = this.pathResolver.resolvePathParams(request.getPath(), resource.matcher);
                request.setParams(pathParams);
            }


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
                ? LOGGER.error(e, "An internal server error occurred")
                : LOGGER.warn(e, "An known error occurred");

            return finalError;
        }
    }

    private createRoutes(): Route[] {
        const routes = Reflect.getMetadata(ROUTES_METADATA, this);
        if (!routes) {
            LOGGER.warn("No routes defined for handler");
            return [];
        }
        const routeNames = Object.keys(routes);

        return routeNames.map((v: string) => {
            const route = routes[v];
            return new Route({
                name: v,
                path: route.path,
                method: route.method,
                metaData: route,
            });
        });
    }

    protected getClassMetaData(): HandlerMetaData {
        const classMetaData = Reflect.getMetadata(CLASS_METADATA, this.constructor);
        return new HandlerMetaData({ metaData: classMetaData });
    }
}
