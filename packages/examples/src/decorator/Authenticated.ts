import { methodDecorator } from "targety/lib/utils/DecoratorHelper";

export interface AuthenticatedMetaData {
    authRequired: boolean;
}

export const AuthenticatedIdentifier = "AUTHENTICATED";

export const Authenticated = (): any => methodDecorator({ authRequired: true });
