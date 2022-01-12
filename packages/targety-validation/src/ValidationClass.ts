import { validate, ValidationError, ValidatorOptions } from "class-validator";

export const defaultValidatorOptions: ValidatorOptions = {
    forbidNonWhitelisted: true,
    validationError: {
        target: false,
        value: false,
    },
    whitelist: true,
};

export class ValidationClass {
    public async validate(validatorOptions: ValidatorOptions = {}): Promise<ValidationError[]> {
        return validate(this, { ...defaultValidatorOptions, ...validatorOptions });
    }
}
