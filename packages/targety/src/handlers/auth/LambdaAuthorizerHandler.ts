import { AuthResponse } from "aws-lambda";
import { AuthorizerMetadata } from "../..";
import { Authorizer } from "./Authorizer";
import { LAMBDA_AUTHORIZER } from "../../common/Constants";
import { Context } from "../../common/interfaces";
import { InternalServerError } from "../../errors";
import { Handler } from "../../Handler";
import { HandlerStrategy } from "../../HandlerStrategy";
import { LambdaAuthorizerRequest } from "./LambdaAuthorizerRequest";
import { LOGGER } from "targety-logger";

export class LambdaAuthorizerHandler implements HandlerStrategy<LambdaAuthorizerRequest, AuthResponse> {
    protected authorizer: Authorizer;

    public constructor(private parent: Handler) {
        this.authorizer = this.createAuthorizer();
    }

    public async handle(event: LambdaAuthorizerRequest, context: Context): Promise<AuthResponse> {
        if (!this.authorizer) {
            throw new InternalServerError("Tried to use a authorizer when none was available");
        }

        return await this.parent[this.authorizer.name](event, context);
    }

    private createAuthorizer(): Authorizer {
        const target: AuthorizerMetadata = Reflect.getMetadata(LAMBDA_AUTHORIZER, this.parent);
        if (!target) {
            LOGGER.trace("No authorizer defined for handler");
            return null;
        }

        return new Authorizer({
            name: target.target,
        });
    }
}
