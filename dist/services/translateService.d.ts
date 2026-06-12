export declare function translateArticle(articleId: string, title: string, excerpt: string, sourceLang?: string): Promise<Record<string, {
    title: string;
    excerpt: string;
}>>;
export declare function getTranslatedArticle(article: any, targetLang: string): {
    title: string;
    excerpt: string;
};
//# sourceMappingURL=translateService.d.ts.map