import React from "react";
import { NotificationType } from "./page"; // Or import from your shared types file

interface NotificationsProps {
  notifications: NotificationType[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  // Use a Set to track unique creation timestamps
  const seenCreated = new Set<string>();
  const uniqueNotifications =
    notifications?.filter((notification) => {
      if (seenCreated.has(notification.title)) {
        return false;
      }
      seenCreated.add(notification.title);
      return true;
    }) || [];

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Activity Log</h2>
      <div className="space-y-4">
        {uniqueNotifications.map((notification) => (
          <div key={notification.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {notification.title}
              </h3>
              <span className="text-sm text-gray-500">
                {new Date(notification.created).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{notification.body}</p>
            <p className="mt-1 text-sm text-gray-600">
              {/* Parent: {notification?.parent?.fullname} */}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
