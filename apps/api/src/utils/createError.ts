export const createError = (
  status: number,
  message: string,
  extra?: any
) => {
  return {
    status,
    message,
    ...extra,
  };
};
