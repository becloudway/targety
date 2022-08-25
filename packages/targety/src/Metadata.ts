/* eslint-disable @typescript-eslint/ban-types */

/**
 * Class to hold metadata and manipulate it.
 */
export class Metadata {
    private _metadata = new Map<string, Object>();

    /**
     * Sets the data when not found or merges it when their
     * is already data stored for the given key.
     *
     * @remark not deep merging
     *
     * @param key the key to store the data at
     * @param data the data
     */
    public setOrMerge(key: string, data: Object): void {
        const cleanKey = Metadata.formatKey(key);
        if (this.exists(cleanKey)) {
            const existingData = this._metadata.get(cleanKey);
            data = { ...existingData, ...data };
        }

        this._metadata.set(cleanKey, data);
    }

    public remove(key: string): boolean {
        const cleanKey = Metadata.formatKey(key);
        return this._metadata.delete(cleanKey);
    }

    public get<T>(key: string): T {
        const cleanKey = Metadata.formatKey(key);
        return this._metadata.get(cleanKey) as T;
    }

    public set(key: string, data: Object): void {
        const cleanKey = Metadata.formatKey(key);
        this._metadata.set(cleanKey, data);
    }

    public exists(key: string): boolean {
        const cleanKey = Metadata.formatKey(key);
        return this._metadata.has(cleanKey);
    }

    /**
     * Returns the keys of the given Metadata map.
     */
    public keys(): String[] {
        return Array.from(this._metadata.keys());
    }

    public get metadata(): Map<string, Object> {
        return this.metadata;
    }

    public static formatKey(key: string): string {
        return key.trim().toLowerCase();
    }
}
