import { Validation } from "targety";

export class TestResponse extends Validation.ValidationClass {
    @Validation.IsString()
    public test: string;

    @Validation.IsString()
    public name: string;
}
