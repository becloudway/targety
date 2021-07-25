import { Validation } from "targety";

export class TestRequest extends Validation.ValidationClass {
    @Validation.IsOptional()
    @Validation.IsString()
    public input: string;
}
