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
    <div className="mx-auto max-w-2xl space-y-6">
      <form
        onSubmit={handleSubmit}
        className="surface flex flex-col gap-6 rounded-2xl p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Project Settings</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update configuration for {project.name}.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-300">Name</span>
            <input
              type="text"
              className="forge-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-300">
              Description
            </span>
            <textarea
              className="forge-textarea min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
            />
          </label>
        </div>
        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
          {error ? <p className="text-sm text-rose-400">{error}</p> : <div />}
          <button
            disabled={update.isPending}
            type="submit"
            className="forge-button px-6 py-2"
          >
            {update.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="surface rounded-2xl p-6 border border-rose-900/30">
        <h3 className="text-lg font-semibold text-rose-400">Danger Zone</h3>
        <p className="mt-1 text-sm text-slate-400">
          Permanently delete this project and all of its memories, files, and
          chats. This action cannot be undone.
        </p>
        <div className="mt-4">
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you absolutely sure you want to delete this project?",
                )
              )
                destroy.mutate();
            }}
            disabled={destroy.isPending}
            className="rounded-xl bg-rose-500/10 px-6 py-2 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20"
          >
            {destroy.isPending ? "Deleting..." : "Delete Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
