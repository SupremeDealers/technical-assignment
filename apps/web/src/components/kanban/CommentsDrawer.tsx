import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import type { Task, Comment, PaginatedResponse } from '@/types';
import { commentsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface CommentsDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ task, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState<{
    page: number;
    totalPages: number;
    total: number;
  }>({ page: 1, totalPages: 1, total: 0 });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchComments = useCallback(async (page = 1, append = false) => {
    if (!task) return;

    const setLoading = page === 1 ? setIsLoading : setIsLoadingMore;
    setLoading(true);

    try {
      const response: PaginatedResponse<Comment> = await commentsApi.getByTask(task.id, page, 10);
      setComments(append ? [...comments, ...response.data] : response.data);
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
      });
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [task, comments]);

  useEffect(() => {
    if (task && isOpen) {
      fetchComments(1);
    } else {
      setComments([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
    }
  }, [task?.id, isOpen]);

  const handleSubmitComment = async () => {
    if (!task || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await commentsApi.create(task.id, { content: newComment.trim() });
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchComments(pagination.page + 1, true);
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </SheetTitle>
          {task && (
            <p className="text-sm text-muted-foreground line-clamp-1">{task.title}</p>
          )}
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* New Comment Input */}
          <div className="py-4 border-b">
            <div className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="focus-ring resize-none min-h-[80px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <ScrollArea className="flex-1 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 animate-in">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(comment.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.user?.name || comment.user?.email || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}

                {pagination.page < pagination.totalPages && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Load more comments
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentsDrawer;
