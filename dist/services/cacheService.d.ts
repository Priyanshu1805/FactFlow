export declare function getCached(key: string): Promise<any | null>;
export declare function setCached(key: string, data: any, ttl?: number): Promise<void>;
export declare function invalidateSection(section: string): Promise<void>;
export declare function invalidateAll(): Promise<void>;
//# sourceMappingURL=cacheService.d.ts.map