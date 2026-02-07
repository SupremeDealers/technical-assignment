import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { getBoardAnalytics } from "../../api/client";
import { Loading } from "../../components/Loading";
import { 
  FiBarChart2, 
  FiClipboard, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiTarget, 
  FiClock, 
  FiTrendingUp,
  FiPieChart,
  FiUsers
} from "react-icons/fi";
import "./BoardAnalytics.css";

interface BoardAnalyticsProps {
  boardId: string;
  onClose: () => void;
}

export function BoardAnalyticsPanel({ boardId, onClose }: BoardAnalyticsProps) {
  const { token } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["board-analytics", boardId],
    queryFn: () => getBoardAnalytics(token!, boardId),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="analytics-panel">
        <Loading text="Loading analytics..." />
      </div>
    );
  }

  const analytics = data?.analytics;

  if (!analytics) {
    return (
      <div className="analytics-panel">
        <p>Unable to load analytics</p>
      </div>
    );
  }

  const completionRate = analytics.total_tasks > 0 
    ? Math.round((analytics.completed_tasks / analytics.total_tasks) * 100) 
    : 0;

  return (
    <div className="analytics-panel">
      <div className="analytics-header">
        <h3><FiBarChart2 /> Board Analytics</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="analytics-content">
        {/* Summary Cards */}
        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-icon"><FiClipboard /></div>
            <div className="summary-data">
              <span className="summary-value">{analytics.total_tasks}</span>
              <span className="summary-label">Total Tasks</span>
            </div>
          </div>
          <div className="summary-card summary-success">
            <div className="summary-icon"><FiCheckCircle /></div>
            <div className="summary-data">
              <span className="summary-value">{analytics.completed_tasks}</span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
          <div className="summary-card summary-warning">
            <div className="summary-icon"><FiAlertTriangle /></div>
            <div className="summary-data">
              <span className="summary-value">{analytics.overdue_tasks}</span>
              <span className="summary-label">Overdue</span>
            </div>
          </div>
          <div className="summary-card summary-info">
            <div className="summary-icon"><FiTarget /></div>
            <div className="summary-data">
              <span className="summary-value">{completionRate}%</span>
              <span className="summary-label">Completion Rate</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="analytics-progress">
          <h4>Overall Progress</h4>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className="progress-text">{completionRate}% complete</span>
        </div>

        {/* Tasks by Status */}
        <div className="analytics-section">
          <h4>Tasks by Status</h4>
          <div className="status-bars">
            <div className="status-bar-item">
              <span className="status-label">To Do</span>
              <div className="status-bar">
                <div 
                  className="status-bar-fill status-todo" 
                  style={{ width: `${analytics.total_tasks > 0 ? (analytics.tasks_by_status.todo / analytics.total_tasks) * 100 : 0}%` }}
                />
              </div>
              <span className="status-count">{analytics.tasks_by_status.todo}</span>
            </div>
            <div className="status-bar-item">
              <span className="status-label">In Progress</span>
              <div className="status-bar">
                <div 
                  className="status-bar-fill status-progress" 
                  style={{ width: `${analytics.total_tasks > 0 ? (analytics.tasks_by_status.in_progress / analytics.total_tasks) * 100 : 0}%` }}
                />
              </div>
              <span className="status-count">{analytics.tasks_by_status.in_progress}</span>
            </div>
            <div className="status-bar-item">
              <span className="status-label">Completed</span>
              <div className="status-bar">
                <div 
                  className="status-bar-fill status-completed" 
                  style={{ width: `${analytics.total_tasks > 0 ? (analytics.tasks_by_status.completed / analytics.total_tasks) * 100 : 0}%` }}
                />
              </div>
              <span className="status-count">{analytics.tasks_by_status.completed}</span>
            </div>
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="analytics-section">
          <h4>Tasks by Priority</h4>
          <div className="priority-pills">
            <div className="priority-pill priority-high">
              <span className="priority-dot" />
              High: {analytics.tasks_by_priority.high}
            </div>
            <div className="priority-pill priority-medium">
              <span className="priority-dot" />
              Medium: {analytics.tasks_by_priority.medium}
            </div>
            <div className="priority-pill priority-low">
              <span className="priority-dot" />
              Low: {analytics.tasks_by_priority.low}
            </div>
          </div>
        </div>

        {/* Average Completion Time */}
        {analytics.avg_completion_time_days !== null && (
          <div className="analytics-section">
            <h4><FiClock /> Average Completion Time</h4>
            <div className="completion-time">
              <span className="time-value">{analytics.avg_completion_time_days}</span>
              <span className="time-unit">days</span>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="analytics-section">
          <h4><FiTrendingUp /> Recent Activity (7 days)</h4>
          <div className="activity-count">
            <span className="activity-value">{analytics.recent_activity_count}</span>
            <span className="activity-label">actions recorded</span>
          </div>
        </div>

        {/* Member Stats */}
        {analytics.member_stats.length > 0 && (
          <div className="analytics-section">
            <h4><FiUsers /> Team Performance</h4>
            <div className="member-stats">
              {analytics.member_stats.map((member) => (
                <div key={member.user_id} className="member-stat-row">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.user_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <span className="member-name">{member.user_name}</span>
                  </div>
                  <div className="member-tasks">
                    <span className="assigned">{member.assigned_tasks} assigned</span>
                    <span className="completed">{member.completed_tasks} done</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Column Distribution */}
        <div className="analytics-section">
          <h4><FiPieChart /> Distribution by Column</h4>
          <div className="column-distribution">
            {analytics.tasks_by_column.map((col) => (
              <div key={col.column_id} className="column-stat">
                <span className="column-name">{col.column_name}</span>
                <span className="column-count">{col.task_count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
