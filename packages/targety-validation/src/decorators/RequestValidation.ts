/* eslint-disable @typescript-eslint/ban-ts-ignore */
import "reflect-metadata";

import { ValidationClass, ValidatorOptions, plainToClass } from "../";
import { ValidationError } from "targety-errors";
import { Request, Enums } from "targety";
import { LOGGER } from "targety-logger";

const getValidationObject = (request: Request, paramType: Enums.RequestParams): object => {
    switch (paramType) {
        case Enums.RequestParams.BODY:
            return request.getBody();
        case Enums.RequestParams.QUERY:
            return request.getQueryParams();
        case Enums.RequestParams.PATH:
            return request.getPathParams();
    }
};

const setValidationObject = (request: Request, paramType: Enums.RequestParams, input: any): void => {
    switch (paramType) {
        case Enums.RequestParams.BODY:
            request.setBody(input);
            break;
        case Enums.RequestParams.QUERY:
            request.setQueryParams(input);
            break;
        case Enums.RequestParams.PATH:
            request.setPathParams(input);
            break;
    }
};

export const RequestValidation = (
    Klass: new () => ValidationClass,
    paramType: Enums.RequestParams,
    options: RequestValidationOptions,
    doApplyGroups?: (input: any) => string[],
): MethodDecorator => {
    const validatorOptions: ValidatorOptions = options.allowUnknownFields
        ? { whitelist: false, forbidNonWhitelisted: false }
        : { whitelist: true, forbidNonWhitelisted: true };

    return (target, key, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;

        descriptor.value = async function (request: Request, ...args: any[]) {
            const validationObject = getValidationObject(request, paramType) as { [k: string]: any };
            const klass = plainToClass(Klass, validationObject);
            LOGGER.debug("%s validation for: %j ===> %j", paramType, validationObject, klass);

            const appliedGroups = doApplyGroups && doApplyGroups(validationObject);
            let alteredOptions = validatorOptions;
            if (appliedGroups) {
                alteredOptions = { ...validatorOptions };
                alteredOptions.groups = validatorOptions.groups
                    ? [...validatorOptions.groups, ...appliedGroups]
                    : appliedGroups;
            }

            const validationResult = await klass.validate(alteredOptions);

            if (validationResult.length > 0) {
                throw new ValidationError({ validationErrors: validationResult });
            }

            setValidationObject(request, paramType, klass);
            return originalMethod.call(this, request, ...args);
        };
    };
};

export interface RequestValidationOptions {
    allowUnknownFields?: boolean;
}

const createMappingDecorator =
    (paramType: Enums.RequestParams) =>
    (
        klass: new () => ValidationClass,
        options: RequestValidationOptions = {},
        doApplyGroups?: (input: any) => string[],
    ): MethodDecorator =>
        RequestValidation(klass, paramType, options, doApplyGroups);

export const ValidateBody = createMappingDecorator(Enums.RequestParams.BODY);
export const ValidateQuery = createMappingDecorator(Enums.RequestParams.QUERY);
export const ValidatePath = createMappingDecorator(Enums.RequestParams.PATH);
