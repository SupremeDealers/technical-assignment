import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  Notification,
} from "../../api/client";
import { Button } from "../../components/Button";
import { FiUser, FiCheckCircle, FiMessageSquare, FiClock, FiAtSign, FiBell, FiBellOff } from "react-icons/fi";
import "./Notifications.css";

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(token!),
    enabled: !!token && isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(token!, notificationId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getNotificationIcon = (type: Notification["type"]) => {
    const icons: Record<string, React.ReactElement> = {
      task_assigned: <FiUser />,
      task_completed: <FiCheckCircle />,
      comment_added: <FiMessageSquare />,
      due_date_reminder: <FiClock />,
      mentioned: <FiAtSign />,
    };
    return icons[type] || <FiBell />;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  return (
    <div className="notifications-panel">
      <div className="notifications-overlay" onClick={onClose} />
      <div className="notifications-content">
        <div className="notifications-header">
          <h3>
            <FiBell /> Notifications
            {unreadCount > 0 && (
              <span className="notifications-badge">{unreadCount}</span>
            )}
          </h3>
          <div className="notifications-header-actions">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAllReadMutation.mutate()}
                loading={markAllReadMutation.isPending}
              >
                Mark all read
              </Button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="notifications-list">
          {isLoading ? (
            <div className="notifications-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <span className="notifications-empty-icon"><FiBellOff /></span>
              <p>No notifications</p>
              <span className="notifications-empty-hint">You're all caught up!</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? "notification-unread" : ""}`}
                onClick={() => {
                  if (!notification.is_read) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTime(notification.created_at)}</div>
                </div>
                {!notification.is_read && <div className="notification-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Bell Button for Header
export function NotificationBell() {
  const { token } = useAuth();

  const { data } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: () => getNotifications(token!, true),
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = data?.unread_count || 0;

  return (
    <div className="notification-bell">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="notification-bell-badge">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}
