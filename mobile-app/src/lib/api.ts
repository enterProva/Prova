import { Platform } from "react-native";

type JsonBody = Record<string, unknown> | Array<unknown>;

const rawApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

function getDefaultApiBaseUrl() {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
}

export const API_BASE_URL = (rawApiBaseUrl || getDefaultApiBaseUrl()).replace(/\/$/, "");

function getRequestUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readErrorMessage(response: Response) {
  try {
    const text = await response.text();
    return text || response.statusText;
  } catch {
    return response.statusText;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: JsonBody;
  token?: string | null;
};

export async function apiRequest(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(getRequestUrl(path), {
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(`${response.status}: ${message}`);
  }

  return response;
}

export async function apiJson<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await apiRequest(path, options);
  return (await response.json()) as T;
}
