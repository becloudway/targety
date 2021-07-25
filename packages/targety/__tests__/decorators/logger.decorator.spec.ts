/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* tslint:disable:max-classes-per-file */

import { Log, LogLevel } from "../../src/common/decorators";

import { LOGGER } from "../../src/logging";
jest.mock("../../src/logging");

class SomeClass {
    @Log()
    public test1() {}

    @Log("test2", LogLevel.INFO)
    public test2() {}

    @Log("test3")
    public test3() {}
}

describe("Log#Decorator", () => {
    describe("Log", () => {
        it("Should log the call with default settings", async () => {
            const klass = new SomeClass();
            klass.test1();
            expect(LOGGER.debug).toBeCalled();
            expect(LOGGER.debug).toBeCalledWith("calling SomeClass.test1");
        });

        it("Should log the call with a custom message and different logLevel settings", async () => {
            const klass = new SomeClass();
            klass.test2();
            expect(LOGGER.info).toBeCalledTimes(1);
            expect(LOGGER.info).toBeCalledWith("calling SomeClass.test2 - test2");
        });

        it("Should log the call with a custom message", async () => {
            const klass = new SomeClass();
            klass.test3();
            expect(LOGGER.debug).toBeCalledTimes(2);
            expect(LOGGER.debug).toBeCalledWith("calling SomeClass.test3 - test3");
        });
    });
});
