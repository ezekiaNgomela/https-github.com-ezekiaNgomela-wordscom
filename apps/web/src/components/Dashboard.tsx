import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Search, Bell, Plus, MoreVertical, X, LayoutTemplate, ScanText, Sparkles, CheckCircle2, User, Crown, Activity } from 'lucide-react';

type FileItem = {
  id: string;
  name: string;
  date: string;
  size: string;
  type: 'doc' | 'xls' | 'pdf' | 'ppt' | 'other';
};

const MOCK_FILES: FileItem[] = [
  { id: '4', name: 'Document_Proposal', date: '04/30', size: '465 KB', type: 'doc' },
  { id: '2', name: 'Financial_Q1', date: '05/07', size: '12 KB', type: 'xls' },
  { id: '3', name: 'Project_Alpha_Presentation', date: '05/05', size: '2.1 MB', type: 'ppt' },
  { id: '1', name: 'Invoice_10294', date: 'Today', size: '1.4 MB', type: 'pdf' },
];

export function Dashboard({ onOpenFile }: { onOpenFile: (type: 'view-doc' | 'doc' | 'xls' | 'pdf' | 'ppt') => void }) {
  const [activeNav, setActiveNav] = useState<'files' | 'tools' | 'me'>('files');
  const [activeTab, setActiveTab] = useState<'Recent' | 'Starred'>('Recent');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Storage files
  const [storedFiles, setStoredFiles] = useState<FileItem[]>(MOCK_FILES);

  useEffect(() => {
    // Populate with actual local storage if testing documents
    const docTitle = localStorage.getItem('wordscom_doc_title');
    if (docTitle) {
      setStoredFiles(prev => {
        const hasExisting = prev.find(f => f.name === docTitle);
        if (hasExisting) return prev;
        return [{ id: '999', name: docTitle, date: 'Just now', size: 'Unknown', type: 'doc' }, ...prev];
      });
    }
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc': return <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      case 'xls': return <div className="w-8 h-8 rounded bg-green-500/20 text-green-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      case 'ppt': return <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0"><LayoutTemplate size={18} /></div>;
      case 'pdf': return <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
      default: return <div className="w-8 h-8 rounded bg-gray-500/20 text-gray-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>;
    }
  };

  const renderFiles = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="flex items-center px-4 py-3 bg-[#111111] gap-3">
        <div className="flex-1 bg-[#1A1D20] rounded-full flex items-center px-4 py-2 border border-white/5">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search documents" 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-500 text-white" 
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-4 mt-2 border-b border-white/10 shrink-0">
        <div className="flex gap-6">
          <button 
            className={`pb-3 text-base font-medium relative ${activeTab === 'Recent' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setActiveTab('Recent')}
          >
            All Documents
            {activeTab === 'Recent' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-t-full" />}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 pb-24">
        {storedFiles.map(f => (
          <div key={f.id} onClick={() => onOpenFile('view-doc')} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3">
              {getFileIcon(f.type)}
              <div>
                <p className="text-sm font-medium text-gray-200">{f.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {f.date} · Device Storage
                </p>
              </div>
            </div>
            <button className="text-gray-500 p-2 hover:text-white" onClick={(e) => { e.stopPropagation(); }}>
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
        {storedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <FileText size={32} className="mb-2 opacity-50" />
            <p>No documents found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-4 pb-24">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-white"><Sparkles className="mr-2 text-yellow-500" /> Premium Tools</h2>
      
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">AI Features</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex flex-col gap-3 hover:bg-[#25282c] transition-colors text-left">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">AI Text Generator</p>
              <p className="text-xs text-gray-500 mt-1">Generate content from topics</p>
            </div>
          </button>
          <button className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex flex-col gap-3 hover:bg-[#25282c] transition-colors text-left">
            <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Grammar Fix</p>
              <p className="text-xs text-gray-500 mt-1">Smart check and correct</p>
            </div>
          </button>
          <button className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex flex-col gap-3 hover:bg-[#25282c] transition-colors text-left">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Text Refiner</p>
              <p className="text-xs text-gray-500 mt-1">Improve writing style</p>
            </div>
          </button>
          <button className="bg-[#1A1D20] border border-white/5 p-4 rounded-xl flex flex-col gap-3 hover:bg-[#25282c] transition-colors text-left">
            <div className="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center">
              <ScanText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">AI Text Scanner</p>
              <p className="text-xs text-gray-500 mt-1">Extract text from images</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Format Converters</h3>
        <div className="bg-[#1A1D20] border border-white/5 rounded-xl overflow-hidden text-left">
          <button onClick={() => onOpenFile('pdf')} className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-[#25282c] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span className="text-sm font-medium text-gray-200">PDF Converter Hub</span>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-[#25282c] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span className="text-sm font-medium text-gray-200">Word to PDF</span>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-white/5 hover:bg-[#25282c] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-green-500/20 text-green-500 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span className="text-sm font-medium text-gray-200">Excel to PDF</span>
            </div>
            <span className="text-gray-500">→</span>
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#25282c] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
                <ImageIcon size={16} />
              </div>
              <span className="text-sm font-medium text-gray-200">Image to PDF</span>
            </div>
            <span className="text-gray-500">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderMe = () => (
    <div className="flex flex-col h-full overflow-y-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white/10">
          <User size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ezekiel User</h2>
          <p className="text-gray-400">Free Account</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-5 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-20">
          <Crown size={120} />
        </div>
        <div className="relative z-10 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={24} className="text-yellow-100" />
            <h3 className="text-lg font-bold">Upgrade to Premium</h3>
          </div>
          <p className="text-sm text-amber-100 mb-4 max-w-[200px]">Unlock all AI features, unlimited scanner, and priority cloud sync.</p>
          <button className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-50 transition-colors">
            View Pricing
          </button>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">My Progress</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1A1D20] p-4 rounded-xl border border-white/5 text-center">
          <Activity size={24} className="text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-gray-500">Saved Works</p>
        </div>
        <div className="bg-[#1A1D20] p-4 rounded-xl border border-white/5 text-center">
          <Sparkles size={24} className="text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-xs text-gray-500">AI Uses</p>
        </div>
      </div>
      
      <div className="bg-[#1A1D20] rounded-xl border border-white/5 overflow-hidden text-left">
        <button className="w-full text-left px-4 py-4 border-b border-white/5 text-sm font-medium text-gray-200 hover:bg-[#25282c]">Account Settings</button>
        <button className="w-full text-left px-4 py-4 border-b border-white/5 text-sm font-medium text-gray-200 hover:bg-[#25282c]">Cloud Sync Setup</button>
        <button className="w-full text-left px-4 py-4 text-sm font-medium text-red-400 hover:bg-[#25282c]">Sign Out</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#111111] text-gray-100 font-sans relative overflow-hidden text-center">
      
      {/* Dynamic Content */}
      <div className="flex-1 overflow-hidden">
        {activeNav === 'files' && renderFiles()}
        {activeNav === 'tools' && renderTools()}
        {activeNav === 'me' && renderMe()}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 w-full bg-[#1A1D20] border-t border-white/5 h-16 flex items-center justify-around px-2 pb-safe z-40">
        <button 
          onClick={() => setActiveNav('files')}
          className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'files' ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <FileText size={22} fill={activeNav === 'files' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Files</span>
        </button>
        
        <button 
          onClick={() => setActiveNav('tools')}
          className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'tools' ? 'text-purple-500' : 'text-gray-500'}`}
        >
          <Sparkles size={22} fill={activeNav === 'tools' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Tools</span>
        </button>

        <div className="flex-1 flex justify-center mt-[-30px]">
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border-4 border-[#1A1D20] active:scale-95 transition-transform"
          >
            <Plus size={28} />
          </button>
        </div>

        <button 
          onClick={() => setActiveNav('me')}
          className={`flex flex-col items-center gap-1 flex-1 ${activeNav === 'me' ? 'text-green-500' : 'text-gray-500'}`}
        >
          <User size={22} fill={activeNav === 'me' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">Me</span>
        </button>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="absolute inset-0 bg-black/70 z-50 flex flex-col justify-end backdrop-blur-sm">
          <div className="bg-[#1c1c1e] rounded-t-3xl w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 border-t border-white/10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#1c1c1e]/90">
              <h2 className="text-xl font-bold text-white">Create what's next...</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            
            {/* Grid */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-3 gap-y-8 gap-x-4">
                <button onClick={() => { setIsCreateOpen(false); onOpenFile('doc'); }} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                    <FileText size={32} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Word</span>
                </button>
                <button onClick={() => { setIsCreateOpen(false); onOpenFile('xls'); }} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center justify-center hover:bg-green-500/20 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h2v8H8V8zm4 0h6v2h-6V8zm0 3h6v2h-6v-2zm0 3h6v2h-6v-2z"/></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">Excel</span>
                </button>
                <button onClick={() => { setIsCreateOpen(false); onOpenFile('ppt'); }} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center hover:bg-orange-500/20 transition-colors">
                    <LayoutTemplate size={32} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">PowerPoint</span>
                </button>
                <button onClick={() => { setIsCreateOpen(false); onOpenFile('pdf'); }} className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500/20 transition-colors">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h6v2H8v-2z" /></svg>
                  </div>
                  <span className="text-sm font-medium text-gray-300">PDF</span>
                </button>
                <button className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                    <ScanText size={32} />
                  </div>
                  <span className="text-sm font-medium text-gray-300">Scanner</span>
                </button>
                <button className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center hover:bg-pink-500/20 transition-colors relative text-left">
                    <Sparkles size={32} />
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-md cursor-default">AI</div>
                  </div>
                  <span className="text-sm font-medium text-gray-300 text-center">AI Writer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

