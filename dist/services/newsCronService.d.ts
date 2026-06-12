export declare function warmUpCache(): Promise<void>;
export declare function startNewsCronJob(): void;
declare function fetchAllRSSFeeds(): Promise<void>;
export declare function fetchAllRedditFeeds(): Promise<void>;
export declare function fetchMediaStack(category: string): Promise<void>;
export declare function fetchNewsData(category: string): Promise<void>;
export declare function fetchAllNewsNow(): Promise<void>;
export { fetchAllRedditFeeds as fetchRedditNews };
export { fetchAllRSSFeeds as fetchRSSFeeds };
//# sourceMappingURL=newsCronService.d.ts.map