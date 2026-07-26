import axios from "axios";

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1",
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshPromise;
api.interceptors.response.use(undefined, async (error) => {
  const request = error.config;
  if (
    error.response?.status !== 401 ||
    request._retried ||
    request.url === "/auth/refresh"
  )
    return Promise.reject(error);
  request._retried = true;
  refreshPromise ||= api
    .post("/auth/refresh")
    .then(({ data }) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  await refreshPromise;
  return api(request);
});
