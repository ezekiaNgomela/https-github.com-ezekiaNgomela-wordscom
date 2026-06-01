import { Download, FileDown, Save, WandSparkles } from 'lucide-react';

type CommandBarProps = {
  onSave: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  isProcessing: boolean;
};

export function CommandBar({ onSave, onExportPdf, onExportDocx, isProcessing }: CommandBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">AI-native document workspace</p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">Clean canvas + AI command layer</h2>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onSave} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <Save size={16} /> Save
        </button>
        <button onClick={onExportDocx} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <FileDown size={16} /> DOCX
        </button>
        <button onClick={onExportPdf} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          <Download size={16} /> PDF
        </button>
        <span className="ml-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">
          <WandSparkles size={14} /> {isProcessing ? 'AI writing...' : 'AI ready'}
        </span>
      </div>
    </div>
  );
}
