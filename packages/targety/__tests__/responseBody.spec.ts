import { ResponseBody } from "../src";

let responseBody: ResponseBody;
describe("ResponseBody", () => {
    beforeEach(() => {
        responseBody = new ResponseBody({ statusCode: 200 });
    });

    it("has a statuscode", () => {
        expect(responseBody.statusCode).toEqual(200);
    });
    it("has a body", () => {
        responseBody = new ResponseBody({ statusCode: 200, body: "hello" });
        expect(responseBody.body).toEqual("hello");
    });
    it("has headers", () => {
        responseBody = new ResponseBody({ statusCode: 200, headers: { hello: ["world"] } });
        expect(responseBody.multiValueHeaders).toEqual({ hello: ["world"] });
    });
    it("sets body to empty string if not given", () => {
        expect(responseBody.body).toEqual("");
    });
    it("sets headers to empty object if not given", () => {
        expect(responseBody.multiValueHeaders).toEqual({});
    });
});
