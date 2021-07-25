import { Handler, LambdaEntryPoint } from "targety";
import { ExampleHandler } from "./Handler";

export class ExampleEntryPoint extends LambdaEntryPoint {
    protected async initializeHandler(): Promise<Handler> {
        return new ExampleHandler();
    }
}
