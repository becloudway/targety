import * as Logger from "bunyan";

jest.mock("../src/logging");

describe("LOGGER", () => {
    afterEach(() => {
        jest.resetModules();
    });
    it("has a default logLevel", () => {
        delete process.env.LOG_LEVEL;
        const { LOGGER } = jest.requireActual("../src/logging");
        expect(LOGGER.level()).toEqual(Logger.INFO);
    });
    it("has a default logName", () => {
        const { LOGGER } = jest.requireActual("../src/logging");
        expect(LOGGER.fields.name).toEqual("APP");
    });
    it("takes logLevel from env variable", () => {
        process.env.LOG_LEVEL = "trace";
        const { LOGGER } = jest.requireActual("../src/logging");
        expect(LOGGER.level()).toEqual(Logger.TRACE);
    });
    it("takes default logLevel if env logLevel is bogus", () => {
        process.env.LOG_LEVEL = "null";
        const { LOGGER } = jest.requireActual("../src/logging");
        expect(LOGGER.level()).toEqual(Logger.INFO);
    });
});
