import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as authApi from "./api/auth";
import * as boardApi from "./api/boards";
import * as taskApi from "./api/tasks";
import * as commentApi from "./api/comments";

export const keys = {
  board: (id: string) => ["board", id] as const,
  columns: (boardId: string) => ["columns", boardId] as const,
  tasks: (columnId: string, params: Record<string, unknown>) =>
    ["tasks", columnId, JSON.stringify(params)] as const,
  comments: (taskId: string) => ["comments", taskId] as const,
};

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: keys.board(boardId),
    queryFn: () => boardApi.getBoard(boardId),
  });
}

export function useColumns(boardId: string) {
  return useQuery({
    queryKey: keys.columns(boardId),
    queryFn: () => boardApi.getColumns(boardId),
  });
}

export function useTasks(
  columnId: string,
  params: { search?: string; page?: number; limit?: number; sort?: string }
) {
  return useQuery({
    queryKey: keys.tasks(columnId, params),
    queryFn: () => taskApi.getTasks(columnId, params),
  });
}

export function useComments(taskId: string) {
  return useQuery({
    queryKey: keys.comments(taskId),
    queryFn: () => commentApi.getComments(taskId),
  });
}

export function useAuthMutations() {
  return {
    register: useMutation({ mutationFn: authApi.register }),
    login: useMutation({ mutationFn: authApi.login }),
    logout: useMutation({ mutationFn: authApi.logout }),
  };
}

export function useTaskMutations(boardId: string) {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: ({ columnId, payload }: { columnId: string; payload: any }) =>
        taskApi.createTask(columnId, payload),
      onSuccess: (_data: unknown, variables: { columnId: string; payload: any }) => {
        qc.invalidateQueries({ queryKey: keys.columns(boardId) });
        qc.invalidateQueries({ queryKey: ["tasks", variables.columnId] });
      },
    }),
    update: useMutation({
      mutationFn: ({ taskId, payload }: { taskId: string; payload: any }) =>
        taskApi.updateTask(taskId, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: keys.columns(boardId) });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      },
    }),
    remove: useMutation({
      mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: keys.columns(boardId) });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      },
    }),
  };
}

export function useCommentMutations(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { body: string }) =>
      commentApi.createComment(taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.comments(taskId) });
    },
  });
}
