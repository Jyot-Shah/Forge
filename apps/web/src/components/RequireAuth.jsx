import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, getAccessToken, setAccessToken } from "../api/client.js";

export default function RequireAuth({ children }) {
  const [state, setState] = useState(() =>
    getAccessToken() ? "ready" : "loading",
  );

  useEffect(() => {
    if (getAccessToken()) return;

    api
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setState("ready");
      })
      .catch(() => setState("denied"));
  }, []);

  if (state === "loading") return <p>Restoring session…</p>;
  return state === "ready" ? children : <Navigate to="/login" replace />;
}
