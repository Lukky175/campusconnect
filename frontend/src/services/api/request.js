import { env } from "../../config/env";

export async function request(path, options = {}) {
  const token = localStorage.getItem(
    "campusconnect-access-token"
  );

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${env.apiBaseUrl}${path}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/login"
    ) {
      localStorage.removeItem(
        "campusconnect-access-token"
      );

      localStorage.removeItem(
        "campusconnect-auth"
      );
    }

    const error = new Error(
      data?.message ||
        "Something went wrong."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  /*
   * Backend response format:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: {
   *     ...
   *   }
   * }
   *
   * The API service layer returns only the
   * actual data payload to the rest of the
   * frontend application.
   */
  return data?.data ?? data;
}