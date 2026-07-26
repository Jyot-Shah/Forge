import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const listRef = useRef(null);

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

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setSearch("");
        setSelectedIndex(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function execute(path) {
    setOpen(false);
    setSearch("");
    setSelectedIndex(0);
    navigate(path);
  }

  function handleListKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        execute(filtered[selectedIndex].path);
      }
    }
  }

  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selected) selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
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
            onKeyDown={handleListKeyDown}
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 level-2 rounded font-mono-label text-[10px] text-on-surface-variant border border-outline-variant">
            ESC
          </kbd>
        </div>

        {/* List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-outline-variant/30">
          {filtered.length ? (
            filtered.map((action, index) => (
              <button
                key={action.id}
                data-index={index}
                onClick={() => execute(action.path)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition text-left group ${
                  index === selectedIndex
                    ? "bg-surface-container-highest text-primary"
                    : "hover:bg-surface-container-highest"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[18px] ${index === selectedIndex ? "text-primary" : "text-on-surface-variant group-hover:text-primary"}`}>
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
          <span>↑↓ navigate · ENTER select · ESC close</span>
        </div>
      </div>
    </div>
  );
}
