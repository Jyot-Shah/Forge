import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      <Outlet />
    </div>
  );
}
