import { Request } from "./Request";
import { ResponseBody } from "./ResponseBody";
import { ForbiddenError } from "./errors";
import { LOGGER } from "./logging";
import { Route } from "./Route";

/**
 * Creates a proper regex to match with the origin of the incoming request
 *
 * @param entry the domain that you would like to whitelist
 */
const buildCorsRegexps = (entry: string): RegExp => new RegExp(`https?://[\\w\\.-]*.?${entry}$`);

/**
 * Handles logic for creating proper option call responses
 */
export class OptionsHandler {
    private domainRegexps: RegExp[];
    /**
     * Creates a new instance of the OptionsHandler
     *
     * @param allowedDomains a list of urls that is to be allowed for cors requests
     */
    public constructor(
        private allowedDomains: string[] = [],
        private allowedHeaders: string[] = [],
        private exposedHeaders: string[] = [],
        private allowCredentials: boolean = false,
    ) {
        this.domainRegexps = allowedDomains.map(buildCorsRegexps);
    }

    /**
     * Checks if the origin is a valid hostname that has been whitelisted
     *
     * @param origin the origin url
     * @throws [[ForbiddenError]] when the incoming host doesn't match anything in the whitelist
     */
    protected validateHostIncomingOrigin(origin: string): string {
        if (this.domainRegexps.length === 0) {
            return origin;
        }

        LOGGER.debug("Validating if origin is whitelisted: " + origin);
        if (!this.domainRegexps.some((v) => v.test(origin))) {
            LOGGER.error("Origin isn't allowed: " + origin);
            throw new ForbiddenError("origin isn't allowed");
        }

        return origin;
    }

    /**
     * Creates a proper response for an incoming options call.
     *
     * @param request the request from API Gateway parsed as a Request object
     * @param actions the actions that match the path for which the options call has been done.
     */
    public optionsResponse(request: Request, actions: Route[]): ResponseBody {
        const origin = this.validateHostIncomingOrigin(request.getOrigin());

        return {
            statusCode: 200,
            body: null,
            multiValueHeaders: {
                "Access-Control-Expose-Headers": [`${this.exposedHeaders.join(",")}`],
                "Access-Control-Allow-Methods": [
                    `${["OPTIONS", ...actions.map((v) => v.method.toUpperCase())].join(",")}`,
                ],
                "Access-Control-Allow-Headers": [`${this.allowedHeaders.join(",")}`],
                "Access-Control-Allow-Origin": [`${origin}`],
                "Access-Control-Allow-Credentials": [`${this.allowCredentials}`],
            },
        };
    }
}
