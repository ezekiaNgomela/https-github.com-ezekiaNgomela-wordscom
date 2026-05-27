import React, { useMemo, useState } from 'react';
import { FileText, Image as ImageIcon, Search, Plus, MoreVertical, X, LayoutTemplate, ScanText, Sparkles, CheckCircle2, User, Crown, Activity, Eye, Upload, FileSpreadsheet, Presentation } from 'lucide-react';

type NavItem = 'files' | 'tools' | 'me';

type FileItem = {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'doc' | 'xls' | 'pdf' | 'ppt' | 'image' | 'txt' | 'other';
  ext: string;
  file?: File;
  previewUrl?: string;
};

const MOCK_FILES: FileItem[] = [
  { id: '4', name: 'Document_Proposal.docx', date: '04/30', size: '465 KB', type: 'doc', ext: 'docx' },
  { id: '2', name: 'Financial_Q1.xlsx', date: '05/07', size: '12 KB', type: 'xls', ext: 'xlsx' },
  { id: '3', name: 'Project_Alpha_Presentation.pptx', date: '05/05', size: '2.1 MB', type: 'ppt', ext: 'pptx' },
  { id: '1', name: 'Invoice_10294.pdf', date: 'Today', size: '1.4 MB', type: 'pdf', ext: 'pdf' },
];

const extToType: Record<string, FileItem['type']> = {
  doc: 'doc', docx: 'doc', odt: 'doc',
  xls: 'xls', xlsx: 'xls', csv: 'xls',
  ppt: 'ppt', pptx: 'ppt',
  pdf: 'pdf',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
  txt: 'txt', md: 'txt'
};

const typeLabels: Record<FileItem['type'], string> = {
  doc: 'Documents', xls: 'Spreadsheets', ppt: 'Presentations', pdf: 'PDF Files', image: 'Images', txt: 'Text Files', other: 'Other Files'
};

const formatSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value >= 10 || idx === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[idx]}`;
};

export function Dashboard({ onOpenFile }: { onOpenFile: (type: 'view-doc' | 'doc' | 'xls' | 'pdf' | 'ppt') => void }) {
  const [activeNav, setActiveNav] = useState<NavItem>('files');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [storedFiles, setStoredFiles] = useState<FileItem[]>(MOCK_FILES);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'doc': return <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      case 'xls': return <div className="w-8 h-8 rounded bg-green-500/20 text-green-500 flex items-center justify-center shrink-0"><FileSpreadsheet size={18} /></div>;
      case 'ppt': return <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0"><Presentation size={18} /></div>;
      case 'pdf': return <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      case 'image': return <div className="w-8 h-8 rounded bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0"><ImageIcon size={18} /></div>;
      default: return <div className="w-8 h-8 rounded bg-gray-500/20 text-gray-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newItems = files.map((file, idx): FileItem => {
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
      const fileType = extToType[ext] ?? 'other';
      const previewable = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type.startsWith('text/');
      return {
        id: `up-${Date.now()}-${idx}`,
        name: file.name,
        date: new Date().toLocaleDateString(),
        size: formatSize(file.size),
        type: fileType,
        ext: ext || 'unknown',
        file,
        previewUrl: previewable ? URL.createObjectURL(file) : undefined,
      };
    });

    setStoredFiles(prev => [...newItems, ...prev]);
    e.target.value = '';
  };

  const filtered = useMemo(() => {
    const lower = query.toLowerCase().trim();
    return storedFiles.filter(f => !lower || f.name.toLowerCase().includes(lower) || f.ext.toLowerCase().includes(lower));
  }, [storedFiles, query]);

  const groupedFiles = useMemo(() => {
    return filtered.reduce<Record<string, FileItem[]>>((acc, file) => {
      const key = file.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(file);
      return acc;
    }, {});
  }, [filtered]);

  const openFeatureFromType = (type: FileItem['type']) => {
    if (type === 'pdf') return onOpenFile('pdf');
    if (type === 'xls') return onOpenFile('xls');
    if (type === 'ppt') return onOpenFile('ppt');
    return onOpenFile('doc');
  };

  const renderFiles = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center px-4 py-3 bg-[#111111] gap-3 border-b border-white/5">
        <div className="flex-1 bg-[#1A1D20] rounded-full flex items-center px-4 py-2 border border-white/5">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files by name or extension"
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-500 text-white"
          />
        </div>
        <label className="cursor-pointer px-3 py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors">
          <Upload size={14} /> Add Files
          <input type="file" multiple className="hidden" onChange={handleFilePick} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 pb-24 lg:pb-6 text-left">
        {Object.entries(groupedFiles).map(([group, files]) => (
          <section key={group} className="mb-5">
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2 px-1">{typeLabels[group as FileItem['type']] ?? 'Files'} ({files.length})</div>
            <div className="bg-[#17191c] border border-white/5 rounded-xl overflow-hidden">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 border-b last:border-b-0 border-white/5 hover:bg-white/5">
                  <button onClick={() => openFeatureFromType(f.type)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {getFileIcon(f.type)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{f.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{f.date} · {f.size} · .{f.ext}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    {f.previewUrl && (
                      <button className="text-gray-300 hover:text-white p-2" onClick={() => setPreviewFile(f)} title="Preview">
                        <Eye size={16} />
                      </button>
                    )}
                    <button className="text-gray-500 p-2 hover:text-white"><MoreVertical size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <FileText size={32} className="mb-2 opacity-50" />
            <p>No matching files found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 pb-24 lg:pb-6 text-left">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-white"><Sparkles className="mr-2 text-yellow-500" /> Premium Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => onOpenFile('pdf')} className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-[#25282c]"><FileText size={18} className="text-red-400" /> PDF Converter Hub</button>
        <button onClick={() => onOpenFile('doc')} className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-[#25282c]"><FileText size={18} className="text-blue-400" /> Document Editor</button>
        <button onClick={() => onOpenFile('xls')} className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-[#25282c]"><FileSpreadsheet size={18} className="text-green-400" /> Spreadsheet Editor</button>
        <button onClick={() => onOpenFile('ppt')} className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:bg-[#25282c]"><LayoutTemplate size={18} className="text-orange-400" /> Presentation Editor</button>
      </div>
    </div>
  );

  const renderMe = () => (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-8 pb-24 lg:pb-6 text-left">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white">
          <User size={30} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Ezekiel User</h2>
          <p className="text-gray-400">Free Account</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1D20] p-4 rounded-xl border border-white/5 text-center"><Activity size={24} className="text-blue-500 mx-auto mb-2" /><p className="text-2xl font-bold text-white">12</p><p className="text-xs text-gray-500">Saved Works</p></div>
        <div className="bg-[#1A1D20] p-4 rounded-xl border border-white/5 text-center"><Sparkles size={24} className="text-purple-500 mx-auto mb-2" /><p className="text-2xl font-bold text-white">4</p><p className="text-xs text-gray-500">AI Uses</p></div>
      </div>
      <div className="mt-6 bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-5 text-white relative overflow-hidden">
        <Crown className="absolute right-2 top-2 opacity-25" size={60} />
        <p className="font-bold">Upgrade to Premium</p>
        <p className="text-sm text-amber-100">Unlock all AI features and cloud sync.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-[#111111] text-gray-100 font-sans relative overflow-hidden">
      <div className="flex h-full">
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/10 bg-[#0d0e10] flex-col p-4 gap-3">
          <h2 className="text-lg font-semibold px-2 mb-2">WordsCom</h2>
          {[
            { id: 'files', label: 'Files', icon: <FileText size={18} /> },
            { id: 'tools', label: 'Tools', icon: <Sparkles size={18} /> },
            { id: 'me', label: 'Me', icon: <User size={18} /> }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id as NavItem)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeNav === item.id ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-white/5'}`}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
          <button onClick={() => setIsCreateOpen(true)} className="mt-auto w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
            <Plus size={18} /> Create
          </button>
        </aside>

        <main className="flex-1 overflow-hidden">
          {activeNav === 'files' && renderFiles()}
          {activeNav === 'tools' && renderTools()}
          {activeNav === 'me' && renderMe()}
        </main>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1A1D20] border-t border-white/5 h-16 flex items-center justify-around px-2 pb-safe z-40">
        <button onClick={() => setActiveNav('files')} className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'files' ? 'text-blue-500' : 'text-gray-500'}`}><FileText size={22} /><span className="text-[10px] font-medium">Files</span></button>
        <button onClick={() => setActiveNav('tools')} className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'tools' ? 'text-purple-500' : 'text-gray-500'}`}><Sparkles size={22} /><span className="text-[10px] font-medium">Tools</span></button>
        <div className="flex-1 flex justify-center mt-[-30px]"><button onClick={() => setIsCreateOpen(true)} className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white border-4 border-[#1A1D20]"><Plus size={28} /></button></div>
        <button onClick={() => setActiveNav('me')} className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'me' ? 'text-green-500' : 'text-gray-500'}`}><User size={22} /><span className="text-[10px] font-medium">Me</span></button>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 p-4 lg:p-8">
          <div className="h-full bg-[#121417] border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-sm text-white truncate">Preview: {previewFile.name}</div>
              <button onClick={() => setPreviewFile(null)} className="p-2 text-gray-300 hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 p-2">
              {previewFile.file?.type.startsWith('image/') && <img src={previewFile.previewUrl} className="max-h-full max-w-full mx-auto" alt={previewFile.name} />}
              {previewFile.file?.type === 'application/pdf' && <iframe title={previewFile.name} src={previewFile.previewUrl} className="w-full h-full" />}
              {previewFile.file?.type.startsWith('text/') && <iframe title={previewFile.name} src={previewFile.previewUrl} className="w-full h-full bg-white" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
