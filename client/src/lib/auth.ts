// Auth utilities and API functions
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const redirectToLogin = () => {
  window.location.href = "/login";
};

// API request wrapper with auth
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    redirectToLogin();
    throw new Error("Authentication required");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Request failed");
  }

  return response;
};
