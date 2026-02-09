import type { ApiErrorResponse, ApiErrorDetail } from "@/types";

/**
 * API Error handling utility
 * Matches backend error response format: { error: { code, message, details } }
 */

export class ApiErrorHandler {
  static isApiError(error: unknown): error is ApiErrorResponse {
    if (typeof error !== "object" || error === null) return false;
    const err = error as Record<string, unknown>;
    return "error" in err && typeof err.error === "object";
  }

  /**
   * Extract error message from various error sources
   */
  static getErrorMessage(
    error: unknown,
    defaultMessage = "An error occurred",
  ): string {
    // Axios or fetch error with response data
    if (this.isApiError(error)) {
      return error.error.message || defaultMessage;
    }

    // Standard Error object
    if (error instanceof Error) {
      return error.message || defaultMessage;
    }

    // String error
    if (typeof error === "string") {
      return error;
    }

    return defaultMessage;
  }

  /**
   * Get validation error details from API error response
   * Returns array of field-level errors if available
   */
  static getValidationErrors(error: unknown): ApiErrorDetail[] {
    if (
      this.isApiError(error) &&
      error.error.details &&
      Array.isArray(error.error.details)
    ) {
      return error.error.details;
    }
    return [];
  }

  /**
   * Get error code (UNAUTHORIZED, NOT_FOUND, BAD_REQUEST, etc.)
   */
  static getErrorCode(error: unknown): string {
    if (this.isApiError(error)) {
      return error.error.code;
    }
    return "UNKNOWN_ERROR";
  }

  /**
   * Check if error is a specific type
   */
  static isUnauthorized(error: unknown): boolean {
    return this.getErrorCode(error) === "UNAUTHORIZED";
  }

  static isNotFound(error: unknown): boolean {
    return this.getErrorCode(error) === "NOT_FOUND";
  }

  static isConflict(error: unknown): boolean {
    return this.getErrorCode(error) === "CONFLICT";
  }

  static isBadRequest(error: unknown): boolean {
    return this.getErrorCode(error) === "BAD_REQUEST";
  }

  static isForbidden(error: unknown): boolean {
    return this.getErrorCode(error) === "FORBIDDEN";
  }

  /**
   * Get user-friendly error message based on error code
   */
  static getUserFriendlyMessage(error: unknown): string {
    const code = this.getErrorCode(error);
    const apiMessage = this.getErrorMessage(error);

    const messages: Record<string, string> = {
      UNAUTHORIZED: "Your session has expired. Please log in again.",
      FORBIDDEN: "You do not have permission to access this resource.",
      NOT_FOUND: "The requested resource was not found.",
      CONFLICT: "This resource already exists.",
      BAD_REQUEST: "Invalid request. Please check your input.",
      UNKNOWN_ERROR: "Something went wrong. Please try again.",
    };

    return messages[code] || apiMessage || messages.UNKNOWN_ERROR;
  }

  /**
   * Log error for debugging (can be expanded with error tracking service)
   */
  static logError(error: unknown, context?: string): void {
    const message = this.getErrorMessage(error);
    const code = this.getErrorCode(error);
    const details = this.getValidationErrors(error);

    console.error(`[${code}]${context ? ` (${context})` : ""}:`, message);
    if (details.length > 0) {
      console.error("Validation errors:", details);
    }
  }
}

/**
 * Parse error response from fetch API
 */
export async function parseFetchError(
  response: Response,
): Promise<ApiErrorResponse> {
  try {
    const data = await response.json();
    if (data.error) {
      return data;
    }
  } catch (e) {
    // Response is not JSON
  }

  // Fallback error response
  return {
    error: {
      code: `HTTP_${response.status}`,
      message: response.statusText || "Request failed",
      details: null,
    },
  };
}
