import { LambdaProxyEvent, Request } from "targety";

import set from "lodash.set";

import { ApiGateWayProxyEvent } from "../fixtures";

/**
 * Returns a dummy event from the ApiGateWayProxyEvent classes
 */
export const getDummyEvent = (input: ApiGateWayProxyEvent.ProxyEventInput): LambdaProxyEvent =>
    ApiGateWayProxyEvent.get(input) as unknown as LambdaProxyEvent;

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
    values: Partial<LambdaProxyEvent>,
    input: ApiGateWayProxyEvent.ProxyEventInput = {},
): LambdaProxyEvent => {
    const event = getDummyEvent(input);

    Object.keys(values).forEach((v) => {
        set(event, v, values[v]);
    });

    return event;
};

/**
 * Create a Request object based on the input values
 * Input values keys are used as paths to set the value of the object
 * lodash set function is used to set these paths and will create them if they don't
 * exist
 *
 * @param values object using lodash (set) paths and values
 * @param input any additional input for the proxy event
 */
export const createTestRequest = (
    values: Partial<LambdaProxyEvent>,
    input: ApiGateWayProxyEvent.ProxyEventInput = {},
): Request => {
    return new Request(createTestEvent(values, input));
};
