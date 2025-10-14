// src/components/NotificationBell.tsx
import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import NotificationSidebar from "./NotificationSidebar";

const NotificationBell: React.FC = () => {
  const { unreadCount } = useSocket();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={{ position: "relative", display: "inline-block", marginLeft: "20px" }}>
        <button
          aria-label="Notifications"
          onClick={() => setOpen((s) => !s)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            position: "relative",
          }}
        >
          🔔
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: 12,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && <NotificationSidebar onClose={() => setOpen(false)} />}
    </>
  );
};

export default NotificationBell;
