import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function ProjectSearchPage() {
  const { projectId } = useParams();
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const searchQuery = useQuery({
    queryKey: ["search", projectId, activeSearch],
    queryFn: async () =>
      (await api.post(`/projects/${projectId}/search`, { query: activeSearch }))
        .data,
    enabled: !!activeSearch,
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) setActiveSearch(query.trim());
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top Toolbar */}
      <header className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span>Global Knowledge Search</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6 pb-32">
        {/* Title area */}
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter">Hybrid Search Engine</h2>
          <p className="mt-2 text-on-surface-variant max-w-2xl text-[13px] font-mono-code">
            Uses Reciprocal Rank Fusion to combine the best results from both semantic embedding vectors and lexical text matching across documents and extracted memories.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-4xl">
          <div className="flex-1 flex items-center bg-surface-container-lowest border border-outline-variant rounded focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline px-3">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for context, variables, or architecture concepts..."
              className="flex-1 bg-transparent py-3 pr-3 text-primary font-mono-code text-[14px] outline-none placeholder:text-outline"
              autoFocus
            />
            {activeSearch && (
              <span className="px-3 font-mono-code text-[11px] text-tertiary border-l border-outline-variant/30 hidden md:block">
                RRF Enabled
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!query.trim() || searchQuery.isLoading}
            className="bg-primary text-on-primary px-6 rounded font-mono-label text-mono-label disabled:opacity-50 hover:bg-primary-container transition-colors active:scale-[0.98]"
          >
            {searchQuery.isLoading ? "Scanning..." : "Execute"}
          </button>
        </form>

        {searchQuery.isError && (
          <div className="p-3 level-1 border-error/50 text-error font-mono-code text-[11px] rounded flex items-center gap-2 max-w-4xl">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Error: {searchQuery.error.response?.data?.error?.message || "Failed to perform hybrid search."}
          </div>
        )}

        {!searchQuery.isLoading &&
          !searchQuery.isError &&
          activeSearch &&
          !searchQuery.data?.memories?.length &&
          !searchQuery.data?.results?.length && (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-outline text-4xl">search_off</span>
              <p className="font-mono-code text-mono-code text-on-surface-variant">Zero semantic or lexical matches found for "{activeSearch}".</p>
            </div>
          )}

        {/* Extracted AI Memories */}
        {searchQuery.data?.memories?.length > 0 && (
          <div className="space-y-3 max-w-4xl">
            <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2">
              Extracted AI Memories
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchQuery.data.memories.map((memory) => (
                <div key={memory._id} className="level-1 p-4 rounded-DEFAULT flex flex-col relative overflow-hidden group">
                  <div className="flex items-center justify-between z-10">
                    <span className="inline-flex items-center justify-center rounded-sm border border-outline-variant bg-surface-container-highest px-1.5 py-0.5 font-mono-label text-[10px] uppercase text-on-surface-variant w-min">
                      {memory.type}
                    </span>
                    <span className="text-[11px] font-mono-code text-tertiary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">analytics</span>
                      {Math.round((memory.confidence || 0) * 100)}% Match
                    </span>
                  </div>
                  <p className="text-[13px] font-mono-code text-primary mt-3 leading-relaxed whitespace-pre-wrap z-10">
                    {memory.content}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document References */}
        {searchQuery.data?.results?.length > 0 && (
          <div className="space-y-3 max-w-4xl mt-8">
            <div className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2">
              Document References
            </div>
            <div className="space-y-3">
              {searchQuery.data.results.map((chunk, index) => (
                <div key={chunk._id} className="level-1 rounded-DEFAULT overflow-hidden">
                  <div className="flex justify-between items-center bg-surface-container border-b border-outline-variant px-3 py-2">
                    <span className="text-[11px] font-mono-code text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">data_object</span>
                      Chunk ID: {chunk._id.slice(-8)}
                    </span>
                    <span className="text-[11px] font-mono-code text-tertiary">
                      Fusion Score: {chunk.score?.toFixed(4)}
                    </span>
                  </div>
                  <div className="p-4 bg-surface-container-lowest">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-primary font-mono-code">
                      {chunk.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
