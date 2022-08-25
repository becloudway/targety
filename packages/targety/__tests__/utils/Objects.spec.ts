import { Objects } from "../../src/utils";

describe("Objects", () => {
    describe("isEmpty", () => {
        it("should return true if the object is empty", () => {
            expect(Objects.isEmpty({})).toBeTruthy();
        });
        it("should return false if the object is not empty", () => {
            expect(Objects.isEmpty({ something: "very much yes" })).toBeFalsy();
        });
    });
});
