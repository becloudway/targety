# Logging with Targety Logger

```{admonition} WIP
:class: info

The code for targety-logger can be found [here](https://github.com/becloudway/targety/tree/main/packages/targety-logger)
```

Targety uses Pino as it's internall logger it does this by including the targety-logger package which is
publicly available. The targety-logger has been made publicy available so that you can use it as well if you
want to use the same logger as targety is already using.

## Install targety-logger

Using npm:

```bash
npm i targety-logger
```

Using yarn:
```bash
yarn add targety-logger
```

Optionally you can install `@types/pino` for better typing support.

## How to use targety-logger

Targety-Logger exports two things 1) the default logger 2) the createLogger function.

The default logger is just a default logger that has been created and is used internally by Targety (core).
You could use this logger but ideally you create your own logger.

```ts
import { LOGGER } from "targety-logger";

// Logger is just a regular Pino Logger
LOGGER.info("some message");
```

Creating your own logger can be done using the createLogger function which provides some flexibility.

```ts
import { createLogger } from "targety-logger";

const logger = createLogger("my-logger" /* name */, { /* pino options */ })
logger.logger // this is the actuall pino logger
```

Also keep in mind that Targety exports a LoggerWrapper object that only exposes parts of the actuall pino logger.
However the pino logger can be accessed through the LoggerWrapper.

For more info on how to use pino's logger and the options that you can provide see the [further reading](#further-reading) section.

## Further reading

- [Pino](https://github.com/pinojs/pino)
- [Pino Options](https://github.com/pinojs/pino/blob/master/docs/api.md#options)

## possible updates
- Override the logging library used