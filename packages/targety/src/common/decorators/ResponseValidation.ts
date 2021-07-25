/* eslint-disable @typescript-eslint/ban-ts-ignore */
import "reflect-metadata";

import { ValidationClass, ValidatorOptions } from "../../validation";
import { ValidationError, InternalServerError } from "../../errors";
import { Request } from "../../Request";
import { LOGGER } from "../../logging";

export const ResponseValidation = (
    Klass: new () => ValidationClass,
    options: RequestValidationOptions = {},
): MethodDecorator => {
    const validatorOptions: ValidatorOptions = options.allowUnknownFields
        ? { whitelist: false, forbidNonWhitelisted: false }
        : { whitelist: true, forbidNonWhitelisted: true };

    return (target, key, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (request: Request, ...args: any[]) {
            const response = await originalMethod.call(this, request, ...args);
            const klass = new Klass();
            const body = response.body;

            let validationObject: any = null;
            try {
                validationObject = JSON.parse(body);
            } catch (ex) {
                LOGGER.error(ex);
                throw new InternalServerError("Can't parse response");
            }

            let validationObjects = validationObject;
            if (!Array.isArray(validationObjects)) {
                validationObjects = [validationObjects];
            }

            try {
                await Promise.all(
                    validationObjects.map(async (v: any) => {
                        Object.keys(v).forEach((prop: string) => {
                            (klass as any)[prop] = v[prop];
                        });

                        const validationResult = await klass.validate(validatorOptions);
                        if (validationResult.length > 0) {
                            throw new ValidationError({ validationErrors: validationResult });
                        }
                    }),
                );
            } catch (ex) {
                LOGGER.error(ex);
                throw ex;
            }

            return response;
        };
    };
};

export interface RequestValidationOptions {
    allowUnknownFields?: boolean;
}

export const ValidateResponse = ResponseValidation;
