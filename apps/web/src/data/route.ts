export enum APP_ROUTES {
  LOGIN_PAGE = "/auth/login",
  REGISTER_PAGE = "/auth/register",
  DASHBOARD_PAGE = "/dashboard",
  BOARD_PAGE = `${APP_ROUTES.DASHBOARD_PAGE}/board/:board_id`,
}
