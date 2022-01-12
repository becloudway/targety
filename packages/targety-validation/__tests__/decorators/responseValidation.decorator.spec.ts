/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* tslint:disable:max-classes-per-file */

import { IsNumber, IsString, ValidationClass, ValidateResponse } from "../../src";

class Body extends ValidationClass {
    @IsString()
    public name: string;

    @IsNumber()
    public age: number;
}

class Klass {
    @ValidateResponse(Body)
    public invoke(): any {
        return {
            body: JSON.stringify({
                name: "Pizza",
                age: 10,
            }),
        };
    }
}

class Klass2 {
    @ValidateResponse(Body)
    public invoke(): any {
        return {
            body: JSON.stringify({
                name: "Pizza",
            }),
        };
    }
}

class Klass3 {
    @ValidateResponse(Body)
    public invoke(): any {
        return {
            body: "",
        };
    }
}

describe("Decorators#RequestValiation", () => {
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.restoreAllMocks());

    describe("ValidateResponse", () => {
        it("validates a correct body", async () => {
            const klass = new Klass();
            const { body } = await klass.invoke();

            expect(JSON.parse(body)).toEqual({
                name: "Pizza",
                age: 10,
            });
        });

        it("throws when the response validation is invalid", async () => {
            const klass = new Klass2();
            return expect(klass.invoke()).rejects.toThrow();
        });

        it("throws when the response can not be parsed", async () => {
            const klass = new Klass3();
            return expect(klass.invoke()).rejects.toThrow();
        });
    });
});
