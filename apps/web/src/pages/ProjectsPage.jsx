import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import ForgeLogo from "../components/ForgeLogo.jsx";

function ProjectRoleBadge({ role }) {
  return (
    <span className="status-chip status-ready border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
      {role}
    </span>
  );
}

export default function ProjectsPage() {
  const formRef = useRef(null);
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (name) => api.post("/projects", { name }),
    onSuccess: () => {
      formRef.current?.reset();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate(String(form.get("name") || "").trim());
  }

  const remove = useMutation({
    mutationFn: (projectId) => api.delete(`/projects/${projectId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => (await api.get("/projects")).data,
  });

  if (isLoading) return <div className="p-8 font-mono-code text-on-surface-variant">Loading workspace projects…</div>;
  if (error) return <div className="p-8 font-mono-code text-error">Unable to load workspace projects.</div>;

  return (
    <div className="min-h-screen bg-background text-on-surface p-6 md:p-10">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Header & Navigation bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-outline-variant">
          <Link to="/projects" className="flex items-center gap-3 group hover:opacity-90 transition">
            <ForgeLogo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="font-mono-label text-mono-label font-bold tracking-widest text-primary uppercase group-hover:text-white">Forge</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Project Directory & Knowledge Hub</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 font-mono-label text-mono-label">
            <span className="px-3 py-1 level-1 border border-outline-variant text-on-surface-variant">
              System: Online
            </span>
            <span className="px-3 py-1 level-1 border border-outline-variant text-primary">
              Projects: {data.projects.length}
            </span>
          </div>
        </header>

        {/* Top Section: Action & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Project Card */}
          <div className="lg:col-span-2 level-1 p-6 md:p-8 rounded-DEFAULT border border-outline-variant">
            <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest mb-2">
              Workspace Operations
            </div>
            <h2 className="font-headline-lg text-headline-lg font-semibold text-primary mb-3">
              Initialize New Project
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 max-w-xl">
              Create an isolated project container for document vectorization, entity memory graph extraction, and contextual RAG chat.
            </p>

            <form
              ref={formRef}
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={submit}
            >
              <input
                className="forge-input flex-1"
                name="name"
                required
                placeholder="Project title (e.g., Financial Ledger Analysis)"
              />
              <button
                className="forge-button whitespace-nowrap"
                disabled={create.isPending}
                type="submit"
              >
                {create.isPending ? "Creating…" : "Initialize Project"}
              </button>
            </form>
          </div>

          {/* System Telemetry Side Panel */}
          <div className="level-1 p-6 rounded-DEFAULT border border-outline-variant flex flex-col justify-between">
            <div>
              <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest mb-4">
                Architecture Standard
              </div>
              <ul className="space-y-3 font-body-sm text-on-surface-variant">
                <li className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                  <span>Storage Engine</span>
                  <span className="font-mono-code text-primary">MongoDB / FS</span>
                </li>
                <li className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                  <span>Search Pipeline</span>
                  <span className="font-mono-code text-primary">Hybrid Lexical+Vector</span>
                </li>
                <li className="flex items-center justify-between py-1.5">
                  <span>Worker Queue</span>
                  <span className="font-mono-code text-primary">BullMQ / Redis</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 p-3 level-2 rounded-DEFAULT border border-outline-variant font-mono-code text-mono-label text-on-surface-variant">
              [STATUS] All background indexing workers operational.
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <h2 className="font-headline-lg text-headline-lg font-semibold text-primary">Active Workspaces</h2>
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
              Showing {data.projects.length} Items
            </span>
          </div>

          {data.projects.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.projects.map((project) => (
                <article
                  className="level-1 p-6 rounded-DEFAULT border border-outline-variant hover:border-primary/50 transition-all duration-150 flex flex-col justify-between group"
                  key={project._id}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-8 h-8 rounded-DEFAULT bg-surface-container-highest border border-outline-variant flex items-center justify-center font-mono-label font-bold text-primary">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="status-chip status-pending font-mono-label">
                          {project.role}
                        </span>
                        {project.role === "owner" && (
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this project?")) {
                                remove.mutate(project._id);
                              }
                            }}
                            className="font-mono-label text-mono-label text-error hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <Link
                      className="font-headline-lg text-headline-lg font-semibold text-primary group-hover:text-white block truncate mb-2"
                      to={`/projects/${project._id}`}
                    >
                      {project.name}
                    </Link>

                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-6">
                      {project.description || "Project container ready for document ingestion and semantic search."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between text-mono-label font-mono-label text-on-surface-variant">
                    <span>ID: {project._id.slice(-8)}</span>
                    <Link
                      to={`/projects/${project._id}`}
                      className="ghost-button !py-1 !px-2 text-xs flex items-center gap-1"
                    >
                      Open Workspace
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="level-1 p-12 text-center rounded-DEFAULT border border-outline-variant">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">folder_off</span>
              <p className="font-body-md text-on-surface-variant mb-4">No active projects found in this workspace.</p>
              <p className="font-mono-label text-mono-label text-on-surface-variant">Use the form above to initialize your first project.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
