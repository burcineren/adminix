import type { UISchema } from "./types";

/**
 * A persistent cache for inferred resource schemas using localStorage.
 * This ensures that zero-config analysis results are saved across refreshes,
 * making the experience feel instantaneous on subsequent visits.
 */
class SchemaRegistry {
    private cache = new Map<string, UISchema>();
    private readonly STORAGE_KEY = "zeroadmin_schema_cache";

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.entries(parsed).forEach(([key, value]) => {
                    this.cache.set(key, value as UISchema);
                });
            }
        } catch (e) {
            console.error("Failed to load schema cache from localStorage", e);
        }
    }

    private saveToStorage() {
        try {
            const obj = Object.fromEntries(this.cache.entries());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
        } catch (e) {
            console.warn("Failed to save schema cache to localStorage (quota exceeded?)", e);
        }
    }

    /**
     * Get a cached schema for a resource.
     */
    get(resourceName: string): UISchema | undefined {
        return this.cache.get(resourceName);
    }

    /**
     * Cache a newly generated schema.
     */
    set(resourceName: string, schema: UISchema): void {
        this.cache.set(resourceName, schema);
        this.saveToStorage();
    }

    /**
     * Clear the cache for a specific resource.
     */
    delete(resourceName: string): void {
        this.cache.delete(resourceName);
        this.saveToStorage();
    }

    /**
     * Clear the cache.
     */
    clear(): void {
        this.cache.clear();
        localStorage.removeItem(this.STORAGE_KEY);
    }

    /**
     * Check if a resource has an inferred schema cached.
     */
    has(resourceName: string): boolean {
        return this.cache.has(resourceName);
    }
}

export const schemaRegistry = new SchemaRegistry();
