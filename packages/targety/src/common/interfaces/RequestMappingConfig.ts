import { RequestMethod } from "../enums/RequestMethod";

export interface RequestMappingConfig {
    path?: string | string[];
    method?: RequestMethod;
}
