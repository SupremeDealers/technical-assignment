export function getErrorMessage(
  error: any,
  fallback = "An unexpected error occurred, please try again later.",
) {
  console.error({error});
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}
