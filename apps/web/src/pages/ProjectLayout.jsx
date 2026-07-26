import { useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client.js";
import ForgeLogo from "../components/ForgeLogo.jsx";

export default function ProjectLayout() {
  const { projectId } = useParams();
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
    { to: `/projects/${projectId}`, label: "Dashboard", icon: "dashboard", end: true },
    { to: `/projects/${projectId}/documents`, label: "Library", icon: "local_library" },
    { to: `/projects/${projectId}/search`, label: "Search", icon: "search" },
    { to: `/projects/${projectId}/tasks`, label: "Tasks", icon: "checklist" },
    { to: `/projects/${projectId}/chat`, label: "Chat", icon: "forum" },
    { to: `/projects/${projectId}/memories`, label: "Memory", icon: "neurology" },
    { to: `/projects/${projectId}/settings`, label: "Settings", icon: "settings" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden font-body-md text-body-md bg-background text-on-surface">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-container-low border-b border-outline-variant shrink-0 z-50">
        <div className="flex items-center gap-3">
          <ForgeLogo className="w-7 h-7" />
          <div>
            <h1 className="font-mono-label text-mono-label font-bold text-primary uppercase tracking-widest">Forge</h1>
            <p className="font-body-sm text-[11px] text-on-surface-variant max-w-[140px] truncate">{project?.name}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-on-surface-variant hover:text-primary rounded level-1 border border-outline-variant focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[20px]">{mobileMenuOpen ? "close" : "menu"}</span>
        </button>
      </header>

      {/* SideNavBar (Desktop & Mobile Drawer) */}
      <nav
        className={`fixed md:static inset-y-0 left-0 w-60 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between py-4 gap-2 z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Header */}
          <div className="px-5 pb-5 pt-1 mb-3 border-b border-outline-variant/40 hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ForgeLogo className="w-8 h-8" />
              <div>
                <h1 className="font-mono-label text-mono-label font-bold text-primary uppercase tracking-widest">Forge</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant font-medium max-w-[120px] truncate" title={project?.name || "Project"}>
                  {project?.name || "Workspace"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
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
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer Workspace Link */}
        <div className="px-3 pt-3 border-t border-outline-variant/40 space-y-2">
          <a
            href="/projects"
            className="flex items-center justify-between px-3 py-2 level-2 rounded-DEFAULT text-on-surface-variant hover:text-primary font-mono-label text-mono-label transition"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              Switch Project
            </span>
            <span className="text-[10px] text-outline">ESC</span>
          </a>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-background">
        <div className="max-w-[1440px] mx-auto p-4 md:p-6 space-y-6">
          <Outlet context={{ project }} />
        </div>
      </main>
    </div>
  );
}
