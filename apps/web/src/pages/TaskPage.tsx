
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query'; 
import { getTasksApi } from '../api/task';
import { useUpdateTask, useDeleteTask, useComments, useAddComment } from '../hooks/useTask';
import { Trash2, Save, MessageSquare, Clock, Loader2 } from 'lucide-react';

export default function TaskPage() {
  const { state } = useLocation();
  const { taskId, columnId } = useParams();
  const navigate = useNavigate();
  
  

  // If NO initial data, fetch it using the columnId from URL
  const initialTask = state?.task;
  const { data: columnTasks, isLoading: isLoadingTask } = useQuery({
    queryKey: ['tasks', columnId], 
    queryFn: () => getTasksApi({ columnId: columnId! }),
    enabled: !initialTask && !!columnId, 
  });

  //resolve the actual task object (either from State or from API fetch)
  const task = initialTask || columnTasks?.data?.find((t: any) => t.id === taskId);

  //Api hooks
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: comments, isLoading: loadingComments } = useComments(taskId!);
  const addComment = useAddComment();
  
  //Form setup
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm();
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium'
      });
    }
  }, [task, reset]);

  // loading or error
  if (isLoadingTask && !task) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task && !isLoadingTask) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Task not found</h2>
        <p className="text-gray-500">The task ID provided does not exist in this column.</p>
        <button onClick={() => navigate('/board')} className="text-blue-600 hover:underline">
          Go to Dashboard
        </button>
      </div>
    );
  }

  //handklers
  const onSaveTask = (data: any) => {
    updateTask.mutate({ id: taskId!, ...data });
  };

  const onDelete = () => {
    if(confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(taskId!, {
        onSuccess: () => navigate('/board')
      });
    }
  };

  const onAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment.mutate({ taskId: taskId!, content: commentText }, {
      onSuccess: () => setCommentText('')
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit(onSaveTask)} className="p-8 space-y-8">
          {/*top Controls */}
          <div className="flex justify-between items-start">
            <div className="relative">
              <select 
                {...register('priority')}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-4 pr-8 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            <button 
              type="button"
              onClick={onDelete}
              className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Title, description and actions*/}
          <input
            {...register('title', { required: true })}
            className="w-full text-3xl font-extrabold text-gray-900 placeholder-gray-300 outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors pb-2 bg-transparent"
            placeholder="Task Title"
          />
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={6}
              className="w-full bg-transparent outline-none resize-none text-gray-700 leading-relaxed placeholder-gray-400"
              placeholder="Add details about this task..."
            />
          </div>
          {isDirty && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={updateTask.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                <Save className="h-4 w-4" />
                {updateTask.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-50/50 rounded-xl border border-gray-200 p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          Discussion
        </h3>

        <div className="space-y-4 mb-8">
          {loadingComments ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin h-5 w-5 text-blue-500"/></div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-lg border border-dashed border-gray-200">
              No comments yet. Start the conversation!
            </div>
          ) : (
            comments?.map((c: any) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {c.user.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">{c.user.name}</span>
                      <span className="text-xs text-gray-500">{c.user.email}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                    <Clock className="h-3 w-3" />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm pl-[42px] leading-relaxed">{c.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={onAddComment} className="flex gap-3 items-start">
          <div className="flex-1">
             <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={!commentText.trim() || addComment.isPending}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold disabled:opacity-50 transition-colors shadow-md"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}