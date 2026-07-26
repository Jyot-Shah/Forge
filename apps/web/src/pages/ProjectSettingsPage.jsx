import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client.js";

export default function ProjectSettingsPage() {
  const { project } = useOutletContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
  }, [project]);

  const update = useMutation({
    mutationFn: (updates) => api.patch(`/projects/${project._id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project._id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setError("");
    },
    onError: (err) =>
      setError(
        err.response?.data?.error?.message || "Failed to update project.",
      ),
  });

  const destroy = useMutation({
    mutationFn: () => api.delete(`/projects/${project._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
    onError: (err) =>
      setError(
        err.response?.data?.error?.message || "Failed to delete project.",
      ),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError("Project name is required");
    update.mutate({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Top Toolbar */}
      <header className="pb-4 border-b border-outline-variant flex items-center justify-between">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter">Project Settings</h2>
          <p className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest mt-1">
            Workspace Configuration & Access Control
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="level-1 p-6 md:p-8 rounded-DEFAULT border border-outline-variant space-y-6"
      >
        <div>
          <h3 className="font-headline-lg text-headline-lg font-semibold text-primary mb-1">General Properties</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Update workspace identity and description metadata.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="forge-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-mono-label text-mono-label text-on-surface-variant uppercase tracking-wider mb-1">
              Project Description
            </label>
            <textarea
              className="forge-textarea min-h-[6rem]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Architectural overview and technical scope..."
            />
          </div>
        </div>

        {error ? (
          <div className="p-3 level-2 rounded-DEFAULT border border-error-container text-error text-body-sm font-mono-code">
            {error}
          </div>
        ) : null}

        <div className="pt-4 border-t border-outline-variant/40 flex items-center justify-between">
          <span className="font-mono-code text-[11px] text-on-surface-variant">
            Project ID: <span className="text-primary">{project._id}</span>
          </span>
          <button
            disabled={update.isPending}
            type="submit"
            className="forge-button px-6 py-2"
          >
            {update.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="level-1 p-6 md:p-8 rounded-DEFAULT border border-error-container/60 bg-surface-container-lowest">
        <h3 className="font-headline-lg text-headline-lg font-semibold text-error mb-1">Danger Zone</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
          Permanently drop this project container along with all associated indexed document chunks, Qdrant vectors, memory graph facts, and historical conversations.
        </p>

        <button
          onClick={() => {
            if (
              window.confirm(
                `Permanently delete project workspace '${project.name}' and all indexed knowledge?`,
              )
            )
              destroy.mutate();
          }}
          disabled={destroy.isPending}
          className="ghost-button border-error text-error hover:bg-error-container/20 px-6 py-2"
        >
          {destroy.isPending ? "Deleting Workspace..." : "Delete Project Workspace"}
        </button>
      </div>
    </div>
  );
}
