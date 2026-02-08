import { useComments } from "../store/services/board.service";

type Props = {
  taskId: string;
};

const CommentCard = ({ taskId }: Props) => {
  const { data, isLoading, isError } = useComments(taskId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-6 bg-gray-200 rounded w-full"
          />
        ))}
      </div>
    );
  }
  if (isError) {
    return <div className="text-xs text-red-500">Failed to load comments.</div>;
  }
  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-400">No comments yet.</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {data.map((comment) => (
        <div
          key={comment.comment_id}
          className="bg-gray-100 border border-gray-300 rounded p-2 text-xs"
        >
          <div className="font-semibold text-gray-700 mb-1">
            {comment.author?.username || "User"}
          </div>
          <div className="text-gray-600">{comment.content}</div>
          <div className="text-[10px] text-gray-400 mt-1">
            {new Date(comment.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentCard;
