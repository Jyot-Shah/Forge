import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { pingBackend } from "./api/client.js";

export default function App() {
  useEffect(() => {
    pingBackend();
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      <Outlet />
    </div>
  );
}
