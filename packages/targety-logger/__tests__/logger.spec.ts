jest.mock("../src");

describe("LOGGER", () => {
    afterEach(() => {
        jest.resetModules();
    });
    it("has a default logLevel", () => {
        delete process.env.LOG_LEVEL;
        const { LOGGER } = jest.requireActual("../src");
        expect(LOGGER.level).toEqual("fatal");
    });
    it("takes logLevel from env variable", () => {
        process.env.LOG_LEVEL = "trace";
        const { LOGGER } = jest.requireActual("../src");
        expect(LOGGER.level).toEqual("trace");
    });
});
