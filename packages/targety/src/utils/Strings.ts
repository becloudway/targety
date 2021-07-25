export class Strings {
    /** Converts a specified by char separated string into a trimmed list */
    public static toList(commaSeparatedList: string, separator = ","): string[] {
        return commaSeparatedList.split(separator).map((p) => p.trim());
    }

    /**
     * Converts space separated words into a lowercase snake case string
     * @example "Test This Is" => "test_this_is"
     */
    public static makeLowerSnakeCase(s: string): string {
        return s.replace(/\s/g, "_").toLowerCase();
    }

    /**
     * Encodes a payload of type T to "base64"
     * @param payload Payload type
     */
    public static encode<T>(payload: T): string {
        if (!payload) {
            return "";
        }
        const payloadString: string = (typeof payload === "string" ? payload : JSON.stringify(payload)) as string;
        return Buffer.from(payloadString, "utf8").toString("base64");
    }

    /**
     * Decodes a base64 encoded string to a payload of type T
     * @param encoded Payload type
     * @throws {Error} Failure to parse payload to JSON object
     */
    public static decode<T>(encoded: string): T {
        if (!encoded) {
            return null;
        }
        const decoded: string = Buffer.from(encoded, "base64").toString("utf8");
        try {
            const payload: T = JSON.parse(decoded) as T;
            return payload;
        } catch (e) {
            throw new Error("Failed parsing payload");
        }
    }

    /**
     * Checks if a given string is defined or empty
     * @param s string to check
     */
    public static isBlankOrEmpty(s: string): boolean {
        return !s || s.trim() === "";
    }

    /**
     * Checks if two strings match when trimmed and set to upper case.
     */
    public static equalsTrimmedCaseInsensitive(actual: string, check: string): boolean {
        return actual.trim().toUpperCase() === check.trim().toUpperCase();
    }
}
