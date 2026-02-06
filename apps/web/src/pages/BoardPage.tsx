import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { boardAPI, taskAPI, commentAPI, type Board, type Column, type Task, type Comment, type TaskResponse } from "../api/client";
import { useAuth } from "../auth/context";
import { useParams, Link } from "react-router-dom";
import { Plus, Search, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

export function BoardPage() {
  const { boardId = "1" } = useParams();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("medium");
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [pagination, setPagination] = useState<Record<number, { page: number; limit: number; totalPages: number }>>({});

  const boardIdNum = parseInt(boardId);

  const { data: board, isLoading: boardLoading } = useQuery({
    queryKey: ["board", boardIdNum],
    queryFn: () => boardAPI.getBoard(boardIdNum),
  });

  const { data: columns, isLoading: columnsLoading } = useQuery({
    queryKey: ["columns", boardIdNum],
    queryFn: () => boardAPI.getColumns(boardIdNum),
  });

  const [tasks, setTasks] = useState<Record<number, Task[]>>({});

  // Fetch tasks for each column
  React.useEffect(() => {
    if (columns) {
      columns.forEach(async (column) => {
        try {
          const response = await taskAPI.getTasks(column.id, {
            search: searchQuery,
            page: pagination[column.id]?.page || 1,
            limit: pagination[column.id]?.limit || 5,
          });
          setTasks((prev) => ({
            ...prev,
            [column.id]: response.tasks,
          }));
          // Only set pagination if it hasn't been initialized yet
          setPagination((prev) => {
            if (!prev[column.id]) {
              return {
                ...prev,
                [column.id]: {
                  page: response.page,
                  limit: response.limit,
                  totalPages: response.totalPages,
                },
              };
            }
            return prev;
          });
        } catch (error) {
          console.error(`Failed to fetch tasks for column ${column.id}`, error);
        }
      });
    }
  }, [columns, searchQuery]);

  // Fetch tasks when pagination changes for a specific column
  const handlePageChange = async (columnId: number, newPage: number) => {
    try {
      const response = await taskAPI.getTasks(columnId, {
        search: searchQuery,
        page: newPage,
        limit: pagination[columnId]?.limit || 5,
      });
      setTasks((prev) => ({
        ...prev,
        [columnId]: response.tasks,
      }));
      setPagination((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          page: newPage,
          totalPages: response.totalPages,
        },
      }));
    } catch (error) {
      console.error(`Failed to fetch tasks for column ${columnId}`, error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    fetchComments(task.id);
  };

  const handleAddTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setIsAddTaskModalOpen(true);
  };

  const handleCloseAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setSelectedColumnId(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
  };

  const handleEditTask = (task: Task) => {
    setEditTaskId(task.id);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");
    setNewTaskPriority(task.priority);
    setIsEditTaskModalOpen(true);
  };

  const handleCloseEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
    setEditTaskId(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
  };

  const fetchComments = async (taskId: number) => {
    try {
      const taskComments = await commentAPI.getComments(taskId);
      setComments(taskComments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedTask) return;

    try {
      const newComment = await commentAPI.createComment(selectedTask.id, newCommentText.trim());
      setComments((prev) => [...prev, newComment]);
      setNewCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskAPI.deleteTask(taskId);

      // Update local state
      setTasks((prev) => {
        const newTasks = { ...prev };
        // Remove task from all columns
        Object.keys(newTasks).forEach((columnId) => {
          newTasks[parseInt(columnId)] = newTasks[parseInt(columnId)].filter(t => t.id !== taskId);
        });
        return newTasks;
      });

      // Close task modal if open
      if (selectedTask?.id === taskId) {
        handleCloseTaskModal();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleSubmitEditTask = async () => {
    if (!newTaskTitle.trim() || !editTaskId) return;

    try {
      const updatedTask = await taskAPI.updateTask(editTaskId, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
      });

      // Update local state
      setTasks((prev) => {
        const newTasks = { ...prev };
        // Find and update the task in all columns
        Object.keys(newTasks).forEach((columnId) => {
          const columnTasks = newTasks[parseInt(columnId)];
          const taskIndex = columnTasks.findIndex(t => t.id === editTaskId);
          if (taskIndex !== -1) {
            newTasks[parseInt(columnId)][taskIndex] = updatedTask;
          }
        });
        return newTasks;
      });

      handleCloseEditTaskModal();
    } catch (error) {
      console.error("Failed to edit task:", error);
    }
  };

  const handleSubmitAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedColumnId) return;

    try {
      const newTask = await taskAPI.createTask(selectedColumnId, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        priority: newTaskPriority,
      });

      setTasks((prev) => ({
        ...prev,
        [selectedColumnId]: [...(prev[selectedColumnId] || []), newTask],
      }));

      handleCloseAddTaskModal();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData("task", JSON.stringify(task));
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();

    try {
      const taskData = JSON.parse(e.dataTransfer.getData("task"));
      const task: Task = taskData;

      if (task.columnId === targetColumnId) return;

      // Update task column in API
      await taskAPI.updateTask(task.id, { columnId: targetColumnId });

      // Refresh tasks for both source and target columns to update pagination
      await Promise.all([
        handlePageChange(task.columnId, 1), // Refresh source column from page 1
        handlePageChange(targetColumnId, 1), // Refresh target column from page 1
      ]);
    } catch (error) {
      console.error("Failed to move task:", error);
    }
  };

  const handleCloseTaskModal = () => {
    setSelectedTask(null);
  };

  if (boardLoading || columnsLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ 
          fontSize: '24px', 
          color: '#64748b',
          fontWeight: '500'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0
            }}>
              {board?.name}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#f1f5f9',
              minWidth: '300px'
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ 
                  border: 'none',
                  background: 'transparent',
                  fontSize: '14px',
                  color: '#1e293b',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px',
              borderRadius: '8px',
              background: '#f1f5f9'
            }}>
              <span style={{ 
                fontSize: '14px',
                color: '#475569',
                fontWeight: '500'
              }}>
                {user?.name}
              </span>
              <button
                onClick={logout}
                style={{ 
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          minHeight: 'calc(100vh - 160px)'
        }}>
          {columns?.map((column) => (
            <div
              key={column.id}
              style={{ 
                background: '#f1f5f9',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {column.name}
                  </h2>
                  <span style={{ 
                    background: '#3b82f6',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {tasks[column.id]?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => handleAddTask(column.id)}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#64748b',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Add task"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div 
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                  flex: 1
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {tasks[column.id]?.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    style={{ 
                      background: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.1s, box-shadow 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '500',
                      color: '#1e293b',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ flex: 1 }}>{task.title}</span>
                      <span style={{ 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: task.priority === 'high' ? '#fee2e2' : 
                                        task.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                        color: task.priority === 'high' ? '#991b1b' : 
                               task.priority === 'medium' ? '#92400e' : '#065f46'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <div style={{ 
                        fontSize: '14px',
                        color: '#64748b',
                        lineHeight: '1.5',
                        marginBottom: '8px'
                      }}>
                        {task.description}
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '12px',
                      color: '#94a3b8',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
               </div>
               
               {/* Pagination Controls */}
               {pagination[column.id] && pagination[column.id].totalPages > 1 && (
                 <div style={{ 
                   display: 'flex',
                   justifyContent: 'center',
                   alignItems: 'center',
                   gap: '8px',
                   padding: '12px 0',
                 }}>
                    <button
                      onClick={() => handlePageChange(column.id, pagination[column.id].page - 1)}
                      disabled={pagination[column.id].page === 1}
                     style={{ 
                       background: 'none',
                       border: '1px solid #e2e8f0',
                       padding: '4px 8px',
                       borderRadius: '6px',
                       cursor: 'pointer',
                       color: '#64748b',
                       transition: 'all 0.2s',
                       opacity: pagination[column.id].page === 1 ? 0.5 : 1,
                     }}
                     onMouseEnter={(e) => {
                       if (pagination[column.id].page > 1) {
                         e.currentTarget.style.borderColor = '#cbd5e1';
                         e.currentTarget.style.backgroundColor = '#f8fafc';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (pagination[column.id].page > 1) {
                         e.currentTarget.style.borderColor = '#e2e8f0';
                         e.currentTarget.style.backgroundColor = 'transparent';
                       }
                     }}
                   >
                     <ChevronLeft size={16} />
                   </button>
                   
                   <span style={{ 
                     fontSize: '14px',
                     color: '#64748b',
                     fontWeight: '500',
                   }}>
                     Page {pagination[column.id].page} of {pagination[column.id].totalPages}
                   </span>
                   
                    <button
                      onClick={() => handlePageChange(column.id, pagination[column.id].page + 1)}
                      disabled={pagination[column.id].page === pagination[column.id].totalPages}
                     style={{ 
                       background: 'none',
                       border: '1px solid #e2e8f0',
                       padding: '4px 8px',
                       borderRadius: '6px',
                       cursor: 'pointer',
                       color: '#64748b',
                       transition: 'all 0.2s',
                       opacity: pagination[column.id].page === pagination[column.id].totalPages ? 0.5 : 1,
                     }}
                     onMouseEnter={(e) => {
                       if (pagination[column.id].page < pagination[column.id].totalPages) {
                         e.currentTarget.style.borderColor = '#cbd5e1';
                         e.currentTarget.style.backgroundColor = '#f8fafc';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (pagination[column.id].page < pagination[column.id].totalPages) {
                         e.currentTarget.style.borderColor = '#e2e8f0';
                         e.currentTarget.style.backgroundColor = 'transparent';
                       }
                     }}
                   >
                     <ChevronRight size={16} />
                   </button>
                 </div>
               )}

             <div style={{ 
               marginTop: '16px',
               paddingTop: '16px',
               borderTop: '1px solid #e2e8f0',
               display: 'flex',
               justifyContent: 'center'
             }}>
              <button
                onClick={() => handleAddTask(column.id)}
                style={{ 
                  background: 'none',
                  border: '1px dashed #cbd5e1',
                  color: '#64748b',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.color = '#3b82f6';
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                + Add Task
              </button>
            </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && selectedColumnId !== null && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  Add New Task
                </h2>
                <p style={{ 
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Create a new task in {columns?.find(c => c.id === selectedColumnId)?.name}
                </p>
              </div>
              <button
                onClick={handleCloseAddTaskModal}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Task Title
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Description (Optional)
              </label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Priority
              </label>
              <div style={{ 
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTaskPriority(priority)}
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: newTaskPriority === priority ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      backgroundColor: newTaskPriority === priority ? '#eff6ff' : 'white',
                      color: newTaskPriority === priority ? '#3b82f6' : '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (newTaskPriority !== priority) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newTaskPriority !== priority) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseAddTaskModal}
                style={{ 
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAddTask}
                style={{ 
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditTaskModalOpen && editTaskId !== null && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  Edit Task
                </h2>
                <p style={{ 
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  Update task details
                </p>
              </div>
              <button
                onClick={handleCloseEditTaskModal}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Task Title
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                required
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Description (Optional)
              </label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                style={{ 
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#334155'
              }}>
                Priority
              </label>
              <div style={{ 
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setNewTaskPriority(priority)}
                    style={{ 
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: newTaskPriority === priority ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                      backgroundColor: newTaskPriority === priority ? '#eff6ff' : 'white',
                      color: newTaskPriority === priority ? '#3b82f6' : '#64748b',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (newTaskPriority !== priority) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newTaskPriority !== priority) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ 
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseEditTaskModal}
                style={{ 
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEditTask}
                style={{ 
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {selectedTask && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0,
                  marginBottom: '8px'
                }}>
                  {selectedTask.title}
                </h2>
                <span style={{ 
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: selectedTask.priority === 'high' ? '#fee2e2' : 
                                  selectedTask.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                  color: selectedTask.priority === 'high' ? '#991b1b' : 
                         selectedTask.priority === 'medium' ? '#92400e' : '#065f46'
                }}>
                  {selectedTask.priority}
                </span>
              </div>
              <button
                onClick={handleCloseTaskModal}
                style={{ 
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0,
                marginBottom: '8px'
              }}>
                Description
              </h3>
              <p style={{ 
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                margin: 0
              }}>
                {selectedTask.description || "No description"}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#1e293b',
                margin: 0,
                marginBottom: '16px'
              }}>
                Comments ({comments.length})
              </h3>
              
              {/* Comments List */}
              <div style={{ 
                marginBottom: '16px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {comments.length === 0 ? (
                  <div style={{ 
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#64748b',
                    fontStyle: 'italic'
                  }}>
                    No comments yet. Add one below!
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id}
                      style={{ 
                        background: '#f1f5f9',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#64748b'
                      }}
                    >
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          fontWeight: '500',
                          color: '#3b82f6'
                        }}>
                          User {comment.userId}
                        </span>
                        <span style={{ 
                          fontSize: '12px',
                          color: '#94a3b8'
                        }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ 
                        margin: 0,
                        lineHeight: '1.5'
                      }}>
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              {/* Add Comment Form */}
              <div style={{ 
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  style={{ 
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '60px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '8px'
                }}>
                  <button
                    onClick={handleAddComment}
                    disabled={!newCommentText.trim()}
                    style={{ 
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      opacity: newCommentText.trim() ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (newCommentText.trim()) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (newCommentText.trim()) {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                      }
                    }}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                style={{ 
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              >
                Delete
              </button>
              <button
                onClick={handleCloseTaskModal}
                style={{ 
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              >
                Close
              </button>
              <button
                onClick={() => handleEditTask(selectedTask)}
                style={{ 
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
