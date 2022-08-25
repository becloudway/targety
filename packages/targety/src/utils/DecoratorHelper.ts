import { CLASS_METADATA, ROUTES_METADATA } from "../common/Constants";

/**
 * Creates a class decorator decorator function that is able to reflect certain data.
 *
 * @param input the data to be reflected
 */
export const classDecorator = (input: any) => (target: any) => {
    const metadata = Reflect.getMetadata(CLASS_METADATA, target) || {};
    const newMetadata = {
        ...input,
        ...(metadata || {}),
    };
    Reflect.defineMetadata(CLASS_METADATA, newMetadata, target);
};

/**
 * Creates a method decorator decorator function that is able to reflect certain data.
 *
 * @param input the data to be reflected
 */
export const methodDecorator = (input: any) => (target, key, descriptor: PropertyDescriptor) => {
    const routes = Reflect.getMetadata(ROUTES_METADATA, target) || {};
    routes[key] = {
        ...input,
        ...(routes[key] || {}),
    };
    Reflect.defineMetadata(ROUTES_METADATA, routes, target);
    return descriptor;
};
