import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskComments, addTaskComment } from "../api/comments";
import { updateTask, deleteTask } from "../api/tasks";
import { getBoards, getBoardColumns } from "../api/boards";
import { useAuth } from "../hooks/useAuth";
import { TaskModalProps } from "./uiTypes";


export function TaskModal({ task, onClose }: TaskModalProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const { user } = useAuth();

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const { data: columns } = useQuery({
    queryKey: ["columns", boards?.[0]?.id],
    queryFn: () => getBoardColumns(boards![0].id),
    enabled: !!boards?.[0]?.id,
  });

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", task.id],
    queryFn: () => getTaskComments(task.id),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => updateTask(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => addTaskComment(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", task.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewComment("");
    },
  });

  const handleTitleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaskMutation.mutate({ title: editedTitle });
  };

  const handleColumnChange = (columnId: string) => {
    updateTaskMutation.mutate({ columnId });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100
    }}>
      <div className="auth-card" style={{ maxWidth: "600px", width: "95%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          {isEditing ? (
            <form onSubmit={handleTitleUpdate} style={{ flexGrow: 1, marginRight: "1rem" }}>
              <input 
                className="form-input" 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)}
                autoFocus
              />
            </form>
          ) : (
            <h2 style={{ fontSize: "1.25rem" }} onClick={() => setIsEditing(true)}>{task.title}</h2>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={{ marginBottom: "0.5rem" }}>Column</label>
            <select 
              className="form-input" 
              value={task.columnId}
              onChange={(e) => handleColumnChange(e.target.value)}
            >
              {columns?.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button 
              onClick={() => { if(confirm("Are you sure?")) deleteMutation.mutate() }}
              style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
            >
              Delete Task
            </button>
          </div>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Comments</h3>
          
          {commentsLoading ? (
            <div>Loading comments...</div>
          ) : (
            <div>
              {comments?.map((comment) => (
                <div key={comment.id} style={{ marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                    <strong>{comment.user.email}</strong>
                    <span>{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ fontSize: "0.875rem" }}>{comment.content}</p>
                </div>
              ))}
              {comments?.length === 0 && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>No comments yet.</p>}
            </div>
          )}
        </div>

        <form onSubmit={handleCommentSubmit}>
          <textarea
            className="form-input"
            style={{ minHeight: "80px", marginBottom: "0.75rem", resize: "vertical" }}
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" className="btn" disabled={addCommentMutation.isPending}>
            {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
