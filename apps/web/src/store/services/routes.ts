export enum AUTH_ROUTES {
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",
  LOGOUT = "/auth/logout",
}

export enum BOARD_ROUTES {
  GET_BOARDS = "/boards",
  CREATE_BOARD = "/boards",
  GET_BOARD_DETAILS = `/boards/:board_id/details`,
  GET_BOARD_COLUMNS = `/boards/:board_id/columns`,
  UPDATE_BOARD = `/boards/:board_id`,
  DELETE_BOARD = `/boards/:board_id`,

  GET_COLUMN = `/columns/:column_id`,
  DELETE_COLUMN = `/columns/:column_id`,
  UPDATE_COLUMN = `/columns/:column_id`,
}

export enum TASKS_ROUTES {
  GET_TASK = "/tasks/:task_id",
  GET_TASKS = "/tasks/columns/:column_id/tasks",
  CREATE_TASK = "/tasks/columns/:column_id/tasks",
  UPDATE_TASK = "/tasks/:task_id",
  DELETE_TASK = "/tasks/:task_id",
  MOVE_TASK = "/tasks/:task_id/move",
}

export enum COMMENT_ROUTES {
  GET_COMMENTS = "/comments/:task_id/comments",
  CREATE_COMMENT = "/comments/:task_id/comments",
  UPDATE_COMMENT = "/comments/:comment_id",
  DELETE_COMMENT = "/comments/:comment_id",
}
