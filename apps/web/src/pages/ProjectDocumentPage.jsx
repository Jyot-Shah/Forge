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
      <div className="p-8 text-center text-on-surface-variant font-mono-code text-[13px]">
        Loading document extraction graph...
      </div>
    );
  if (req.isError)
    return (
      <div className="p-8 text-center text-error font-mono-code text-[13px]">
        Failed to load document details.
      </div>
    );

  const { originalFilename, byteSize, mimeType, createdAt, status, chunks } =
    req.data;
  const totalTokens =
    chunks?.reduce((acc, c) => acc + (c.tokenCount || 0), 0) || 0;

  const statusChipClass = `status-chip status-${status || "pending"}`;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="level-1 rounded-DEFAULT p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}/documents`}
            className="font-mono-label text-mono-label text-primary hover:text-on-surface transition flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">
              arrow_back
            </span>
            Back to Library
          </Link>
        </div>
        <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter mt-4">
          {originalFilename}
        </h2>

        <div className="flex flex-wrap gap-3 mt-2">
          <div className="px-4 py-2 level-2 rounded-DEFAULT border border-outline-variant">
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest block mb-1">
              Status
            </span>
            <span className={statusChipClass}>{status}</span>
          </div>
          <div className="px-4 py-2 level-2 rounded-DEFAULT border border-outline-variant">
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest block mb-1">
              Size & Type
            </span>
            <span className="font-mono-code text-mono-code text-primary">
              {formatBytes(byteSize)} • {mimeType}
            </span>
          </div>
          <div className="px-4 py-2 level-2 rounded-DEFAULT border border-outline-variant">
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest block mb-1">
              Extracts
            </span>
            <span className="font-mono-code text-mono-code text-primary">
              {chunks?.length || 0} chunks
            </span>
          </div>
          <div className="px-4 py-2 level-2 rounded-DEFAULT border border-outline-variant">
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest block mb-1">
              Total Tokens
            </span>
            <span className="font-mono-code text-mono-code text-primary">
              {totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 pb-20">
        <h3 className="font-headline-lg text-headline-lg text-primary px-2">
          Knowledge Embeddings
        </h3>
        {!chunks || chunks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-outline text-4xl">
              data_array
            </span>
            <p className="font-mono-code text-mono-code text-on-surface-variant">
              No readable knowledge chunks were successfully generated for this
              document yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chunks.map((chunk) => (
              <div
                key={chunk._id}
                className="level-1 flex flex-col p-5 rounded-DEFAULT border border-outline-variant space-y-3"
              >
                <div className="flex justify-between items-center font-mono-label text-mono-label text-on-surface-variant mb-2 border-b border-outline-variant/30 pb-2">
                  <span className="text-primary">Idx: {chunk.chunkIndex}</span>
                  <span>{chunk.tokenCount} tokens</span>
                </div>
                <div className="overflow-y-auto max-h-64 flex-1">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-primary font-mono-code">
                    {chunk.content}
                  </p>
                </div>
                <div className="pt-2 border-t border-outline-variant/30 font-mono-code text-[10px] uppercase text-on-surface-variant truncate">
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
