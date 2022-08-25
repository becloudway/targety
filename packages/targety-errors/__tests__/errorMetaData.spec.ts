import { InternalServerError } from "../src";

describe("Metadata", () => {
    const error = new InternalServerError("message the error");

    it("should throw an error with metadata if metadata is set", () => {
        error.metadata.set("item", "some-random-id");
        expect(error.metadataToJson()).toEqual({ item: "some-random-id" });
    });

    it("should throw an error with metadata passed in the constructor", () => {
        expect(new InternalServerError("oepsy", { item: "some-random-id" }).metadataToJson()).toEqual({
            item: "some-random-id",
        });
    });
});
