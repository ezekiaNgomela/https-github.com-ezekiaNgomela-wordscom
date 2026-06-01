import { ReactNode } from 'react';
import { FileText, Sparkles } from 'lucide-react';

type WorkspaceLayoutProps = {
  commandBar: ReactNode;
  editor: ReactNode;
  assistant: ReactNode;
};

export function WorkspaceLayout({ commandBar, editor, assistant }: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_360px] lg:grid-rows-[auto_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-slate-950 p-5 text-white lg:row-span-2 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">WordCom</p>
              <h1 className="text-lg font-bold">AI Workspace</h1>
            </div>
          </div>

          <nav className="mt-6 flex gap-3 overflow-x-auto lg:mt-10 lg:block lg:space-y-3">
            <button className="flex min-w-44 items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white shadow-lg shadow-black/10 lg:w-full">
              <FileText size={18} />
              Startup proposal
            </button>
            <button className="flex min-w-44 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white lg:w-full">
              <FileText size={18} />
              New AI document
            </button>
          </nav>

          <div className="mt-6 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50 lg:mt-10">
            <p className="font-semibold text-cyan-100">Product rule</p>
            <p className="mt-2 text-cyan-50/80">Build only features that make document work more intelligent.</p>
          </div>
        </aside>

        <header className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:col-start-2">
          {commandBar}
        </header>

        <main className="overflow-auto bg-slate-100 p-4 sm:p-6 lg:col-start-2 lg:p-8">
          {editor}
        </main>

        <aside className="border-t border-slate-200 bg-white xl:row-span-2 xl:col-start-3 xl:row-start-1 xl:border-l xl:border-t-0">
          {assistant}
        </aside>
      </div>
    </div>
  );
}
