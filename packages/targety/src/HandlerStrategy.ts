import { Context } from "./common/interfaces";

export interface HandlerStrategy<T, O> {
    handle(input: T, context: Context): Promise<O>;
}
