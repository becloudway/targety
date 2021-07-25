import { classDecorator, methodDecorator } from "../../utils/DecoratorHelper";

export interface CorsMetaData {
    ExposedHeaders: string[];
    AllowHeaders: string[];
    AllowCredentials: boolean;
}

export const CORS = (config: Partial<CorsMetaData>): MethodDecorator => methodDecorator(config);

export const DefaultCORS = (config: CorsMetaData): ClassDecorator => classDecorator(config);
