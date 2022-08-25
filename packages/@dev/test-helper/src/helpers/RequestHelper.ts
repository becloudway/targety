import set from "lodash.set";

import { ApiGateWayProxyEvent } from "../fixtures";

/**
 * Returns a dummy event from the ApiGateWayProxyEvent classes
 */
export const getDummyEvent = (input: ApiGateWayProxyEvent.ProxyEventInput): unknown =>
    ApiGateWayProxyEvent.get(input) as unknown as unknown;

/**
 * Create an event object based on the input values
 * Input values keys are used as paths to set the value of the object
 * lodashs's set function is used to set these paths and will create them if they don't
 * exist
 *
 * @param values object using lodash (set) paths and values
 * @param input any additional input for the proxy event
 */
export const createTestEvent = (
    values: Partial<unknown>,
    input: ApiGateWayProxyEvent.ProxyEventInput = {},
): unknown => {
    const event = getDummyEvent(input);

    Object.keys(values).forEach((v) => {
        set(event as any, v, values[v]);
    });

    return event;
};
