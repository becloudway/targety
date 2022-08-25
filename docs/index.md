# Welcome to Targety's documentation!

```{admonition} WIP
:class: info

The documentation is an ongoing project and will be improved over time.
```

## About Targety

A TypeScript based focus build library for Routing on AWS Lambda.

Targety is using TypeScript annotations and decorators to provide easy routing functionality and some additonal things like:

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

Targety is being developed by [Cloudway](https://cloudway.be) and is fully open-source under te _[MIT](https://github.com/becloudway/targety/blob/main/LICENSE.txt)_ license.

## About this documentation

The documentation focuses on the how to use Targety using detailed examples. If you are looking for the API Spec and/or examples you can use the following resources:

- [Targety Lambda Example](https://github.com/becloudway/targety-example)
- [Targety Api Spec](https://mitchanical.io/prov/targety/api)


## Table of Content
```{eval-rst}
.. toctree::
   :maxdepth: 3
   :glob:

   how_to/index.md
   introduction/index.md
```

## Indices and tables

```{eval-rst}
* :ref:`genindex`
* :ref:`search`
```