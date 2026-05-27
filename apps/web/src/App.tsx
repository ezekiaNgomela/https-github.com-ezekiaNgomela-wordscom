/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DocumentEditor } from './components/DocumentEditor';
import { SpreadsheetEditor } from './components/SpreadsheetEditor';
import { PDFConverter } from './components/PDFConverter';
import { PresentationEditor } from './components/PresentationEditor';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { ArrowLeft, Edit3, Download, LogOut, User as UserIcon } from 'lucide-react';
import { signIn, logOut, auth } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'doc' | 'xls' | 'pdf' | 'ppt' | 'view-doc' | 'view-xls' | 'view-pdf' | 'profile'>('dashboard');
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="h-screen w-full bg-[#111111] overflow-hidden flex flex-col">
      {/* Top Bar for Login */}
      {activeView !== 'profile' && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          {user ? (
            <button 
              onClick={() => setActiveView('profile')}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-neutral-800 border-2 border-neutral-700 hover:border-neutral-500 overflow-hidden shadow-lg hover:shadow-neutral-700/50 transition-all hover:scale-105"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-neutral-300" />
              )}
            </button>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-xl hover:shadow-blue-500/20 shadow-blue-900/20 border border-blue-500/50 hover:scale-105"
            >
              <UserIcon size={16} />
              Sign In for AI Features
            </button>
          )}
        </div>
      )}

      {/* Full screen layout for all devices without smartphone simulated border */}
      <div className="w-full h-full bg-[#111111] relative overflow-hidden flex flex-col">
        {activeView === 'dashboard' && (
          <Dashboard onOpenFile={(type) => setActiveView(type)} />
        )}
        
        {activeView === 'profile' && (
          <Profile user={user} onBack={() => setActiveView('dashboard')} />
        )}
        
        {activeView === 'view-doc' && (
          <div className="w-full h-full bg-white flex flex-col overflow-hidden">
             <div className="bg-[#1A1D20] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md z-10">
               <div className="flex items-center">
                 <button onClick={() => setActiveView('dashboard')} className="p-2 -ml-2 mr-2 hover:bg-white/10 rounded-full transition-colors active:scale-95" id="btn-back-view-doc">
                   <ArrowLeft size={20} />
                 </button>
                 <span className="font-semibold text-sm">View Document</span>
               </div>
               <div className="flex items-center gap-2">
                 <button onClick={() => {}} className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip relative active:scale-95" title="Export" id="btn-export-view-doc">
                   <Download size={18} />
                 </button>
                 <button onClick={() => setActiveView('doc')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors active:scale-95" id="btn-edit-view-doc">
                   <Edit3 size={16} />
                   <span>Edit</span>
                 </button>
               </div>
             </div>
             <div className="flex-1 overflow-auto bg-gray-100 p-4 relative">
               {/* Read-only preview mockup of the document */}
               <div className="max-w-[800px] mx-auto bg-white min-h-full p-8 shadow-sm border border-gray-200" dangerouslySetInnerHTML={{ __html: localStorage.getItem('wordscom_doc_content') || '<h1 style="text-align: center; color: #9ca3af; padding-top: 2rem;">Empty Document</h1>' }} id="preview-doc-box">
               </div>
             </div>
          </div>
        )}

        {activeView === 'doc' && (
          <DocumentEditor onBack={() => setActiveView('dashboard')} />
        )}

        {activeView === 'xls' && (
          <SpreadsheetEditor onBack={() => setActiveView('dashboard')} />
        )}

        {activeView === 'ppt' && (
          <PresentationEditor onBack={() => setActiveView('dashboard')} />
        )}

        {activeView === 'pdf' && (
          <PDFConverter onBack={() => setActiveView('dashboard')} />
        )}
      </div>
    </div>
  );
}
