import { URL } from "url";
import yn from "yn";

/**
 * Returns true if localhost is allowed for the current environment
 *
 * @env_variable ALLOW_LOCALHOST
 */
export const isLocalhostAllowed = () => {
    const { ALLOW_LOCALHOST } = process.env;
    return yn(ALLOW_LOCALHOST);
};

/**
 * Returns true if the given url is a localhost url
 * @param urlString a string to test
 */
export const isLocalHost = (urlString: string) => {
    if (!urlString) return false;
    return !!new URL(urlString).hostname?.includes("localhost");
};

/**
 * Strips the path from an url
 * @param urlString a string to turn into a localhost url without path
 */
export const stripPathFromUrl = (urlString: string) => {
    const url = new URL(urlString);

    url.pathname = "";
    url.search = "";

    const stringUrl = url.toString();
    if (stringUrl.endsWith("/")) return stringUrl.slice(0, stringUrl.length - 1);
    return url.toString();
};
