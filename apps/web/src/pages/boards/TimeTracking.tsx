import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTimeEntries,
  createTimeEntry,
  deleteTimeEntry,
} from "../../api/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./TimeTracking.css";

interface TimeTrackingProps {
  taskId: string;
}

export function TimeTracking({ taskId }: TimeTrackingProps) {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["time-entries", taskId],
    queryFn: () => getTimeEntries(token!, taskId),
    enabled: !!token,
  });

  const addEntryMutation = useMutation({
    mutationFn: (data: { description?: string; started_at: string; duration_minutes: number }) =>
      createTimeEntry(token!, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", taskId] });
      setShowForm(false);
      setHours("");
      setMinutes("");
      setDescription("");
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => deleteTimeEntry(token!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-entries", taskId] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;

    if (totalMinutes <= 0) return;

    addEntryMutation.mutate({
      description: description || undefined,
      started_at: new Date().toISOString(),
      duration_minutes: totalMinutes,
    });
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const entries = data?.entries || [];
  const totalMinutes = data?.total_minutes || 0;

  return (
    <div className="time-tracking">
      <div className="time-tracking-header">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Time Tracking
        </h4>
        <div className="time-tracking-total">
          <span className="total-label">Total:</span>
          <span className="total-value">{formatDuration(totalMinutes)}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="time-loading">Loading time entries...</div>
      ) : (
        <>
          {entries.length > 0 && (
            <div className="time-entries">
              {entries.map((entry) => (
                <div key={entry.id} className="time-entry">
                  <div className="time-entry-main">
                    <div className="time-entry-user">
                      <div className="time-entry-avatar">
                        {entry.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span className="time-entry-name">{entry.user.name}</span>
                    </div>
                    <div className="time-entry-duration">
                      {entry.duration_minutes ? formatDuration(entry.duration_minutes) : "Running..."}
                    </div>
                  </div>
                  {entry.description && (
                    <div className="time-entry-description">{entry.description}</div>
                  )}
                  <div className="time-entry-footer">
                    <span className="time-entry-date">{formatDate(entry.started_at)}</span>
                    {entry.user_id === user?.id && (
                      <button
                        className="btn-icon btn-icon-danger btn-icon-sm"
                        onClick={() => deleteEntryMutation.mutate(entry.id)}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <form className="time-form" onSubmit={handleSubmit}>
              <div className="time-form-inputs">
                <div className="time-form-duration">
                  <div className="time-input-group">
                    <Input
                      type="number"
                      min="0"
                      max="999"
                      placeholder="0"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                    <span>h</span>
                  </div>
                  <div className="time-input-group">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                    />
                    <span>m</span>
                  </div>
                </div>
                <Input
                  placeholder="What did you work on? (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="time-form-actions">
                <Button type="submit" size="sm" loading={addEntryMutation.isPending}>
                  Log Time
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="time-add-btn"
              onClick={() => setShowForm(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Log time
            </Button>
          )}
        </>
      )}
    </div>
  );
}
