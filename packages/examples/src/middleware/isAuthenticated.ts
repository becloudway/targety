import { Middleware, Request } from "targety";
import { UnauthorizedError } from "targety/lib/errors";
import { Route } from "targety/lib/Route";
import { AuthenticatedIdentifier, AuthenticatedMetaData } from "../decorator/Authenticated";

export interface IsAuthenticatedMetaData {
    userAuthenticated: boolean;
    profile: { name: string };
}

export const isAuthenticated: Middleware = async (request: Request, action: Route): Promise<void> => {
    if (!action.getMetaData<AuthenticatedMetaData>().authRequired) {
        return;
    }

    const authHeader = request.getHeader("authenticated");
    if (authHeader !== "secret") {
        throw new UnauthorizedError("Auth required");
    }

    request.metadata.set(AuthenticatedIdentifier, {
        userAuthenticated: true,
        profile: {
            name: "Steve",
        },
    } as IsAuthenticatedMetaData);
};
