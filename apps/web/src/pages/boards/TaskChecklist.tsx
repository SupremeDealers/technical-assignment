import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  ChecklistItem,
} from "../../api/client";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import "./TaskChecklist.css";

interface TaskChecklistProps {
  taskId: string;
}

export function TaskChecklist({ taskId }: TaskChecklistProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["checklist", taskId],
    queryFn: () => getChecklistItems(token!, taskId),
    enabled: !!token,
  });

  const addItemMutation = useMutation({
    mutationFn: (content: string) => createChecklistItem(token!, taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", taskId] });
      setNewItem("");
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) =>
      updateChecklistItem(token!, itemId, { is_completed: isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", taskId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, content }: { itemId: string; content: string }) =>
      updateChecklistItem(token!, itemId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", taskId] });
      setEditingId(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deleteChecklistItem(token!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", taskId] });
    },
  });

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addItemMutation.mutate(newItem.trim());
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSaveEdit = (itemId: string) => {
    if (!editContent.trim()) return;
    updateItemMutation.mutate({ itemId, content: editContent.trim() });
  };

  const items = data?.items || [];
  const completedCount = items.filter((item) => item.is_completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (isLoading) {
    return <div className="checklist-loading">Loading checklist...</div>;
  }

  return (
    <div className="task-checklist">
      <div className="checklist-header">
        <h4>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Checklist
        </h4>
        {items.length > 0 && (
          <span className="checklist-progress-text">
            {completedCount}/{items.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="checklist-progress">
          <div className="checklist-progress-bar">
            <div
              className="checklist-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="checklist-items">
        {items.map((item) => (
          <div
            key={item.id}
            className={`checklist-item ${item.is_completed ? "checklist-item-completed" : ""}`}
          >
            {editingId === item.id ? (
              <div className="checklist-item-edit">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(item.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                />
                <div className="checklist-item-edit-actions">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(item.id)}
                    loading={updateItemMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <label className="checklist-item-checkbox">
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={(e) =>
                      toggleItemMutation.mutate({
                        itemId: item.id,
                        isCompleted: e.target.checked,
                      })
                    }
                  />
                  <span className="checkmark">
                    {item.is_completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                </label>
                <span
                  className="checklist-item-content"
                  onDoubleClick={() => handleStartEdit(item)}
                >
                  {item.content}
                </span>
                <div className="checklist-item-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleStartEdit(item)}
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="btn-icon btn-icon-danger"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <form className="checklist-add" onSubmit={handleAddItem}>
        <Input
          placeholder="Add an item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Button type="submit" size="sm" loading={addItemMutation.isPending} disabled={!newItem.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
