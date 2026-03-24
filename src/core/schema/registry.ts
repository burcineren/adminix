import type { UISchema } from "./types";

/**
 * A simple in-memory cache for inferred resource schemas.
 * This prevents UI jittering when navigating between resources
 * that don't have explicit field definitions.
 */
class SchemaRegistry {
    private cache = new Map<string, UISchema>();

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
    }

    /**
     * Clear the cache (useful for development / hot-reloading).
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Check if a resource has an inferred schema cached.
     */
    has(resourceName: string): boolean {
        return this.cache.has(resourceName);
    }
}

export const schemaRegistry = new SchemaRegistry();
