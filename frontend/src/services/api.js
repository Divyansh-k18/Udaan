// frontend/src/services/api.js

/*
  Central API service for Udaan.

  VITE_API_URL is public frontend configuration.
  NEVER put passwords, database credentials,
  API secrets, private keys, etc. in VITE_* variables.

  Example:
  VITE_API_URL=http://127.0.0.1:8000
*/

export const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/*
  Convert the server response into JSON when possible.
  If the response is not JSON, return normal text.
*/
async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

/*
  Convert technical HTTP errors into friendly messages.
*/
function getFriendlyError(status, data) {
  // FastAPI often returns:
  // { "detail": "Some message" }

  if (data && typeof data === "object") {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (typeof data.message === "string") {
      return data.message;
    }
  }

  switch (status) {
    case 400:
      return "The request could not be completed. Please check the information and try again.";

    case 401:
      return "Your session has expired. Please sign in again.";

    case 403:
      return "You do not have permission to perform this action.";

    case 404:
      return "The requested information could not be found.";

    case 409:
      return "This request conflicts with existing information.";

    case 422:
      return "Some information is invalid. Please check the form and try again.";

    case 429:
      return "Too many requests were sent. Please try again shortly.";

    case 500:
    case 502:
    case 503:
    case 504:
      return "The server is temporarily unavailable. Please try again.";

    default:
      return `The request failed with status ${status}.`;
  }
}

/*
  Main request helper used internally by GET, POST and PUT.
*/
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(10000),

      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(getFriendlyError(response.status, data));
    }

    if (typeof data === "string") {
      throw new Error("The API returned a web page instead of data. Check the API URL or start the backend.");
    }
    return data;
  } catch (error) {
    /*
      An Error created above already contains a friendly
      server message, so keep it.
    */
    if (error?.name === "TimeoutError") {
      throw new Error("The server took too long to respond. Please try again.");
    }
    if (error instanceof Error && error.message) {
      /*
        Browser fetch normally produces "Failed to fetch"
        when FastAPI is offline, CORS fails, or the network
        cannot connect.
      */
      if (
        error.message === "Failed to fetch" ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          "Unable to connect to the Udaan server. Please check your connection and try again."
        );
      }

      throw error;
    }

    throw new Error(
      "Something went wrong while contacting the Udaan server."
    );
  }
}

/*
  GET helper

  Example:
  const data = await apiGet("/health");
*/
export function apiGet(path, options = {}) {
  return request(path, {
    ...options,
    method: "GET",
  });
}

/*
  POST helper

  Example:
  await apiPost("/login", {
    email: "student@example.com",
    password: "..."
  });
*/
export function apiPost(path, body, options = {}) {
  return request(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/*
  PUT helper

  Example:
  await apiPut("/settings", {
    theme: "dark"
  });
*/
export function apiPut(path, body, options = {}) {
  return request(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}