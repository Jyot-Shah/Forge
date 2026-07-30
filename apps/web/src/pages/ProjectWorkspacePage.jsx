import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function statusClass(status) {
  return `status-chip status-${status || "pending"}`;
}

export default function ProjectWorkspacePage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const documents = useQuery({
    queryKey: ["documents", projectId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/documents`)).data.documents,
    refetchInterval: (query) =>
      query.state.data?.some(
        (document) =>
          document.status === "pending" || document.status === "processing",
      )
        ? 1500
        : false,
  });

  const upload = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post(`/projects/${projectId}/documents`, formData);
    },
    onSuccess: () => {
      setSelectedFile(null);
      setUploadError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
    onError: (error) => {
      setUploadError(error.response?.data?.error?.message || "Upload failed.");
    },
  });

  const removeDocument = useMutation({
    mutationFn: (documentId) =>
      api.delete(`/projects/${projectId}/documents/${documentId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] }),
  });

  const renameDocument = useMutation({
    mutationFn: ({ documentId, newName }) =>
      api.patch(`/projects/${projectId}/documents/${documentId}`, {
        originalFilename: newName,
      }),
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["documents", projectId] });
    },
  });

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError("");
    upload.mutate(file);
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError("");
      upload.mutate(file);
    }
  };

  return (
    <section
      className={`flex flex-col h-full bg-surface transition-colors ${isDragging ? "bg-primary/5 border-2 border-dashed border-primary" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Toolbar */}
      <header className="h-12 border-b border-outline-variant bg-surface-container-low flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
          <span className="material-symbols-outlined text-[16px]">
            local_library
          </span>
          <span>Document Library</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-primary text-on-primary py-1 px-3 rounded hover:bg-primary-container transition-colors font-mono-label text-mono-label flex items-center gap-2 active:scale-[0.98]"
            onClick={() => fileInputRef.current?.click()}
            disabled={upload.isPending}
          >
            <span className="material-symbols-outlined text-[14px]">
              upload
            </span>
            {upload.isPending ? "Queuing..." : "Upload Source"}
          </button>
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            accept=".txt,.md,.markdown,.json,text/plain,text/markdown,application/json"
            onChange={handleUpload}
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Search */}
        <div className="flex justify-start">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-tertiary">
              search
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm pl-9 pr-3 py-2 font-mono-code text-[12px] text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-tertiary"
            />
          </div>
        </div>

        {/* Upload Status Area */}
        {selectedFile && (
          <div className="level-1 p-3 rounded-DEFAULT border border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">
                description
              </span>
              <div>
                <p className="font-mono-code text-mono-code text-primary">
                  {selectedFile.name}
                </p>
                <p className="font-mono-code text-mono-code text-[11px] text-on-surface-variant flex items-center gap-1">
                  {formatBytes(selectedFile.size)}
                  {upload.isPending && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse ml-2" />{" "}
                      Uploading block...
                    </>
                  )}
                  {uploadError && (
                    <span className="text-error ml-2">ERR: {uploadError}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document List */}
        <div>
          <div className="h-10 px-4 bg-surface-container-low border border-outline-variant rounded-t-DEFAULT flex items-center font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
            <div className="w-1/2">File Structure</div>
            <div className="w-1/4 hidden md:block">Metadata</div>
            <div className="w-1/4 text-right">Status & Controls</div>
          </div>

          <div className="border border-t-0 border-outline-variant rounded-b-DEFAULT bg-surface-container overflow-hidden">
            {documents.isLoading ? (
              <div className="p-4 font-mono-code text-mono-code text-on-surface-variant text-center">
                Reading indices...
              </div>
            ) : documents.data?.length ? (
              <div className="divide-y divide-outline-variant">
                {documents.data
                  .filter((d) =>
                    d.originalFilename
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((document) => (
                    <div
                      key={document._id}
                      className="level-2 hover:bg-surface-container-high transition-colors flex items-center px-4 py-3 group"
                    >
                      {/* File Name */}
                      <div className="w-1/2 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          text_snippet
                        </span>
                        {editingId === document._id ? (
                          <div className="flex items-center gap-2 w-full max-w-xs">
                            <input
                              autoFocus
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (editingName.trim()) {
                                    renameDocument.mutate({
                                      documentId: document._id,
                                      newName: editingName.trim(),
                                    });
                                  } else {
                                    setEditingId(null);
                                  }
                                } else if (e.key === "Escape") {
                                  setEditingId(null);
                                }
                              }}
                              className="bg-surface-container border border-primary rounded-sm px-2 py-0.5 font-mono-code text-[12px] text-primary outline-none w-full"
                            />
                            <button
                              disabled={renameDocument.isPending}
                              onClick={() => {
                                if (editingName.trim()) {
                                  renameDocument.mutate({
                                    documentId: document._id,
                                    newName: editingName.trim(),
                                  });
                                }
                              }}
                              className="text-success hover:bg-surface-container p-0.5 rounded"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                check
                              </span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-error hover:bg-surface-container p-0.5 rounded"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                close
                              </span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <Link
                              to={`/projects/${projectId}/documents/${document._id}`}
                              className="font-mono-code text-mono-code text-primary hover:underline truncate max-w-[calc(100%-40px)]"
                            >
                              {document.originalFilename}
                            </Link>
                            <button
                              onClick={() => {
                                setEditingId(document._id);
                                setEditingName(document.originalFilename);
                              }}
                              className="text-tertiary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                edit
                              </span>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="w-1/4 hidden md:flex flex-col">
                        <span className="font-mono-code text-mono-code text-[11px] text-on-surface-variant">
                          Size: {formatBytes(document.byteSize)}
                        </span>
                        <span className="font-mono-code text-mono-code text-[11px] text-on-surface-variant">
                          MIME: {document.mimeType}
                        </span>
                      </div>

                      {/* Status/Controls */}
                      <div className="w-1/2 md:w-1/4 flex items-center justify-end gap-4">
                        {document.error ? (
                          <span
                            className="status-chip status-failed font-mono-label"
                            title={document.error}
                          >
                            Failed
                          </span>
                        ) : (
                          <span className={statusClass(document.status)}>
                            {document.status}
                          </span>
                        )}

                        <button
                          className="text-on-surface-variant hover:text-error transition-colors flex items-center"
                          onClick={() => {
                            if (
                              confirm(
                                `Permanently drop document segment '${document.originalFilename}'?`,
                              )
                            ) {
                              removeDocument.mutate(document._id);
                            }
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-outline text-4xl">
                  folder_off
                </span>
                <p className="font-mono-code text-mono-code text-on-surface-variant">
                  Zero documents indexed in current workspace view.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
