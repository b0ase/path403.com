/**
 * Utility for sending browser desktop notifications
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (!("Notification" in window)) {
        console.error("This browser does not support desktop notifications.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined') return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        new Notification(title, options);
    }
};
