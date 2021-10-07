import { APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { GenericRequest, RequestType } from "../../GenericRequest";

export class LambdaAuthorizerRequest extends GenericRequest {
    public constructor(private _body: APIGatewayRequestAuthorizerEvent) {
        super();
    }

    public getType(): RequestType {
        return RequestType.AUTH_REQUEST;
    }

    public get body(): APIGatewayRequestAuthorizerEvent {
        return this._body;
    }
}
