import { Validation } from "targety";

export class UserIdRequest extends Validation.ValidationClass {
    @Validation.IsString()
    @Validation.Transform(({ value }) => value.toUpperCase())
    public userId: string;
}
