/**
 *  Returns an value from the environment based on the name
 *
 * @param name the environment value name/key
 */
export const getEnv = (name: string): string => {
    return process.env[name];
};
