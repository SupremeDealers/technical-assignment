import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskComments, addTaskComment } from "../api/comments";
import { updateTask, deleteTask, createTask } from "../api/tasks";
import { getBoards, getBoardColumns } from "../api/boards";
import { useAuth } from "../hooks/useAuth";
import { Task, User } from "../api/apiTypes";
import { apiFetch } from "../api/client";

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  initialColumnId?: string;
}

export function TaskModal({ task, onClose, initialColumnId }: TaskModalProps) {
  const isEditing = !!task;
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(task?.priority || "MEDIUM");
  const [columnId, setColumnId] = useState(task?.columnId || initialColumnId || "");
  const [userId, setUserId] = useState(task?.userId || "");
  const [newComment, setNewComment] = useState("");

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const { data: columns } = useQuery({
    queryKey: ["columns", boards?.[0]?.id],
    queryFn: () => getBoardColumns(boards![0].id),
    enabled: !!boards?.[0]?.id,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => apiFetch("/auth/users"),
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task?.id],
    queryFn: () => getTaskComments(task!.id),
    enabled: !!task?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return updateTask(task!.id, data);
      } else {
        return createTask(columnId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => addTaskComment(task!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task!.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewComment("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      title, 
      description, 
      priority, 
      columnId, 
      userId: userId === "" ? null : userId 
    };
    saveMutation.mutate(data);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Just now";
      return date.toLocaleString();
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
            {isEditing ? `Edit Task` : "Add New Task"}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ fontSize: "1.5rem", padding: "0 0.5rem" }}>&times;</button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Task Title</label>
            <input 
              className="form-input" 
              placeholder="e.g. Design new landing page"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Description</label>
            <textarea 
              className="form-textarea" 
              placeholder="Add more details about this task..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Status</label>
              <select className="form-select" value={columnId} onChange={e => setColumnId(e.target.value)}>
                {columns?.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value as any)}>
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Assign To</label>
            <select className="form-select" value={userId} onChange={e => setUserId(e.target.value)}>
              <option value="">Unassigned</option>
              {users?.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {isEditing ? (
              <button 
                type="button" 
                className="btn" 
                style={{ background: "#fee2e2", color: "#b91c1c" }}
                onClick={() => { if(confirm("Delete this task?")) deleteMutation.mutate() }}
              >
                Delete Task
              </button>
            ) : <div />}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Task")}
              </button>
            </div>
          </div>
        </form>

        {isEditing && (
          <div className="comments-section">
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Comments</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "1.5rem" }}>
              {commentsLoading ? <div>Loading...</div> : (
                <>
                  {comments?.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user.email}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                    </div>
                  ))}
                  {comments?.length === 0 && <p className="comment-text" style={{ color: "var(--text-muted)" }}>No comments yet.</p>}
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <input className="form-input" style={{ marginBottom: 0 }} placeholder="Write a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} />
              <button className="btn btn-primary" onClick={() => { if(newComment.trim()) addCommentMutation.mutate(newComment) }}>Post</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
