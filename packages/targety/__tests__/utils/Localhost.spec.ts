import { Localhost } from "../../src/utils";

it("should clean up a url", () => {
    const result = Localhost.stripPathFromUrl("https://localhost:8000/test/api?test=true&pizza=yum");
    expect(result).toEqual("https://localhost:8000");
});
