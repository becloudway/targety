import { LOGGER } from "targety-logger";
import { Objects } from "./utils";
import { Context } from "./common/interfaces";
import { Handler } from "./Handler";
import { Request } from "./handlers/request/Request";
import { LambdaProxyEvent } from "./handlers/request/LambdaProxyEvent";
import { Response } from "./handlers/request/Response";
import { ResponseBody } from "./handlers/request/ResponseBody";
import { GenericEvent } from "./handlers/event/GenericEvent";
import { GenericRequest, RequestType } from "./GenericRequest";
import { EventRequest } from "./handlers/event/EventRequest";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { LambdaAuthorizerRequest } from "./handlers/auth/LambdaAuthorizerRequest";

/**
 * Represents the LambdaEntryPoint abstract class
 */

export abstract class LambdaEntryPoint {
    public handler: Handler;
    public initPromise: Promise<Handler>;

    public constructor() {
        // pre-loading the handler, even when no request was made yet
        this.initPromise = this.initializeHandler();
    }

    /**
     * HeartBeatResponse can be used to keep the Lambda warm using Cloudwatch Events
     */
    private static heartBeatResponse(request: Request): ResponseBody {
        LOGGER.trace("Heartbeat function");
        // Disable cors because
        return Response.noContent(request, { cors: false, defaultHeaders: false }).send();
    }

    /**
     * Entrypoint for the Api Gateway Proxy event.
     */
    public async handle(
        event: LambdaProxyEvent | GenericEvent<unknown> | APIGatewayRequestAuthorizerEvent | {},
        context?: Context,
    ): Promise<unknown> {
        let finalRequest: GenericRequest;
        LOGGER.trace({ event, context, type: "REQUEST" }, "incoming request");

        if (context) {
            context.callbackWaitsForEmptyEventLoop = false;
        }

        try {
            if ((event as GenericEvent<unknown>).Records) {
                finalRequest = new EventRequest<GenericEvent<unknown>>(event as GenericEvent<unknown>);
            } else if ((event as APIGatewayRequestAuthorizerEvent).type === "REQUEST") {
                finalRequest = new LambdaAuthorizerRequest(event as APIGatewayRequestAuthorizerEvent);
            } else {
                const request = new Request(event as LambdaProxyEvent);
                finalRequest = request;
                if (Objects.isEmpty(event)) {
                    return LambdaEntryPoint.heartBeatResponse(request);
                }
            }
            return await this.handleRequest(finalRequest, context);
        } catch (e) {
            if (finalRequest.isType(RequestType.REQUEST)) {
                LOGGER.error(e, "Error handling request");
                return Response.fromError(finalRequest as Request, e);
            }
            throw e;
        }
    }

    /**
     * initializeHandler is used for example to open a DB connection or set up Dependency Injection
     * @returns handler Handler exposes api endpoint methods
     */
    protected abstract initializeHandler(): Promise<Handler>;

    private async handleRequest(request: GenericRequest, context: Context): Promise<unknown> {
        if (!this.handler) {
            this.handler = await this.initPromise;
        }
        return this.handler.handle(request, context);
    }
}
