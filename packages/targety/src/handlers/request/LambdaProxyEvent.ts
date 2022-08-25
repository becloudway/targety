import { HttpMethod } from "../../common/types";
import { LambdaIdentity } from "./Request";

export interface LambdaProxyEvent {
    body: string | null;
    headers: { [name: string]: string };
    multiValueHeaders: { [name: string]: string[] };
    httpMethod: HttpMethod;
    path: string;
    pathParameters: { [name: string]: string } | null;
    queryStringParameters: { [name: string]: string } | null;
    requestContext: {
        identity: LambdaIdentity;
        requestId: string;
        stage: string;
    };
    resource: string;
    [key: string]: any;
}
