import { ResponseBody } from ".";
import { Request } from "./Request";
import { Promises } from "./utils";
import { ApiError } from "./errors";
import { Context } from "./common/interfaces";
import { Route } from "./Route";

/**
 * Definition of an middleware
 */
export type Middleware = (request: Request, action: Route, context?: Context) => Promise<MiddlewareResponse>;
/**
 * The return type for middleware that define a follow up object
 *
 * Can be used when fi. you need to discard something after the request has completed or failed
 */
export type MiddlewareFollowUp = {
    onError: (request: Request, error: ApiError | Error) => Promise<void>;
    onSuccess: (request: Request, response: ResponseBody) => Promise<ResponseBody>;
};
/**
 * The the expected responses of functions that are used as middleware
 */
export type MiddlewareResponse = void | ResponseBody | MiddlewareFollowUp;

/**
 * Checks if the given object is a MiddlewareFollowUp object
 *
 * @param middlewareFollowUp an object that could be a MiddlewareFollowUp object
 */
export const isMiddlewareFollowUp = (middlewareFollowUp: MiddlewareFollowUp): boolean => {
    return !!(middlewareFollowUp?.onError || middlewareFollowUp?.onSuccess);
};

/**
 * Handles all middleware related logic, like resolving the middleware promise chain.
 *
 * @remark only use this as a class instance when you are sure that it can be properly reused
 * The risk is in the storing of the middleware response and middleware followup arrays.
 * Which need to be kept in state until they can be resolved (onError, onSuccess) when we keep this on a state level
 * we need to clear these arrays after each new incoming request. To avoid previous requests impacting the current ones
 * as state can be shared between multiple requests.
 */
export class MiddlewareHandler {
    private route: Route;
    private middleware: Middleware[];

    private middlewareResponses: MiddlewareResponse[] = [];
    private middlewareFollowUps: MiddlewareFollowUp[] = [];

    public constructor(route: Route, middleware: Middleware[]) {
        this.route = route;
        this.middleware = middleware;
    }

    /**
     * Handles an incoming request and runs the defined middleware against it.
     * Then checks if there are actions to be taken:
     *
     * - prematureErrorResponse: did an error occur in the middleware then we throw this error
     * - prematureResponse: did a middleware return a response then we return this response
     *
     * - middlewareFollowUp: are there actions to be taken on success or failure keep them in state
     *   until they can be resolved.
     *
     * @param request the incoming AWS API Gateway request
     * @param context the context of the execution environment
     */
    public async handle(request: Request, context: Context): Promise<ResponseBody | void> {
        /**
         * Run all the middleware and catch errors and responses so that they can be verified
         * Stops resolving the chain after the first error occurred
         */
        this.middlewareResponses = await Promises.resolvePromiseChain(
            this.middleware.map((middleware: Middleware) => async (chainResults: any) => {
                if (chainResults.find((v: any) => v instanceof Error)) return;

                try {
                    return await middleware(request, this.route, context);
                } catch (ex) {
                    return ex;
                }
            }),
        );

        /**
         * Store followUps so that they can be resolved when the request has succeeded or failed
         */
        this.middlewareFollowUps = this.middlewareResponses.filter(isMiddlewareFollowUp) as MiddlewareFollowUp[];

        // Throw the prematureError when there is one
        const prematureError = this.middlewareResponses.find((resp: any) => resp instanceof Error);
        if (prematureError) {
            throw prematureError;
        }

        // return the prematureResponse when there is one
        const prematureResponse = this.middlewareResponses.find((resp: any) => resp instanceof ResponseBody);
        if (prematureResponse && !isMiddlewareFollowUp(prematureResponse as any)) {
            return prematureResponse as ResponseBody;
        }
    }

    /**
     * Handles all success followups for a successful api request
     *
     * @param request the AWS API Gateway request
     * @param response the response to be send back to the user
     */
    public async handleSuccessFollowUps(request: Request, response: ResponseBody): Promise<ResponseBody> {
        const result: Array<ResponseBody> = await Promises.resolvePromiseChain(
            this.middlewareFollowUps.map((followUp: MiddlewareFollowUp) => async () =>
                await followUp.onSuccess(request, response),
            ),
        );

        return result.pop();
    }

    /**
     * Handles all failure followups for a unsuccessful api request
     *
     * @param request the AWS API Gateway request
     * @param error the error thrown by the executed code
     */
    public async handleFailureFollowUps(request: Request, error: ApiError | Error): Promise<void> {
        return await Promises.resolvePromiseChain(
            this.middlewareFollowUps.map((followUp: MiddlewareFollowUp) => async () =>
                await followUp.onError(request, error),
            ),
        );
    }
}
