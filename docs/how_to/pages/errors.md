# Targety Errors

```{admonition} WIP
:class: info

The code for targety-errors can be found [here](https://github.com/becloudway/targety/tree/main/packages/targety-errors)
```

```{admonition} Support is limited
:class: error

Currently only the `API Request Events` support default error handling, when using targety-errors with fi. SNS, SQS or other events an actuall error is thrown and no handling is done by Targety.
```

Targety has build in error handling to be able to use these build in errors from targety without the need to include targety completly you can use
the targety-errors module. This module only exposes the errors, Targety also depends on these errors and exposes them from within Targety as `Errors` or `lib/errors` see examples for more details.

## Install targety-errors

Using npm:

```bash
npm i targety-errors
```

Using yarn:
```bash
yarn add targety-errors
```

##  Available errors

The following errors are available within the targety-errors package.
More are to be added in following updates of the package.

| Error Class | Error Status Code | Error Name | Error Code |
|-------------|-------------------|------------| ---------- |
| BadRequestError | 400 | BadRequestError | BadRequest |
| ConflictError | 409 | ConflictError | Conflict |
| ForbiddenError | 403 | ForbiddenError | Forbidden |
| InternalServerError | 500 | InternalServerError | InternalServerError |
| NotFoundError | 404 | NotFoundError | NotFound |
| ValidationError | 400 | ValidationError | ValidationError |

## How to use

When you want to throw an API error you can do so within you codebase.
Either by throwing it directly or by extending an API error within your own errors.

### Example of an NotFoundError

```ts
// Import from targety
import { NotFoundError } from "targety/lib/errors";
// Or import from targety-errors
import { NotFoundError } from "targety-errors";

throw new NotFoundError("Item not found");
```

### Error Metadata

When throwing an error you might want to expose additional information.
In thise case you can add this information as metadata then Targety will make it part of the error response.

```ts
import { NotFoundError } from "targety-errors";

throw new NotFoundError("Item not found", { item: itemId });
```

The result of the above error could look something like this when it goes through the handler and is parsed by the default error handling logic:

```json
{
    "statusCode": 404,
    "body": "{\"message\":\"Item not found\",\"errorCode\":\"NotFound\",\"item\":\"I-123456\"}",
    "multiValueHeaders": {
        "x-aws-request-id": [ "c6af9ac6-7b61-11e6-9a41-93e8deadbeef" ],
        "content-type": [ "application/json" ],
        "SNIP": "other-headers"
    }
}
```

You could also achieve the same result by using the metadata as exposed property of the error object.

```ts

import { NotFoundError } from "targety-errors";

const Error = new NotFoundError("Item not found");
Error.metadata.set("item", itemId);

throw Error;
```

## Special Cases

Some errors are handled differently this is currently only the case with ValidationErrors.

### ValidationError

As Targety has build-in support for [class-validator](https://github.com/typestack/class-validator) the behaviour of it is to throw an ValidationError when something is wrong.

```{admonition} WIP
:class: info

More info on how to do class validation for response body, request body, path parameters and query string parameters with Targety can be found [here](https://mitchanical.io/prov/targety/docs/how_to/pages/validation.html)
```

This error is also parsed by the default error handling logic and returns the following response body:

```json
{
    "statusCode": 400,
    "body": "{\"message\":\"Validation error\",\"errorCode\":\"ValidationError\",\"validationErrors\":[{\"field\":\"name\",\"validationError\":\"name is required\"}]}",
    "multiValueHeaders": {
        "x-aws-request-id": [
            "c6af9ac6-7b61-11e6-9a41-93e8deadbeef"
        ],
        "content-type": [
            "application/json"
        ]
    }
}
```

The parsed body would look as followed, keep in mind that this can become rather complex when using nested objects, arrays and so on with validation: 

```json
{
    "message": "Validation error",
    "errorCode": "ValidationError",
    "validationErrors": [
        {
            "field": "name",
            "validationError": "name is required"
        }
    ]
}
```

## Changing the default behaviour

The default behaviour can be altered by using `middleware` or an `customErrorHandler` both options will gain the final error and can return altered responses that overrule the default behaviour. This is further documented at the following locations:

- [Creating your own and using existing middleware](https://mitchanical.io/prov/targety/docs/how_to/pages/middleware.html)
- [Using the customErrorHandler](#WIP)
