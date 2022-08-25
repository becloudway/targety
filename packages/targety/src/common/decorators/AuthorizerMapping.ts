import "reflect-metadata";

import { LAMBDA_AUTHORIZER } from "../Constants";

export interface AuthorizerMetadata {
    target: string;
}

export const LambdaRequestAuthorizer = (): MethodDecorator => {
    return (target, key, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(LAMBDA_AUTHORIZER, { target: key }, target);
        return descriptor;
    };
};
