import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function ProjectDashboardPage() {
  const { projectId } = useParams();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}/stats`)).data,
  });

  if (isLoading || !stats) {
    return (
      <div className="p-8 text-center text-on-surface-variant font-mono-code text-[13px]">
        Loading project metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary tracking-tighter">System Overview</h2>
          <p className="font-mono-label text-mono-label text-on-surface-variant mt-2 uppercase tracking-widest">
            Environment: Production | Region: US-East
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="font-mono-label text-mono-label text-primary">All Systems Operational</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 */}
        <div className="level-1 p-4 rounded-DEFAULT relative overflow-hidden group">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="font-mono-label text-mono-label text-on-surface-variant uppercase">Storage Limit</p>
              <h3 className="font-headline-lg text-headline-lg text-primary mt-1">
                {(stats.totalStorageBytes / 1024 / 1024).toFixed(2)} <span className="text-[14px] font-normal text-on-surface-variant">MB</span>
              </h3>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">database</span>
          </div>
          <div className="mt-4 flex items-center gap-2 z-10 relative">
            <span className="material-symbols-outlined text-[14px] text-tertiary">trending_up</span>
            <span className="font-mono-code text-mono-code text-tertiary">Normal operation</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-30 group-hover:opacity-50 transition-opacity"></div>
        </div>

        {/* Stat Card 2 */}
        <div className="level-1 p-4 rounded-DEFAULT relative overflow-hidden group">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="font-mono-label text-mono-label text-on-surface-variant uppercase">Indexed Files</p>
              <h3 className="font-headline-lg text-headline-lg text-primary mt-1">{stats.documentCount}</h3>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">text_snippet</span>
          </div>
          <div className="mt-4 flex items-center gap-2 z-10 relative">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">trending_flat</span>
            <span className="font-mono-code text-mono-code text-on-surface-variant">Synchronized</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-20"></div>
        </div>

        {/* Stat Card 3 */}
        <div className="level-1 p-4 rounded-DEFAULT relative overflow-hidden group">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="font-mono-label text-mono-label text-on-surface-variant uppercase">Knowledge Size</p>
              <h3 className="font-headline-lg text-headline-lg text-primary mt-1">{stats.chunkCount}</h3>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">schema</span>
          </div>
          <div className="mt-4 flex items-center gap-2 z-10 relative">
            <span className="material-symbols-outlined text-[14px] text-tertiary">auto_awesome</span>
            <span className="font-mono-code text-mono-code text-tertiary">Entities extracted</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-down opacity-30 group-hover:opacity-50 transition-opacity"></div>
        </div>

        {/* Stat Card 4 */}
        <div className="level-1 p-4 rounded-DEFAULT relative overflow-hidden group">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <p className="font-mono-label text-mono-label text-on-surface-variant uppercase">Interactions</p>
              <h3 className="font-headline-lg text-headline-lg text-primary mt-1">{stats.conversationCount}</h3>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">forum</span>
          </div>
          <div className="mt-4 flex items-center gap-2 z-10 relative">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">swap_vert</span>
            <span className="font-mono-code text-mono-code text-on-surface-variant">Chat threads</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 sparkline-up opacity-20"></div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Projects (Takes up 2 columns on lg) */}
        <div className="lg:col-span-2 level-1 rounded-DEFAULT p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-lg text-headline-lg text-primary tracking-tight">Recent Source Documents</h3>
            <Link to={`/projects/${projectId}/documents`} className="font-mono-label text-mono-label text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-3 flex-1">
            {stats.latestDocuments.length ? (
              stats.latestDocuments.map((doc) => (
                <div key={doc._id} className="level-2 p-4 rounded-DEFAULT flex items-center justify-between group hover:border-outline-variant transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-DEFAULT bg-surface-container-high flex items-center justify-center border border-outline-variant/30">
                      <span className="material-symbols-outlined text-primary">description</span>
                    </div>
                    <div>
                      <h4 className="font-body-md text-body-md font-bold text-primary">{doc.originalFilename}</h4>
                      <p className="font-mono-code text-mono-code text-on-surface-variant text-[11px] mt-1">
                        Stored {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <p className="font-mono-label text-mono-label text-on-surface-variant">Status</p>
                      <p className="font-mono-code text-mono-code text-primary capitalize">{doc.status}</p>
                    </div>
                    <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${doc.status === 'ready' ? 'bg-primary w-full' : 'bg-outline-variant w-1/2'}`}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm font-mono-code text-on-surface-variant">No documents isolated in current space.</p>
            )}
          </div>
        </div>

        {/* Activity Feed (Takes 1 column) */}
        <div className="level-1 rounded-DEFAULT p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-lg text-headline-lg text-primary tracking-tight">Active Transmissions</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">forum</span>
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/30 before:to-transparent">
            {stats.latestConversations.length ? (
              stats.latestConversations.map((conv, i) => (
                <div key={conv._id} className="relative flex items-start gap-4 z-10 pl-8 md:pl-0">
                  <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 w-2 h-2 rounded-full mt-1.5 border ${i === 0 ? 'bg-tertiary shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-outline-variant border-surface-container-high'}`}></div>
                  <div className="md:w-1/2 md:pr-8 md:text-right md:flex-shrink-0 hidden md:block">
                    <p className="font-mono-code text-mono-code text-on-surface-variant text-[11px]">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex-1 md:w-1/2 md:pl-8">
                    <p className="font-body-sm text-body-sm text-primary line-clamp-1">{conv.title}</p>
                    <p className="font-mono-code text-mono-code text-on-surface-variant text-[10px] mt-1 md:hidden">{new Date(conv.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm font-mono-code text-on-surface-variant">No dialogue established.</p>
            )}
          </div>
          <Link to={`/projects/${projectId}/chat`} className="mt-auto pt-4 w-full block text-center font-mono-label text-mono-label text-on-surface-variant hover:text-primary transition-colors border-t border-outline-variant/30">
            Open Chat Core
          </Link>
        </div>
      </div>
    </div>
  );
}
