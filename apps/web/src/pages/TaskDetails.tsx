import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask } from "../api/tasks";
import { getComments, createComment } from "../api/comments";
import { useAuth } from "../hooks/useAuth";

export const TaskDetails = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getComments(Number(taskId)),
    enabled: !!taskId,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(Number(taskId), content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      setNewComment("");
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={() => navigate(-1)}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Task #{taskId}</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <div className="space-y-4 mb-4">
              {commentsLoading ? (
                <p>Loading comments...</p>
              ) : comments?.length === 0 ? (
                <p className="text-gray-500 italic">No comments yet.</p>
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.user_email}
                      </span>
                      <span>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="mt-4">
              <textarea
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={commentMutation.isPending || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {commentMutation.isPending ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
