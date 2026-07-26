import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export default function ProjectDocumentPage() {
  const { projectId, documentId } = useParams();

  const req = useQuery({
    queryKey: ["document", projectId, documentId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/documents/${documentId}`)).data
        .document,
  });

  if (req.isLoading)
    return (
      <div className="p-8 text-center text-slate-400">
        Loading document extraction graph...
      </div>
    );
  if (req.isError)
    return (
      <div className="p-8 text-center text-rose-400">
        Failed to load document details.
      </div>
    );

  const { originalFilename, byteSize, mimeType, createdAt, status, chunks } =
    req.data;
  const totalTokens =
    chunks?.reduce((acc, c) => acc + (c.tokenCount || 0), 0) || 0;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="surface flex flex-col gap-4 rounded-[24px] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}/documents`}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition"
          >
            &larr; Back to Workspace
          </Link>
        </div>
        <h2 className="text-2xl mt-4 font-bold tracking-tight text-white">
          {originalFilename}
        </h2>

        <div className="flex flex-wrap gap-4 mt-2">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs uppercase text-slate-500 block mb-1">
              Status
            </span>
            <span className={`text-sm font-semibold status-${status}`}>
              {status}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs uppercase text-slate-500 block mb-1">
              Size & Type
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {formatBytes(byteSize)} • {mimeType}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs uppercase text-slate-500 block mb-1">
              Extracts
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {chunks?.length || 0} chunks
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-xs uppercase text-slate-500 block mb-1">
              Total Tokens
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 pb-20">
        <h3 className="text-xl font-semibold text-white px-2">
          Knowledge Embeddings
        </h3>
        {!chunks || chunks.length === 0 ? (
          <div className="text-slate-500 italic px-2">
            No readable knowledge chunks were successfully generated for this
            document yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chunks.map((chunk, index) => (
              <div
                key={chunk._id}
                className="surface flex flex-col p-5 rounded-2xl border border-white/5 space-y-3"
              >
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2 border-b border-white/5 pb-2">
                  <span className="font-mono text-cyan-400">
                    Idx: {chunk.chunkIndex}
                  </span>
                  <span>{chunk.tokenCount} tokens</span>
                </div>
                <div className="prose prose-invert prose-sm overflow-y-auto max-h-64 flex-1">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-mono">
                    {chunk.content}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] uppercase text-slate-600 truncate">
                  Hash: {chunk.contentHash}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
