/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DocumentEditor } from './components/DocumentEditor';
import { SpreadsheetEditor } from './components/SpreadsheetEditor';
import { PDFConverter } from './components/PDFConverter';
import { Dashboard } from './components/Dashboard';
import { ArrowLeft, Edit3, Download } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'doc' | 'xls' | 'pdf' | 'ppt' | 'view-doc' | 'view-xls' | 'view-pdf'>('dashboard');

  return (
    <div className="h-screen w-full bg-[#111111] overflow-hidden sm:flex sm:items-center sm:justify-center">
      {/* Container to mimic mobile app look on desktop, full screen on mobile */}
      <div className="w-full h-full sm:w-[414px] sm:h-[896px] sm:max-h-[90vh] bg-[#111111] sm:rounded-[40px] sm:border-8 border-[#333] shadow-2xl relative overflow-hidden flex flex-col">
        {activeView === 'dashboard' && (
          <Dashboard onOpenFile={(type) => setActiveView(type)} />
        )}
        
        {activeView === 'view-doc' && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
             <div className="bg-[#1A1D20] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
               <div className="flex items-center">
                 <button onClick={() => setActiveView('dashboard')} className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-full transition-colors active:scale-95">
                   <ArrowLeft size={20} />
                 </button>
                 <span className="font-semibold text-sm">View Document</span>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => {}} className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip relative active:scale-95" title="Export">
                   <Download size={18} />
                 </button>
                 <button onClick={() => setActiveView('doc')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors active:scale-95">
                   <Edit3 size={16} />
                   <span>Edit</span>
                 </button>
               </div>
             </div>
             <div className="flex-1 overflow-auto bg-gray-100 p-4 relative pointer-events-none opacity-80" style={{ filter: 'grayscale(10%)' }}>
               {/* Read-only preview mockup of the document */}
               <div className="max-w-[800px] mx-auto bg-white min-h-full p-8 shadow-sm border border-gray-200" dangerouslySetInnerHTML={{ __html: localStorage.getItem('wordscom_doc_content') || '<h1 style="text-align: center; color: #9ca3af; padding-top: 2rem;">Empty Document</h1>' }}>
               </div>
             </div>
          </div>
        )}

        {activeView === 'doc' && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
               <div className="flex items-center">
                 <button onClick={() => setActiveView('dashboard')} className="mr-3 p-1.5 hover:bg-gray-200 rounded-full text-gray-700">
                   <ArrowLeft size={20} />
                 </button>
                 <span className="font-semibold text-sm">Editor</span>
               </div>
             </div>
             <div className="flex-1 overflow-hidden relative">
               <DocumentEditor />
             </div>
          </div>
        )}

        {activeView === 'xls' && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center shrink-0">
               <button onClick={() => setActiveView('dashboard')} className="mr-3 p-1.5 hover:bg-gray-200 rounded-full text-gray-700">
                 <ArrowLeft size={20} />
               </button>
               <span className="font-semibold text-sm">Spreadsheet</span>
             </div>
             <div className="flex-1 overflow-hidden relative">
               <SpreadsheetEditor />
             </div>
          </div>
        )}

        {activeView === 'ppt' && (
          <div className="w-full h-full bg-white flex items-center justify-center">
             <button onClick={() => setActiveView('dashboard')} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full text-gray-700">
               <ArrowLeft size={20} />
             </button>
             <div className="text-center text-gray-500">
               <p className="text-xl font-bold mb-2">PowerPoint Editor</p>
               <p>Coming Soon</p>
             </div>
          </div>
        )}

        {activeView === 'pdf' && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
             <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center shrink-0">
               <button onClick={() => setActiveView('dashboard')} className="mr-3 p-1.5 hover:bg-gray-200 rounded-full text-gray-700">
                 <ArrowLeft size={20} />
               </button>
               <span className="font-semibold text-sm">PDF Converter</span>
             </div>
             <div className="flex-1 overflow-auto relative">
               <PDFConverter />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
