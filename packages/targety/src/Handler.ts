import { CLASS_METADATA } from "./common/Constants";
import { Request } from "./handlers/request/Request";
import { ResponseBody } from "./handlers/request/ResponseBody";
import { Middleware } from "./MiddlewareHandler";
import { Context } from "./common/interfaces";
import { HandlerMetaData } from "./HandlerMetaData";
import { RouteHandler } from "./handlers/request/RouteHandler";
import { EventHandler } from "./handlers/event/EventHandler";
import { GenericRequest, RequestType } from "./GenericRequest";
import { HandlerStrategy } from "./HandlerStrategy";
import { LambdaAuthorizerHandler } from "./handlers/auth/LambdaAuthorizerHandler";

interface HandlerInterface {
    [key: string]: (request: Request) => Promise<ResponseBody | void | unknown>;
}

export abstract class Handler implements HandlerInterface {
    [key: string]: any;
    /**
     * Middleware currently only applies to RequestType.REQUEST
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
    public middleware: Middleware[] = [];
    public handlerMetaData: HandlerMetaData = this.getClassMetaData();

    private StrategyMap: Partial<Record<RequestType, HandlerStrategy<unknown, unknown>>> = {
        [RequestType.REQUEST]: new RouteHandler(this),
        [RequestType.EVENT]: new EventHandler(this),
        [RequestType.AUTH_REQUEST]: new LambdaAuthorizerHandler(this),
    };

    /**
     * Parses the action from the request, executes the middleware
     * and invokes the correct action on the handler implementation.
     */
    public async handle(request: GenericRequest, context?: Context): Promise<unknown> {
        const strategy = this.StrategyMap[request.getType()];

        if (!strategy) {
            throw new Error("No strategy found for request type " + request.getType());
        }

        return await strategy.handle(request, context);
    }

    protected getClassMetaData(): HandlerMetaData {
        const classMetaData = Reflect.getMetadata(CLASS_METADATA, this.constructor);
        return new HandlerMetaData({ metaData: classMetaData });
    }
}
