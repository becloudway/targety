import { EVENT, EVENT_TARGET } from "../Constants";
import { EventType } from "../enums/EventType";

export interface EventMappingConfig {
    [EVENT_TARGET]?: string;
    [EVENT]?: EventType;
    metadata?: Record<string, unknown>;
}
