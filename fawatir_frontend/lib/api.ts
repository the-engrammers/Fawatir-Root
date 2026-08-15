const DEFAULT_API_URL = "http://localhost:8000";

export const getAPIUrl = (): string => {
  if (typeof window !== "undefined") {
    const overridden = window.localStorage.getItem("API_URL");
    if (overridden) return overridden;
  }
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
};

export const fetchAPI = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const baseUrl = getAPIUrl();
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  const url = `${cleanBase}/${cleanPath}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return res;
};