export declare function createNotification(data: {
    recipientId: string;
    senderId?: string;
    type: string;
    title?: string;
    message?: string;
    link?: string;
    postId?: string;
    commentId?: string;
    articleId?: string;
    image?: string;
}): Promise<any>;
export declare function createBulkNotifications(userIds: string[], data: {
    type: string;
    title?: string;
    message?: string;
    link?: string;
    articleId?: string;
    image?: string;
}): Promise<number>;
//# sourceMappingURL=notificationService.d.ts.map