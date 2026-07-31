import { useState } from "react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import ForgeLogo from "../components/ForgeLogo.jsx";
import CommandPalette from "../components/CommandPalette.jsx";

export default function ProjectLayout() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data.project,
  });

  if (projectQuery.isLoading) {
    return (
      <div className="p-8 text-center text-on-surface-variant font-mono-code">
        Loading project context...
      </div>
    );
  }

  const project = projectQuery.data;

  const navItems = [
    {
      to: `/projects/${projectId}`,
      label: "Dashboard",
      icon: "dashboard",
      end: true,
    },
    {
      to: `/projects/${projectId}/documents`,
      label: "Library",
      icon: "local_library",
    },
    { to: `/projects/${projectId}/search`, label: "Search", icon: "search" },
    { to: `/projects/${projectId}/tasks`, label: "Tasks", icon: "checklist" },
    { to: `/projects/${projectId}/chat`, label: "Chat", icon: "forum" },
    {
      to: `/projects/${projectId}/memories`,
      label: "Memory",
      icon: "neurology",
    },
    {
      to: `/projects/${projectId}/settings`,
      label: "Settings",
      icon: "settings",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden font-body-md text-body-md bg-background text-on-surface">
      <CommandPalette />
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant shrink-0 z-50">
        <Link to="/projects" className="flex items-center gap-3">
          <ForgeLogo className="w-7 h-7" />
          <div>
            <h1 className="font-mono-label text-mono-label font-bold text-primary uppercase tracking-widest">
              Forge
            </h1>
            <p className="font-body-sm text-[11px] text-on-surface-variant max-w-[140px] truncate">
              {project?.name}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-on-surface-variant hover:text-primary rounded level-1 border border-outline-variant focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </header>

      <nav
        className={`fixed md:static inset-y-0 left-0 w-60 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between py-4 gap-2 z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <Link
            to="/projects"
            className="px-5 pb-5 pt-1 mb-3 border-b border-outline-variant/40 hidden md:flex items-center gap-3 group hover:opacity-90 transition"
            title="Go to Projects Directory"
          >
            <ForgeLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="font-mono-label text-mono-label font-bold text-primary uppercase tracking-widest group-hover:text-white">
                Forge
              </h1>
              <p
                className="font-body-sm text-body-sm text-on-surface-variant font-medium max-w-[120px] truncate"
                title={project?.name || "Project"}
              >
                {project?.name || "Workspace"}
              </p>
            </div>
          </Link>

          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                end={item.end}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-DEFAULT transition-all duration-150 font-mono-label text-mono-label active:scale-[0.98] ${
                    isActive
                      ? "bg-surface-container-highest text-primary border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="px-3 pt-3 border-t border-outline-variant/40 space-y-2">
          {/* Logged in User Card */}
          <div className="px-3 py-2 level-2 rounded-DEFAULT flex items-center justify-between border border-outline-variant/40">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary font-mono-label text-[10px] font-bold flex items-center justify-center shrink-0">
                {(user?.displayName || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-mono-label text-[11px] text-primary truncate">
                  {user?.displayName || "Developer"}
                </p>
                <p className="font-mono-code text-[9px] text-on-surface-variant truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-on-surface-variant hover:text-error transition p-1 rounded"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px]">
                logout
              </span>
            </button>
          </div>

          <Link
            to="/projects"
            className="flex items-center justify-between px-3 py-1.5 level-1 rounded-DEFAULT text-on-surface-variant hover:text-primary font-mono-label text-[11px] transition border border-outline-variant/30"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">
                swap_horiz
              </span>
              Switch Project
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 h-full overflow-y-auto bg-background">
        <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
          <Outlet context={{ project }} />
        </div>
      </main>
    </div>
  );
}
