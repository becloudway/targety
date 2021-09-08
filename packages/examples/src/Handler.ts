import {
    CORS,
    DefaultCORS,
    Get,
    Handler,
    Middleware,
    Request,
    Response,
    ResponseBody,
    ValidatePath,
    ValidateQuery,
    ValidateResponse,
} from "targety";
import { Authenticated, AuthenticatedIdentifier } from "./decorator/Authenticated";
import { TestRequest } from "./dtos/TestRequest";
import { TestResponse } from "./dtos/TestResponse";
import { UserIdRequest } from "./dtos/UserIdRequest";

import { isAuthenticated, IsAuthenticatedMetaData } from "./middleware/isAuthenticated";

@DefaultCORS({
    AllowCredentials: false,
    AllowHeaders: [],
    ExposedHeaders: ["content-type"],
})
export class ExampleHandler extends Handler {
    protected middleware: Middleware[] = [isAuthenticated];

    @Get("/test")
    @Authenticated()
    @ValidateQuery(TestRequest)
    @ValidateResponse(TestResponse)
    @CORS({ AllowCredentials: true, AllowHeaders: ["authenticated"] })
    public async getTestMethod(request: Request): Promise<ResponseBody> {
        return Response.ok(request).send({
            test: "ok",
            name: request.metadata.get<IsAuthenticatedMetaData>(AuthenticatedIdentifier).profile.name,
        });
    }

    @Get("/resources/user/{userId}")
    @Authenticated()
    @ValidatePath(UserIdRequest)
    @CORS({ AllowCredentials: true, AllowHeaders: ["authenticated"] })
    public async getResources(request: Request): Promise<ResponseBody> {
        const { userId } = request.getPathParams<UserIdRequest>();
        return Response.ok(request).send({
            test: "ok",
            id: userId,
        });
    }
}
