# Targety Errors

Exposes the errors used and available withing Targety, you can create your own errors as long as they extend ApiError.
Targety will gladly accept any throw error that extends the ApiError all other Errors are thrown as an InternalServerError, unless otherwise specified in a middleware or customErrorHandler.

For more information refer to the docs.

## Further reading

- [Targety Errors How To Page](https://mitchanical.io/prov/targety/docs/how_to/pages/errors.html)
