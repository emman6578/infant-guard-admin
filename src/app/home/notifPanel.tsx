import React from "react";
import { NotificationType } from "./page"; // Or from shared types

interface NotificationsProps {
  notifications: NotificationType[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  const seenTitles = new Set<string>();
  const uniqueNotifications =
    notifications?.filter((notification) => {
      if (seenTitles.has(notification.title)) return false;
      seenTitles.add(notification.title);
      return true;
    }) || [];

  return (
    <section className="bg-[#f4faff] shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-bold text-[#474747] mb-5 border-b border-[#accbff] pb-2">
        Activity Log
      </h2>
      <div className="space-y-4">
        {uniqueNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-[#dbedff] rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-[#3d3d3d]">
                {notification.title}
              </h3>
              <span className="text-sm text-[#8993ff]">
                {new Date(notification.created).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-[#333]">{notification.body}</p>
            {/* Uncomment below if needed */}
            {/* <p className="mt-1 text-sm text-[#8993ff]">
              Parent: {notification?.parent?.fullname}
            </p> */}
          </div>
        ))}
      </div>
    </section>
  );
}
