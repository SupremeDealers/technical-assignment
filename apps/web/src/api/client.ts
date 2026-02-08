const BASE_URL = "http://localhost:4000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      // Optional: redirect to login
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Something went wrong");
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
