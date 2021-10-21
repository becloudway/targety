import { CorsMetaData, CustomErrorHandlerType, Handler, Request, ResponseBody } from "../..";
import { ROUTES_METADATA } from "../../common/Constants";
import { CustomerErrorHandlerMetaData } from "../../common/decorators/CustomerErrorHandler";
import { Context } from "../../common/interfaces";
import { InternalServerError, NotFoundError } from "../../errors";
import { HandlerStrategy } from "../../HandlerStrategy";
import { LOGGER } from "targety-logger";
import { MiddlewareHandler } from "../../MiddlewareHandler";
import { OptionsHandler } from "../../OptionsHandler";
import { PathResolver } from "../../PathResolver";
import { Response } from "./Response";
import { Route } from "./Route";

export class RouteHandler implements HandlerStrategy<Request, Route | ResponseBody> {
    protected routes: Route[] = [];
    private pathResolver: PathResolver;

    public constructor(private parent: Handler) {
        this.routes = this.createRoutes();
        this.pathResolver = new PathResolver(this.routes);
    }

    public async getTarget(request: Request): Promise<Route | ResponseBody> {
        const resource = this.pathResolver.getFuzzyResource(request);

        if (!resource) {
            throw new NotFoundError("Resource not found");
        }

        if (request.getMethod() === "OPTIONS") {
            return await OptionsHandler.handleOptions(
                request,
                this.pathResolver.routeByPathFinder(resource.finalResource),
                this.parent.handlerMetaData.getMetaData<CorsMetaData>(),
            );
        }

        const route = this.pathResolver.routeFinder(request.getMethod(), resource.finalResource);

        if (!route) {
            throw new NotFoundError("Route not found");
        }

        if (resource.isProxyPath) {
            const pathParams = this.pathResolver.resolvePathParams(request.getPath(), resource.matcher);
            request.setParams(pathParams);
        }

        return route;
    }

    public async handle(request: Request, context: Context): Promise<ResponseBody> {
        let customErrorHandler: CustomErrorHandlerType<Handler> | undefined = undefined;
        let middleWareHandler: MiddlewareHandler;

        let target: Route | ResponseBody;
        try {
            target = await this.getTarget(request);
            if ((target as ResponseBody).statusCode || target instanceof ResponseBody) {
                return target as ResponseBody;
            }

            middleWareHandler = new MiddlewareHandler(target, this.parent.middleware);
            customErrorHandler = target.getMetaData<CustomerErrorHandlerMetaData>().customErrorHandler;

            // return the response from the middleware when a response is given
            const prematureResponse = await middleWareHandler.handle(request, context);
            if (prematureResponse) {
                return prematureResponse;
            }

            const result = await this.parent[target.name](request);
            return (await middleWareHandler.handleSuccessFollowUps(request, result)) || result;
        } catch (e) {
            // Allows the route itself to handle errors in their own way when required
            const followUpResult = await middleWareHandler?.handleFailureFollowUps(request, e);
            const customErrorResponse = customErrorHandler && (await customErrorHandler(request, this.parent, e));

            const finalError = customErrorResponse || followUpResult || Response.fromError(request as Request, e);

            // only log stacks for internal server errors as an error
            finalError.statusCode === InternalServerError.STATUS_CODE
                ? LOGGER.error(e, "An internal server error occurred")
                : LOGGER.warn(e, "An known error occurred");

            return finalError as ResponseBody;
        }
    }

    private createRoutes(): Route[] {
        const routes = Reflect.getMetadata(ROUTES_METADATA, this.parent);
        if (!routes) {
            LOGGER.trace("No routes defined for handler");
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
}
