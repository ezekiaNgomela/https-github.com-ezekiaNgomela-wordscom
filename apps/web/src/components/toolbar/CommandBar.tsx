import { Download, FileDown, LogOut, Save, User, WandSparkles, Pilcrow } from 'lucide-react';
import { PremiumState } from '../../lib/ai/premium';

type CommandBarProps = {
  onSave: () => void;
  onAutoFormat: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isProcessing: boolean;
  isSignedIn: boolean;
  premium: PremiumState;
};

export function CommandBar({ onSave, onAutoFormat, onExportPdf, onExportDocx, onSignIn, onSignOut, isProcessing, isSignedIn, premium }: CommandBarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">/editor</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">AI Word Editor Shell</h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onSave} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Save size={16} /> Save
        </button>
        <button onClick={onAutoFormat} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Pilcrow size={16} /> Auto format
        </button>
        <button onClick={onExportDocx} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <FileDown size={16} /> DOCX
        </button>
        <button onClick={onExportPdf} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Download size={16} /> PDF
        </button>
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">
          <WandSparkles size={14} /> {isProcessing ? 'AI writing...' : 'AI ready'}
        </span>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${premium.isPremium ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          {premium.isPremium ? 'Premium active' : 'Premium locked'}
        </span>
        {isSignedIn ? (
          <button onClick={onSignOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <LogOut size={16} /> Sign out
          </button>
        ) : (
          <button onClick={onSignIn} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 hover:bg-cyan-100">
            <User size={16} /> Sign in
          </button>
        )}
      </div>
    </div>
  );
}
