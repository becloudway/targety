import { Promises } from "../../src/utils";

describe("Promises", () => {
    it("should resolve a promise chain sequentially", async () => {
        const prom1 = jest.fn().mockResolvedValue("abc");
        const prom2 = jest.fn().mockResolvedValue("test2");

        const [prom1Result, prom2Result] = await Promises.resolvePromiseChain([prom1, prom2]);

        expect(prom1Result).toEqual("abc");
        expect(prom2Result).toEqual("test2");
    });
});
