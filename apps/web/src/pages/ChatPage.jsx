import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { api } from "../api/client.js";

function roleLabel(role) {
  return role === "assistant"
    ? "Forge AI"
    : role === "system"
      ? "System"
      : "User";
}

export default function ChatPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(
    searchParams.get("c") || null,
  );
  const [activeConversation, setActiveConversation] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const conversations = useQuery({
    queryKey: ["conversations", projectId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/chat`)).data.conversations,
  });

  const activeChat = useQuery({
    queryKey: ["conversation", projectId, conversationId],
    queryFn: async () =>
      (await api.get(`/projects/${projectId}/chat/${conversationId}`)).data,
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (activeChat.data) {
      setMessages(activeChat.data.messages || []);
      setActiveConversation(activeChat.data.conversation);
    } else if (!conversationId) {
      setMessages([]);
      setActiveConversation(null);
    }
  }, [activeChat.data, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  const send = useMutation({
    mutationFn: ({ content, activeConversationId }) =>
      api.post(`/projects/${projectId}/chat`, {
        content,
        conversationId: activeConversationId,
      }),
    onSuccess: ({ data }, variables) => {
      if (!conversationId) {
        setConversationId(data.conversation._id);
      }
      setMessages((current) => [...current, data.message]);
      setActiveConversation(data.conversation);
      setError("");
      conversations.refetch();
    },
    onError: (mutationError) => {
      const status = mutationError.response?.status;
      let msg =
        mutationError.response?.data?.error?.message ||
        "Unable to send message.";
      if (status === 429)
        msg = "Rate limit exceeded. Please wait a moment and try again.";
      setError(msg);
    },
  });

  const removeConversation = useMutation({
    mutationFn: () =>
      api.delete(`/projects/${projectId}/chat/${conversationId}`),
    onSuccess: () => {
      setConversationId(null);
      conversations.refetch();
    },
  });

  const exportChat = () => {
    let md = `# ${activeConversation?.title || "Exported Chat"}\n\n`;
    messages.forEach((m) => {
      md += `### ${roleLabel(m.role)}\n\n${m.content}\n\n`;
    });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${activeConversation?._id || "export"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  function submit(event) {
    event.preventDefault();
    const content = text.trim();
    if (!content || send.isPending) return;
    setError("");
    setText("");
    if (!conversationId)
      setMessages((current) => [...current, { role: "user", content }]);
    else setMessages((current) => [...current, { role: "user", content }]);
    send.mutate({ content, activeConversationId: conversationId });
  }

  return (
    <section className="flex h-full bg-surface border border-outline-variant rounded-DEFAULT overflow-hidden">
      <div
        className={`${sidebarOpen ? "fixed inset-0 z-30 md:static md:z-auto" : "hidden md:flex"} w-72 border-r border-outline-variant bg-surface-container-lowest flex-col shrink-0 md:flex`}
      >
        <div className="h-12 border-b border-outline-variant flex items-center px-4 shrink-0 bg-surface-container-low justify-between">
          <h2 className="font-mono-label text-mono-label text-on-surface-variant uppercase tracking-widest">
            Chat Sessions
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-on-surface-variant hover:text-primary p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-2 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1.5 text-[16px] text-tertiary">
              search
            </span>
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-outline-variant/50 rounded-sm pl-8 pr-3 py-1.5 font-mono-code text-[12px] text-primary focus:outline-none focus:border-primary transition-colors placeholder:text-tertiary"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          <button
            onClick={() => setConversationId(null)}
            className={`w-full text-left px-3 py-2 rounded-sm font-mono-code text-[13px] flex items-center gap-2 transition-colors ${
              !conversationId
                ? "bg-primary text-on-primary font-bold"
                : "text-primary hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              add_box
            </span>
            New Session
          </button>

          <div className="pt-2">
            {conversations.isLoading ? (
              <p className="px-3 py-2 font-mono-code text-[11px] text-tertiary">
                Loading index...
              </p>
            ) : conversations.data?.length ? (
              <div className="space-y-[1px]">
                {conversations.data
                  .filter((c) =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((conv) => (
                    <button
                      key={conv._id}
                      onClick={() => setConversationId(conv._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-sm transition-colors group ${
                        conversationId === conv._id
                          ? "bg-surface-container-highest border-l-2 border-primary"
                          : "border-l-2 border-transparent hover:bg-surface-container"
                      }`}
                    >
                      <p
                        className={`truncate font-mono-code text-[12px] leading-tight ${conversationId === conv._id ? "text-primary font-bold" : "text-on-surface-variant group-hover:text-primary"}`}
                      >
                        {conv.title}
                      </p>
                      <p className="mt-1 font-mono-code text-[10px] text-tertiary">
                        {new Date(
                          conv.lastMessageAt || conv.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
              </div>
            ) : (
              <p className="px-3 py-2 font-mono-code text-[11px] text-tertiary">
                No historical sessions.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-surface bg-grid-pattern">
        <header className="h-12 border-b border-outline-variant bg-surface-container/80 flex items-center px-4 justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-on-surface-variant hover:text-primary p-1"
            >
              <span className="material-symbols-outlined text-[18px]">
                menu
              </span>
            </button>
            <div className="font-mono-code text-[13px] text-primary truncate max-w-[200px] md:max-w-none">
              {conversationId
                ? activeConversation?.title || "Active session"
                : "Initialize connection to query source context..."}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {conversationId && (
              <div className="flex items-center gap-1 mr-2 border-r border-outline-variant pr-3">
                <button
                  onClick={exportChat}
                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-colors"
                  title="Export Chat to Markdown"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this conversation?")) {
                      removeConversation.mutate();
                    }
                  }}
                  disabled={removeConversation.isPending}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container rounded transition-colors"
                  title="Delete Conversation"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            )}
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="font-mono-label text-[10px] text-success uppercase tracking-widest hidden md:inline-block">
                Active
              </span>
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <article
                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
                key={`${index}-${message.role}`}
              >
                <div
                  className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%]`}
                >
                  <div
                    className={`flex items-center gap-2 px-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <span className="font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                      {message.role === "assistant" && (
                        <span className="material-symbols-outlined text-[12px]">
                          smart_toy
                        </span>
                      )}
                      {message.role === "user" && (
                        <span className="material-symbols-outlined text-[12px]">
                          person
                        </span>
                      )}
                      {roleLabel(message.role)}
                    </span>
                  </div>

                  <div
                    className={`rounded-sm p-4 text-[13px] leading-relaxed shadow-sm font-sans ${
                      message.role === "user"
                        ? "bg-surface-container-highest border border-outline-variant text-white"
                        : "bg-surface-container border border-outline-variant text-slate-100"
                    }`}
                  >
                    <div
                      className={`prose prose-sm max-w-none prose-invert ${
                        message.role === "user"
                          ? "prose-p:text-slate-100 prose-headings:text-white prose-strong:text-white prose-code:text-cyan-300"
                          : "prose-p:text-slate-200 prose-headings:text-white prose-strong:text-white prose-code:text-cyan-300"
                      } prose-p:leading-relaxed prose-pre:bg-surface-container-lowest prose-pre:border prose-pre:border-outline-variant prose-pre:rounded-sm prose-code:font-mono-code prose-a:text-cyan-400`}
                    >
                      <ReactMarkdown>
                        {message.content === "null" || !message.content
                          ? "I could not generate a response."
                          : message.content}
                      </ReactMarkdown>
                    </div>

                    {message.citations?.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-outline-variant/50 pt-3">
                        <div className="flex items-center gap-1 font-mono-label text-[10px] uppercase tracking-widest text-slate-400">
                          <span className="material-symbols-outlined text-[12px]">
                            library_books
                          </span>
                          Cited Context
                        </div>
                        <ul className="space-y-1.5 list-none m-0 p-0">
                          {message.citations.map((citation, i) => (
                            <li
                              key={`${citation.chunkId}-${i}`}
                              className="rounded-xs border border-outline-variant/50 bg-surface-container-lowest px-2.5 py-1.5 flex flex-col font-mono-code text-[11px] leading-snug"
                            >
                              <span className="font-medium text-cyan-400">
                                {citation.documentName ||
                                  `Chunk ${citation.chunkId?.slice(-6)}`}
                              </span>
                              <span className="text-slate-300 truncate">
                                {citation.excerpt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 border border-dashed border-outline-variant rounded-DEFAULT bg-surface-container-lowest">
              <span className="material-symbols-outlined text-outline text-4xl mb-3">
                forum
              </span>
              <p className="font-mono-code text-on-surface-variant text-[13px] text-center max-w-sm">
                Initialize query sequence. The Forge AI model has full lexical
                and semantic access to your project documents and contextual
                memory index.
              </p>
            </div>
          )}

          {send.isPending && (
            <article className="flex w-full justify-start">
              <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[75%]">
                <div className="flex items-center gap-2 px-1 justify-start">
                  <span className="font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] animate-spin">
                      smart_toy
                    </span>
                    Forge AI
                  </span>
                </div>
                <div className="rounded-sm p-4 text-[13px] leading-relaxed bg-surface-container border border-outline-variant text-on-surface-variant font-mono-code flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Analyzing project knowledge base and generating grounded
                  response...
                </div>
              </div>
            </article>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="p-4 bg-surface-container-lowest border-t border-outline-variant"
          onSubmit={submit}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 relative">
              <div className="absolute top-3 left-3 text-tertiary font-mono-code text-[14px]">
                $
              </div>
              <textarea
                className="flex-1 min-h-[5rem] max-h-[15rem] bg-surface border border-outline-variant rounded-sm px-8 py-3 font-mono-code text-[13px] text-primary focus:border-primary outline-none transition-colors resize-none placeholder:text-outline"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Enter query..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
              />
              <button
                className="bg-primary text-on-primary px-6 rounded-sm font-mono-label text-[12px] uppercase tracking-wider disabled:opacity-50 hover:bg-primary-container transition-colors active:scale-[0.98] flex flex-col items-center justify-center gap-1"
                disabled={send.isPending || !text.trim()}
                type="submit"
              >
                <span className="material-symbols-outlined text-[20px]">
                  send
                </span>
                <span>{send.isPending ? "Executing" : "Send"}</span>
              </button>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="font-mono-code text-[10px] text-tertiary">
                Press Enter to execute, Shift+Enter for newline
              </span>
              {error && (
                <span className="font-mono-code text-[10px] text-error">
                  {error}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
