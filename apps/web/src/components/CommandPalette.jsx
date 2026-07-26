import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!open) return null;

  const actions = [
    {
      id: "dash",
      label: "Go to Dashboard",
      icon: "dashboard",
      path: projectId ? `/projects/${projectId}` : "/projects",
    },
    {
      id: "lib",
      label: "Open Document Library",
      icon: "local_library",
      path: projectId ? `/projects/${projectId}/documents` : "/projects",
    },
    {
      id: "search",
      label: "Global Hybrid Search",
      icon: "search",
      path: projectId ? `/projects/${projectId}/search` : "/projects",
    },
    {
      id: "chat",
      label: "Open AI Chat Session",
      icon: "forum",
      path: projectId ? `/projects/${projectId}/chat` : "/projects",
    },
    {
      id: "memory",
      label: "Inspect Memory Graph",
      icon: "neurology",
      path: projectId ? `/projects/${projectId}/memories` : "/projects",
    },
    {
      id: "settings",
      label: "Workspace Settings",
      icon: "settings",
      path: projectId ? `/projects/${projectId}/settings` : "/projects",
    },
    { id: "switch", label: "Switch Project Workspace", icon: "swap_horiz", path: "/projects" },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase()),
  );

  function execute(path) {
    setOpen(false);
    setSearch("");
    navigate(path);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl level-1 rounded-DEFAULT border border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Input */}
        <div className="flex items-center px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
          <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
          <input
            type="text"
            className="w-full bg-transparent font-mono-code text-[14px] text-primary outline-none placeholder:text-outline"
            placeholder="Type a command or search workspace... (ESC to close)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 level-2 rounded font-mono-label text-[10px] text-on-surface-variant border border-outline-variant">
            ESC
          </kbd>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-outline-variant/30">
          {filtered.length ? (
            filtered.map((action) => (
              <button
                key={action.id}
                onClick={() => execute(action.path)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded hover:bg-surface-container-highest transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary">
                    {action.icon}
                  </span>
                  <span className="font-mono-label text-mono-label text-primary">
                    {action.label}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-outline group-hover:text-primary">
                  arrow_forward
                </span>
              </button>
            ))
          ) : (
            <div className="p-6 text-center font-mono-code text-[12px] text-on-surface-variant">
              No commands found matching "{search}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-outline-variant/40 bg-surface-container-low flex items-center justify-between font-mono-label text-[10px] text-on-surface-variant">
          <span>Navigation Shortcuts</span>
          <span>Press ↑↓ to navigate, ENTER to select</span>
        </div>
      </div>
    </div>
  );
}
