export class ArrayFunctions {
    /** Gets the first element of an array if exists. */
    public static first<T>(array: T[]): T | null {
        return array && array.length ? array[0] : null;
    }
}
