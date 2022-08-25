export interface TargetConfig {
    name: string;
    metaData?: unknown;
}

export class Target<T extends TargetConfig> {
    public constructor(protected config: T) {}

    public get name(): string {
        return this.config.name;
    }

    public getMetaData<T>(): T {
        return (this.config.metaData || {}) as T;
    }
}
