// Task mutations

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Utility to invalidate all board-related queries
const invalidateBoardRelatedQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: ["board"] });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
};
import { baseService } from "./base.service";
import {
  Board,
  Column,
  Task,
  Comment,
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  PRIORITY_ENUM,
} from "../../types";
import { BOARD_ROUTES, COMMENT_ROUTES, TASKS_ROUTES } from "./routes";

export const useGetTask = (taskId: string) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () =>
      baseService
        .get<Task>(TASKS_ROUTES.GET_TASK.replace(":task_id", taskId))
        .then((res) => res),
    enabled: !!taskId,
  });
};
// Delete board mutation
export const useDeleteBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) =>
      baseService.delete(
        `${BOARD_ROUTES.DELETE_BOARD.replace(":board_id", boardId)}`,
      ),
    onSuccess: (_, boardId) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails", boardId] });
    },
  });
};

// Get single board (shortcut for useBoard)
// Board details (board, columns, tasks count)
export const useBoardDetails = (boardId: string) => {
  return useQuery({
    queryKey: ["boardDetails", boardId],
    queryFn: () =>
      baseService
        .get<{
          board: Board;
          columns: Array<Column & { tasks_count: number }>;
        }>(BOARD_ROUTES.GET_BOARD_DETAILS.replace(":board_id", boardId))
        .then((res) => res),
    enabled: !!boardId,
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      column_id,
      data,
    }: {
      column_id: string;
      data: Partial<{ name: string }>;
    }) =>
      baseService.patch<Column>(
        BOARD_ROUTES.UPDATE_COLUMN.replace(":column_id", column_id),
        data,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["column", variables.column_id],
      });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
    },
  });
};
export const useDeleteColumn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ column_id }: { column_id: string }) =>
      baseService.delete<Column>(
        BOARD_ROUTES.DELETE_COLUMN.replace(":column_id", column_id),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["column", variables.column_id],
      });
      queryClient.invalidateQueries({ queryKey: ["board"] });
      queryClient.invalidateQueries({ queryKey: ["boardDetails"] });
    },
  });
};

// Board details (board, columns, tasks count)
export const useBoardColumns = (boardId: string) => {
  return useQuery({
    queryKey: ["boardDetails", boardId],
    queryFn: () =>
      baseService
        .get<
          Array<Column & { tasks_count: number }>
        >(BOARD_ROUTES.GET_BOARD_COLUMNS.replace(":board_id", boardId))
        .then((res) => res),
    enabled: !!boardId,
  });
};
export const useGetBoard = (boardId: string) => {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () =>
      baseService
        .get<Board>(`${BOARD_ROUTES.GET_BOARDS}/${boardId}`)
        .then((res) => res),
    enabled: !!boardId,
  });
};
// Board mutations
export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Partial<{
        name: string;
        description: string;
        columns: { name: string; position: number }[];
      }>,
    ) => baseService.post<Board>(BOARD_ROUTES.GET_BOARDS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      boardId,
      data,
    }: {
      boardId: string;
      data: Partial<{
        name: string;
        description: string;
        columns: { column_id?: string; name: string; position: number }[];
      }>;
    }) =>
      baseService.patch<Board>(`${BOARD_ROUTES.GET_BOARDS}/${boardId}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["board", variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({
        queryKey: ["boardDetails", variables.boardId],
      });
    },
  });
};
// Board queries
export const useBoards = () => {
  return useQuery({
    queryKey: ["boards"],
    queryFn: () =>
      baseService.get<Board[]>(BOARD_ROUTES.GET_BOARDS).then((res) => res),
  });
};

export const useBoard = (boardId: string) => {
  return useQuery({
    queryKey: ["board", boardId],
    queryFn: () =>
      baseService
        .get<{ board: Board }>(`${BOARD_ROUTES.GET_BOARDS}/${boardId}`)
        .then((res) => res.board),
    enabled: !!boardId,
  });
};

export const useBoardWithDetails = (boardId: string) => {
  return useQuery({
    queryKey: ["boardDetails", boardId],
    queryFn: () =>
      baseService.get<{ board: Board; columns: Column[] }>(
        BOARD_ROUTES.GET_BOARD_DETAILS.replace(":board_id", boardId),
      ),
    enabled: !!boardId,
  });
};
export const useGetColumn = (column_id: string) => {
  return useQuery({
    queryKey: ["column", column_id],
    queryFn: () =>
      baseService.get<Column>(
        BOARD_ROUTES.GET_COLUMN.replace(":column_id", column_id),
      ),
    enabled: !!column_id,
  });
};

// Task queries
export const useTasks = ({
  column_id,
  page = 1,
  limit = 20,
  search,
  priority,
}: {
  column_id?: string;
  page?: number;
  limit?: number;
  search?: string;
  priority?: PRIORITY_ENUM;
}) => {
  return useQuery({
    queryKey: ["tasks", column_id, page, limit, search, priority],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(column_id && { column_id: column_id }),
        ...(search && { search }),
        ...(priority && { priority }),
      });
      return baseService.get<{
        tasks: Task[];
        pagination: {
          total: number;
          current_page: number;
          page_size: number;
          total_pages: number;
          next_page: number | null;
          prev_page: number | null;
        };
      }>(
        `${TASKS_ROUTES.GET_TASKS.replace(":column_id", column_id || "")}?${params.toString()}`,
      );
    },
  });
};

// Task mutations
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskDto) =>
      baseService.post<{ task: Task }>(
        TASKS_ROUTES.CREATE_TASK.replace(":column_id", data.column_id),
        data,
      ),
    onSuccess: () => {
      invalidateBoardRelatedQueries(queryClient);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskDto }) =>
      baseService.patch<{ task: Task }>(
        TASKS_ROUTES.UPDATE_TASK.replace(":task_id", taskId),
        data,
      ),
    onSuccess: () => {
      invalidateBoardRelatedQueries(queryClient);
    },
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      task_id,
      to_column_id,
      new_order,
    }: {
      task_id: string;
      to_column_id: string;
      new_order: number;
    }) =>
      baseService.patch<Task>(
        TASKS_ROUTES.MOVE_TASK.replace(":task_id", task_id),
        {
          to_column_id,
          new_order,
        },
      ),
    onSuccess: () => {
      invalidateBoardRelatedQueries(queryClient);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => baseService.delete(`/tasks/${taskId}`),
    onSuccess: () => {
      invalidateBoardRelatedQueries(queryClient);
    },
  });
};

// Comment queries
export const useComments = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () =>
      baseService
        .get<Comment[]>(COMMENT_ROUTES.GET_COMMENTS.replace(":task_id", taskId))
        .then((res) => res),
    enabled: !!taskId,
  });
};

// Comment mutations
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: CreateCommentDto;
    }) =>
      baseService.post<{ comment: Comment }>(
        COMMENT_ROUTES.CREATE_COMMENT.replace(":task_id", taskId),
        data,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      commentId,
    }: {
      taskId: string;
      commentId: string;
    }) =>
      baseService.delete(
        COMMENT_ROUTES.DELETE_COMMENT.replace(":comment_id", commentId),
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.taskId],
      });
    },
  });
};
