import { Strings } from "../../src/utils";

describe("utils#Strings", () => {
    describe("isBlankOrEmpty", () => {
        it("should return true when if a string is empty", () => {
            expect(Strings.isBlankOrEmpty("")).toEqual(true);
        });
        it("should return true when string only contains spaces", () => {
            expect(Strings.isBlankOrEmpty("   ")).toEqual(true);
        });
        it("should return true when string only contains spaces", () => {
            expect(Strings.isBlankOrEmpty(undefined)).toEqual(true);
        });
        it("should return false when string is correct", () => {
            expect(Strings.isBlankOrEmpty("greggre")).toEqual(false);
        });
    });

    describe("makeLowerSnakeCase", () => {
        it("should turn the given string into a lower snake case string", () => {
            expect(Strings.makeLowerSnakeCase("How Does this work")).toEqual("how_does_this_work");
        });
    });

    describe("toList", () => {
        it("should convert a comma separated string into a trimmed list", () => {
            expect(Strings.toList("so, this , is cool")).toEqual(["so", "this", "is cool"]);
        });
    });

    describe("encode", () => {
        it("should encode a string", () => {
            expect(Strings.encode<string>("test")).toEqual("dGVzdA==");
        });
        it("should encode an object", () => {
            expect(Strings.encode<unknown>({ pizza: "test" })).toEqual("eyJwaXp6YSI6InRlc3QifQ==");
        });
        it("should return an empty string when there is nothing to encode", () => {
            expect(Strings.encode<unknown>(undefined)).toEqual("");
        });
    });

    describe("decode", () => {
        it("should decode an object", () => {
            expect(Strings.decode<string>("eyJwaXp6YSI6InRlc3QifQ=")).toEqual({ pizza: "test" });
        });
        it("should return null when there is nothing to decode", () => {
            expect(Strings.decode<string>(undefined)).toEqual(null);
        });
        it("should throw an error when the decoded result cannot be parsed as an object", () => {
            expect(() => Strings.decode<string>("dGVzdA==")).toThrowError("Failed parsing payload");
        });
    });
});
