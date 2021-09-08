# 🎯 Targety

A TypeScript based focus build library for Routing on [AWS Lambda](https://aws.amazon.com/lambda/details).

## Features

- Focus on Decorators
- CORS
- Validation (using: [Class Validator](https://github.com/typestack/class-validator))
- API Gateway Focus
- Middleware system
- Extensible using middleware and custom decorators
- Defaults (But customizable)
    - Error Handling
    - Responses
- Metadata support for request scoped data passing
- Support for {proxy+}, proxy resources
    - Works with path parameters as it would normally

## Installation

_Npm:_

```bash
npm install targety

```

_Yarn:_

```bash
yarn add targety
```

## Getting Started

The quickest way to get started with `Targety` is by creating an `EntryPoint` and `Handler`.

_Example Handler_

```ts
import {
    Get,
    Handler,
    Middleware,
    Request,
    Response,
    ResponseBody
} from "targety";

export class ExampleHandler extends Handler {
    protected middleware: Middleware[];

    @Get("/test")
    public async getTestMethod(request: Request): Promise<ResponseBody> {
        return Response.ok(request).send({ test: "ok" });
    }
}
```

The above example is the most basic implementation of a Handler (Router) with `Targety`.
For a more detailed implementation check the examples.

_Example EntryPoint_

```ts
import { Handler, LambdaEntryPoint } from "targety";
import { ExampleHandler } from "./Handler";

class ExampleEntryPoint extends LambdaEntryPoint {
    protected async initializeHandler(): Promise<Handler> {
        return new ExampleHandler();
    }
}

const entryPoint = new ExampleEntryPoint();

// The exposed handler
export const handler = entryPoint.handle.bind(entryPoint);
```

The `EntryPoint` should create and expose the Handler. The general idea for the `entry point`, 
is to allow you to setup `services`, `connections`, `configuration`, ... once that is then passed to
the constructor of the `handler`.

For a complete example see [examples](https://github.com/becloudway/targety/tree/main/packages/examples).

## Gotchas

This is a list of hidden defaults and functionalities in the library that are good to know.

### Default Error Handling

Whenever an error is throw that is "known" aka. a error available in the library [errors](https://github.com/becloudway/targety/tree/main/packages/targety/src/errors) this error will be mapped to the HTTP Status Code that it belongs too.

> This is only when an error is thrown from a Handler class, for instance when a route fails.
> When an error is unknown and thrown this is returned as an internal server error, the logs will reflect this.

For instance throwing a error:

```ts
import { Error } from "targety";

// <snip>
    throw new Error.UnauthorizedError("Unauthorized");
// </snip>
```

Will result in the error response by default as handeld in the [Handler](https://github.com/becloudway/targety/tree/main/packages/targety/src/Handler.ts):

```json
{
    "message": "Unauthorized",
    "errorCode": "Unauthorized",
    "awsRequestId": "f9d04c1c-794f-44af-aeb0-65c6ef907ff1"
}
```

The AWS Request Id is the actual AWS Request Id that you could use for finding the corresponding logs.

### Default Cors Headers

Every response will get a set of Default Headers these can be overwritten and are defined in the library [here](https://github.com/becloudway/targety/tree/main/packages/targety/src/Response.ts)


### AWS Request ID Header

By default the AWS Request ID is returned as a header `X-AWS-Request-Id`

### Default Logging

The library does use [pino](https://github.com/pinojs/pino) for it's logging capabilities, this will be configurable in a later version.
To enable logging export the environment variable `LOG_LEVEL`.

## Further Reading

Other interesting and relevant links.

### Docs

The project contains a [docs](https://github.com/becloudway/targety/tree/main/packages/targety/docs) folder that contains the documentation of the current version.
It can also be build using the `npm|yarn run docs` command in the `targety` package folder.

### Example

The project contains an example in the [examples](https://github.com/becloudway/targety/tree/main/packages/examples) directory.
This is a working example that can be deployed on AWS if desired.

More examples might be added to further explain functionality.

### Class Validation

The build in class validation is just a wrapper around [class-validator](https://github.com/typestack/class-validator) I recommend checking out there documentation.

## WIP

- ~API Gateway Proxy Support (/{proxy+})~
- More configuration options
- Make the docs available as a Page
- Make the logging module configurable