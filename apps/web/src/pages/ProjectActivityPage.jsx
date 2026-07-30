import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";

const ACTION_META = {
  document_upload: {
    icon: "upload_file",
    label: "Uploaded document",
    color: "text-tertiary",
  },
  document_delete: {
    icon: "delete",
    label: "Deleted document",
    color: "text-error",
  },
  chat_message: {
    icon: "forum",
    label: "Sent chat message",
    color: "text-primary",
  },
  memory_create: {
    icon: "neurology",
    label: "Created memory",
    color: "text-tertiary",
  },
  memory_delete: {
    icon: "delete_sweep",
    label: "Deleted memory",
    color: "text-error",
  },
  task_create: {
    icon: "add_task",
    label: "Created task",
    color: "text-tertiary",
  },
  task_update: { icon: "edit", label: "Updated task", color: "text-primary" },
  task_delete: { icon: "delete", label: "Deleted task", color: "text-error" },
  search_query: {
    icon: "search",
    label: "Searched project",
    color: "text-on-surface-variant",
  },
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProjectActivityPage() {
  const { projectId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["activities", projectId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/activities?limit=50`)).data
        .activities,
    refetchInterval: 15000,
  });

  return (
    <section className="flex flex-col h-full bg-surface">
      {/* Toolbar */}
      <header className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">
            timeline
          </span>
          <span>Activity Timeline</span>
        </div>
        <span className="font-mono-label text-mono-label text-on-surface-variant">
          {data?.length ?? "—"} Events
        </span>
      </header>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-8 text-center font-mono-code text-on-surface-variant">
            Loading activity feed…
          </div>
        ) : !data?.length ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-outline text-4xl">
              history
            </span>
            <p className="font-mono-code text-mono-code text-on-surface-variant">
              No activity recorded yet. Start uploading documents, chatting, or
              creating tasks.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-outline-variant/40" />

            <div className="space-y-1">
              {data.map((activity) => {
                const meta = ACTION_META[activity.action] || {
                  icon: "info",
                  label: activity.action,
                  color: "text-on-surface-variant",
                };
                return (
                  <div
                    key={activity._id}
                    className="relative flex items-start gap-4 pl-10 py-2.5 group hover:bg-surface-container-low/50 rounded-DEFAULT transition-colors"
                  >
                    {/* Dot */}
                    <div
                      className={`absolute left-[13px] top-3.5 w-[9px] h-[9px] rounded-full border-2 border-surface-container bg-outline-variant group-hover:bg-primary transition-colors`}
                    />

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-DEFAULT bg-surface-container-high border border-outline-variant/30 flex items-center justify-center shrink-0">
                      <span
                        className={`material-symbols-outlined text-[16px] ${meta.color}`}
                      >
                        {meta.icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-body-sm text-primary">
                        {meta.label}
                        {activity.metadata?.filename && (
                          <span className="text-on-surface-variant ml-1.5">
                            — {activity.metadata.filename}
                          </span>
                        )}
                        {activity.metadata?.title && (
                          <span className="text-on-surface-variant ml-1.5">
                            — {activity.metadata.title}
                          </span>
                        )}
                        {activity.metadata?.preview && (
                          <span className="text-on-surface-variant ml-1.5">
                            — "{activity.metadata.preview}"
                          </span>
                        )}
                        {activity.metadata?.query && (
                          <span className="text-on-surface-variant ml-1.5">
                            — "{activity.metadata.query}"
                          </span>
                        )}
                        {activity.metadata?.type && (
                          <span className="ml-1.5 status-chip status-pending text-[9px]">
                            {activity.metadata.type}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="font-mono-code text-mono-code text-[11px] text-on-surface-variant shrink-0 mt-0.5">
                      {relativeTime(activity.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
