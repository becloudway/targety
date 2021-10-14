import { ApiGateWayProxyEvent } from "@dev/test-helper";
import { IsNumber, IsString, ValidationClass } from "../../src/validation";
import { ValidationError as ApiValidationError } from "../../src/errors";
import { ValidateBody, Request } from "../../src";

class Body extends ValidationClass {
    @IsString()
    public name: string;

    @IsNumber()
    public age: number;
}

const invokeStub = jest.fn();

class Klass {
    @ValidateBody(Body)
    public invoke(...args: any[]): any {
        return invokeStub(...args);
    }
}
class Klass2 {
    @ValidateBody(Body, { allowUnknownFields: true })
    public invoke(...args: any[]): any {
        return invokeStub(...args);
    }
}

describe("Decorators#RequestValiation", () => {
    let proxyEvent: ApiGateWayProxyEvent.ProxyEventInput;
    beforeEach(() => {
        proxyEvent = ApiGateWayProxyEvent.get();
    });
    afterEach(() => jest.clearAllMocks());
    afterAll(() => jest.restoreAllMocks());

    describe("ValidateBody", () => {
        it("validates a correct body", async () => {
            const klass = new Klass();
            proxyEvent.body = JSON.stringify({ age: 123, name: "yo" });
            const request = new Request(proxyEvent as any);
            await klass.invoke(request, "123", true, [1, 2, 3]);
            expect(invokeStub).toHaveBeenCalledWith(request, "123", true, [1, 2, 3]);
        });

        it("throws when passing unknown property by default", async () => {
            const klass = new Klass();
            proxyEvent.body = JSON.stringify({ age: 123, name: "yo", unknown: "value" });
            await expect(klass.invoke(new Request(proxyEvent as any))).rejects.toBeInstanceOf(ApiValidationError);
            expect(invokeStub).not.toHaveBeenCalled();
        });

        it("does not throw when passing unknown property if options is passed", async () => {
            const klass = new Klass2();
            proxyEvent.body = JSON.stringify({ age: 123, name: "yo", unknown: "value" });
            const request = new Request(proxyEvent as any);
            await klass.invoke(request);
            expect(invokeStub).toHaveBeenCalledWith(request);
        });

        it("invalidates an incorrect body", async () => {
            const klass = new Klass();
            proxyEvent.body = JSON.stringify({ age: "oops", name: "yo", stuff: "hello" });
            await expect(klass.invoke(new Request(proxyEvent as any))).rejects.toBeInstanceOf(ApiValidationError);
            expect(invokeStub).not.toHaveBeenCalled();
        });
    });
});
