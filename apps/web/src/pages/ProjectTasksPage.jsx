import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function ProjectTasksPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");

  const tasksQuery = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/tasks`)).data.tasks,
  });

  const create = useMutation({
    mutationFn: (taskItem) =>
      api.post(`/projects/${projectId}/tasks`, taskItem),
    onSuccess: () => {
      setTitle("");
      setPriority("medium");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (err) =>
      setError(err.response?.data?.error?.message || "Failed to create task."),
  });

  const update = useMutation({
    mutationFn: ({ taskId, updates }) =>
      api.patch(`/projects/${projectId}/tasks/${taskId}`, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  const remove = useMutation({
    mutationFn: (taskId) =>
      api.delete(`/projects/${projectId}/tasks/${taskId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title: title.trim(), priority });
  }

  if (tasksQuery.isLoading)
    return (
      <div className="p-8 text-center text-on-surface-variant font-mono-code text-[13px]">
        Loading project tasks...
      </div>
    );

  const tasks = tasksQuery.data || [];

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const getPriorityBadge = (p) => {
    if (p === "high")
      return (
        <span className="text-[11px] font-mono-label text-error uppercase tracking-widest border border-error/30 bg-error/10 px-1 py-0.5 rounded-sm">High</span>
      );
    if (p === "medium")
      return (
        <span className="text-[11px] font-mono-label text-warning uppercase tracking-widest border border-warning/30 bg-warning/10 px-1 py-0.5 rounded-sm">Med</span>
      );
    return (
      <span className="text-[11px] font-mono-label text-success uppercase tracking-widest border border-success/30 bg-success/10 px-1 py-0.5 rounded-sm">Low</span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
          <span>Task Ledger</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Title area */}
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter">Issue Tracking</h2>
          <p className="mt-2 text-on-surface-variant max-w-2xl text-[13px] font-mono-code">
            Keep track of pending engineering work, architectural revisions, and roadmap bugs explicitly inside your Forge workspace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="flex gap-2 max-w-4xl">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary transition-colors py-3 px-3 text-primary font-mono-code text-[14px] outline-none placeholder:text-outline"
            autoFocus
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-32 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary transition-colors py-3 px-2 text-primary font-mono-code text-[12px] outline-none cursor-pointer"
          >
            <option value="low">Low Pri</option>
            <option value="medium">Medium Pri</option>
            <option value="high">High Pri</option>
          </select>
          <button
            type="submit"
            disabled={!title.trim() || create.isPending}
            className="bg-primary text-on-primary px-6 rounded font-mono-label text-mono-label disabled:opacity-50 hover:bg-primary-container transition-colors active:scale-[0.98]"
          >
            {create.isPending ? "Adding..." : "Add"}
          </button>
        </form>

        {error && (
          <div className="p-3 level-1 border-error/50 text-error font-mono-code text-[11px] rounded flex items-center gap-2 max-w-4xl">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            {error}
          </div>
        )}

        {/* Tasks Lists Container */}
        <div className="max-w-4xl space-y-8">
          <div className="space-y-3">
            <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 flex justify-between">
              <span>Open Issues</span>
              <span>[{pendingTasks.length}]</span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-12 border border-dashed border-outline-variant rounded-DEFAULT text-center flex items-center justify-center">
                <span className="font-mono-code text-[13px] text-tertiary">Zero unhandled exceptions or pending tasks.</span>
              </div>
            ) : (
              <div className="border border-outline-variant rounded-DEFAULT bg-surface-container overflow-hidden divide-y divide-outline-variant">
                {pendingTasks.map((task) => (
                  <div key={task._id} className="level-2 hover:bg-surface-container-high transition-colors flex items-center px-4 py-3 group">
                    {/* Checkbox */}
                    <button
                      onClick={() => update.mutate({ taskId: task._id, updates: { status: "completed" } })}
                      className="w-6 h-6 shrink-0 border border-outline-variant rounded-sm flex items-center justify-center text-transparent hover:text-success hover:border-success transition-colors group-hover:bg-surface-container-highest mr-4"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center overflow-hidden pr-4">
                      <span className="text-[13px] font-mono-code text-primary truncate leading-tight">{task.title}</span>
                      <span className="text-[10px] font-mono-code text-tertiary">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Badges & Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      {getPriorityBadge(task.priority)}
                      <button
                        onClick={() => remove.mutate(task._id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded hover:bg-surface-container-highest"
                        title="Drop Task"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {completedTasks.length > 0 && (
            <div className="space-y-3" style={{ opacity: 0.6 }}>
              <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 flex justify-between">
                <span>Resolved Issues</span>
                <span>[{completedTasks.length}]</span>
              </div>

              <div className="border border-outline-variant rounded-DEFAULT bg-surface-container overflow-hidden divide-y divide-outline-variant">
                {completedTasks.map((task) => (
                  <div key={task._id} className="flex items-center px-4 py-3 group bg-surface-container-lowest">
                    {/* Reopen Checkbox */}
                    <button
                      onClick={() => update.mutate({ taskId: task._id, updates: { status: "pending" } })}
                      className="w-6 h-6 shrink-0 border border-success bg-success/20 text-success rounded-sm flex items-center justify-center transition-colors hover:bg-success/30 mr-4"
                      title="Reopen Task"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center overflow-hidden pr-4">
                      <span className="text-[13px] font-mono-code text-tertiary line-through truncate leading-tight">{task.title}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center shrink-0">
                      <button
                        onClick={() => remove.mutate(task._id)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1 rounded hover:bg-surface-container-highest"
                        title="Drop permanently"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
