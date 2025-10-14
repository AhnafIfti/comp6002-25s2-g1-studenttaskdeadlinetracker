// src/components/NotificationSidebar.tsx
import React from "react";
import { useSocket } from "../context/SocketContext";

const NotificationSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markRead, clearAll } = useSocket();

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        height: "100vh",
        width: 360,
        maxWidth: "95vw",
        background: "#fff",
        boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
        zIndex: 1000,
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div style={{ display: "block", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Notifications</h3>
        <div>
          <button onClick={() => clearAll()} style={{ marginRight: 8 }}>
            Clear All
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {notifications.length === 0 && <p>No notifications</p>}

        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              borderBottom: "1px solid #eee",
              padding: "10px 0",
              background: n.read ? "transparent" : "#f7fbff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{n.title}</strong>
              <small style={{ color: "#666" }}>{new Date(n.dueAt).toLocaleString()}</small>
            </div>
            {n.message && <div style={{ marginTop: 6 }}>{n.message}</div>}
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {!n.read && (
                <button onClick={() => markRead(n.id)} style={{ padding: "6px 8px" }}>
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSidebar;
