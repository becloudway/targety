import { LOGGER } from "./logging";
import { Objects } from "./utils";
import { Context } from "./common/interfaces";
import { Handler } from "./Handler";
import { LambdaProxyEvent, Request } from "./Request";
import { Response } from "./Response";
import { ResponseBody } from "./ResponseBody";

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
        LOGGER.debug("Heartbeat function");
        // Disable cors because
        return Response.noContent(request, { cors: false, defaultHeaders: false }).send();
    }

    /**
     * Entrypoint for the Api Gateway Proxy event.
     */
    public async handle(event: LambdaProxyEvent, context: Context): Promise<ResponseBody> {
        let request: Request;
        LOGGER.debug(event, context, "Lambda Event");

        // Makes sure that the response is sent straight away when callback is invoked
        // instead of waiting for the nodejs event loop to be empty. This is best practice
        // for nodeJS lambdas on AWS
        // See https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
        if (context) {
            context.callbackWaitsForEmptyEventLoop = false;
        }

        try {
            request = new Request(event);

            if (Objects.isEmpty(event)) {
                return LambdaEntryPoint.heartBeatResponse(request);
            }
            return await this.handleRequest(request, context);
        } catch (e) {
            LOGGER.error(e, "Error handling request");
            return Response.fromError(request, e);
        }
    }

    /**
     * initializeHandler is used for example to open a DB connection or set up Dependency Injection
     * @returns handler Handler exposes api endpoint methods
     */
    protected abstract initializeHandler(): Promise<Handler>;

    private async handleRequest(request: Request, context: Context): Promise<ResponseBody> {
        if (!this.handler) {
            this.handler = await this.initPromise;
        }
        return this.handler.handle(request, context);
    }
}
