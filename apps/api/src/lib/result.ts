export type Result<T> = { error: string } | T;

export function isError<T extends object>(
  result: Result<T>
): result is { error: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof (result as { error: unknown }).error === "string"
  );
}
