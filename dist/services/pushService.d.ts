import webpush from "web-push";
import { Server } from "socket.io";
export declare function setSocket(io: Server): void;
export declare function getSocket(): Server | null;
export declare function sendPushNotification(subscription: webpush.PushSubscription, payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
}): Promise<boolean>;
//# sourceMappingURL=pushService.d.ts.map