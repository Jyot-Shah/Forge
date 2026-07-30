import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function ProjectMemoryPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "fact",
    "preference",
    "decision",
    "framework",
    "coding_style",
    "deadline",
    "task",
    "goal",
  ];

  const memoriesQuery = useQuery({
    queryKey: ["memories", projectId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/memories`)).data.memories,
  });

  const remove = useMutation({
    mutationFn: (memoryId) =>
      api.delete(`/projects/${projectId}/memories/${memoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories", projectId] });
    },
    onError: (err) =>
      setError(err.response?.data?.error?.message || "Failed to prune memory."),
  });

  if (memoriesQuery.isLoading)
    return (
      <div className="p-8 text-center text-on-surface-variant font-mono-code text-[13px]">
        Loading context memory graph...
      </div>
    );

  const memories = memoriesQuery.data || [];

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">
            neurology
          </span>
          <span>Context Engine</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Title area */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter">
              Memory Graph
            </h2>
            <p className="mt-2 text-on-surface-variant max-w-2xl text-[13px] font-mono-code">
              This ledger holds autonomous factual extractions derived from
              codebase scans and conversational interactions. Drop stale
              memories to realign AI focus.
            </p>
          </div>
          <div className="font-mono-code text-on-surface-variant text-[11px]">
            Total Entries:{" "}
            <span className="text-primary">{memories.length}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-outline-variant/50 pb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-mono-label text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface-container border-outline-variant/50 text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-tertiary">
              search
            </span>
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm pl-9 pr-3 py-2 font-mono-code text-[12px] text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-tertiary"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 level-1 border-error/50 text-error font-mono-code text-[11px] rounded flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px]">
              warning
            </span>
            {error}
          </div>
        )}

        <div className="border border-outline-variant rounded-DEFAULT bg-surface-container overflow-hidden">
          <div className="h-10 px-4 bg-surface-container-low border-b border-outline-variant flex items-center font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest sticky top-0 z-10">
            <div className="w-24 shrink-0">Class</div>
            <div className="w-24 shrink-0 px-4">Conf</div>
            <div className="flex-1 px-4">Derived Context Block</div>
            <div className="w-20 shrink-0 text-right">Actions</div>
          </div>

          <div className="divide-y divide-outline-variant">
            {memories
              .filter(
                (m) =>
                  selectedCategory === "all" ||
                  m.category === selectedCategory ||
                  (!m.category && selectedCategory === "fact"),
              )
              .filter((m) =>
                m.content.toLowerCase().includes(searchQuery.toLowerCase()),
              ).length > 0 ? (
              memories
                .filter(
                  (m) =>
                    selectedCategory === "all" ||
                    m.category === selectedCategory ||
                    (!m.category && selectedCategory === "fact"),
                )
                .filter((m) =>
                  m.content.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((memory) => (
                  <div
                    key={memory._id}
                    className="level-2 hover:bg-surface-container-high transition-colors flex items-start px-4 py-3 group"
                  >
                    {/* Class / Category */}
                    <div className="w-24 shrink-0 flex flex-col gap-1 items-start justify-start pt-1">
                      <span className="inline-flex items-center justify-center rounded-sm border border-outline-variant bg-surface-container-highest px-1.5 py-0.5 font-mono-label text-[10px] uppercase text-on-surface-variant w-min">
                        {memory.type}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-sm bg-primary/20 text-primary px-1.5 py-0.5 font-mono-label text-[9px] uppercase w-min whitespace-nowrap">
                        {memory.category || "fact"}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div className="w-24 shrink-0 px-4 flex items-center pt-1 font-mono-code text-[12px] text-tertiary">
                      {Math.round((memory.confidence || 0) * 100)}%
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 text-[13px] font-mono-code text-primary leading-relaxed break-words whitespace-pre-wrap">
                      {memory.content}
                    </div>

                    {/* Actions */}
                    <div className="w-20 shrink-0 text-right flex justify-end">
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Permanently drop this context block from AI memory index?",
                            )
                          )
                            remove.mutate(memory._id);
                        }}
                        disabled={remove.isPending}
                        className="text-on-surface-variant hover:text-error transition-colors flex items-center p-1 rounded hover:bg-surface-container-highest"
                        title="Drop Context"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-outline text-4xl">
                  neurology
                </span>
                <p className="font-mono-code text-mono-code text-on-surface-variant">
                  Zero autonomous facts committed into memory space.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
