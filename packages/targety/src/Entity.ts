export interface EntityConfig<T> {
    metaData?: T;
}

export class Entity {
    public constructor(protected config: EntityConfig<unknown>) {}

    public getMetaData<T>(): T | undefined {
        return this.config.metaData as T | undefined;
    }
}
