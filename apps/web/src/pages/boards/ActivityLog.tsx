import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { getBoardActivities, ActivityWithUser } from "../../api/client";
import { Loading } from "../../components/Loading";
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowRight, 
  FiMessageSquare, 
  FiUser, 
  FiCheckCircle, 
  FiArchive, 
  FiFileText,
  FiClipboard,
  FiInbox
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import "./ActivityLog.css";

interface ActivityLogProps {
  boardId: string;
  taskId?: string; // Optional: filter by task for task-level timeline
  onClose: () => void;
}

export function ActivityLog({ boardId, taskId, onClose }: ActivityLogProps) {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["board-activities", boardId, taskId],
    queryFn: () => getBoardActivities(token!, boardId, { limit: 50, task_id: taskId }),
    enabled: !!token,
  });

  const getActionIcon = (action: ActivityWithUser["action"]) => {
    const icons: Record<string, React.ReactElement> = {
      created: <FiPlus />,
      updated: <FiEdit2 />,
      deleted: <FiTrash2 />,
      moved: <FiArrowRight />,
      commented: <FiMessageSquare />,
      assigned: <FiUser />,
      completed: <FiCheckCircle />,
      archived: <FiArchive />,
    };
    return icons[action] || <FiFileText />;
  };

  const getActionColor = (action: ActivityWithUser["action"]) => {
    const colors: Record<string, string> = {
      created: "action-created",
      updated: "action-updated",
      deleted: "action-deleted",
      moved: "action-moved",
      commented: "action-commented",
      assigned: "action-assigned",
      completed: "action-completed",
      archived: "action-archived",
    };
    return colors[action] || "";
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatActivityMessage = (activity: ActivityWithUser) => {
    const { action, entity_type, entity_name, details, metadata, user } = activity;
    
    // Parse metadata if available
    let meta: Record<string, unknown> = {};
    if (metadata) {
      try {
        meta = JSON.parse(metadata);
      } catch {
        // Ignore parse errors
      }
    }

    switch (action) {
      case "moved":
        if (meta.from_column && meta.to_column) {
          return (
            <>
              <span className="activity-user">{user.name}</span> moved{" "}
              <span className="activity-entity-inline">"{entity_name}"</span> from{" "}
              <span className="activity-column-tag">{meta.from_column as string}</span> →{" "}
              <span className="activity-column-tag">{meta.to_column as string}</span>
            </>
          );
        }
        return (
          <>
            <span className="activity-user">{user.name}</span> moved{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
            {details && <span className="activity-details-inline"> ({details})</span>}
          </>
        );

      case "assigned":
        if (meta.new_assignee) {
          return (
            <>
              <span className="activity-user">{user.name}</span> assigned{" "}
              <span className="activity-entity-inline">"{entity_name}"</span> to{" "}
              <span className="activity-assignee">{meta.new_assignee as string}</span>
            </>
          );
        }
        return (
          <>
            <span className="activity-user">{user.name}</span> unassigned{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      case "completed":
        return (
          <>
            <span className="activity-user">{user.name}</span> completed{" "}
            <span className="activity-entity-inline">"{entity_name}"</span> <HiOutlineSparkles />
          </>
        );

      case "created":
        return (
          <>
            <span className="activity-user">{user.name}</span> created {entity_type}{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      case "updated":
        if (meta.old_title && meta.new_title) {
          return (
            <>
              <span className="activity-user">{user.name}</span> renamed{" "}
              <span className="activity-entity-inline">"{meta.old_title as string}"</span> to{" "}
              <span className="activity-entity-inline">"{meta.new_title as string}"</span>
            </>
          );
        }
        return (
          <>
            <span className="activity-user">{user.name}</span> updated{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      case "commented":
        return (
          <>
            <span className="activity-user">{user.name}</span> commented on{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      case "deleted":
        return (
          <>
            <span className="activity-user">{user.name}</span> deleted {entity_type}{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      case "archived":
        return (
          <>
            <span className="activity-user">{user.name}</span> archived{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );

      default:
        return (
          <>
            <span className="activity-user">{user.name}</span> {action}{" "}
            <span className="activity-entity-inline">"{entity_name}"</span>
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="activity-log">
        <Loading text="Loading activity..." />
      </div>
    );
  }

  const activities = data?.data || [];

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h3><FiClipboard /> Activity Log</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="activity-log-content">
        {activities.length === 0 ? (
          <div className="activity-empty">
            <span className="activity-empty-icon"><FiInbox /></span>
            <p>No activity yet</p>
            <span className="activity-empty-hint">Actions on this board will appear here</span>
          </div>
        ) : (
          <div className="activity-timeline">
            {activities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-avatar">
                  {getInitials(activity.user.name)}
                </div>
                <div className="activity-content">
                  <div className="activity-message">
                    <span className={`activity-icon ${getActionColor(activity.action)}`}>
                      {getActionIcon(activity.action)}
                    </span>
                    {formatActivityMessage(activity)}
                  </div>
                  <div className="activity-time">{formatTime(activity.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
