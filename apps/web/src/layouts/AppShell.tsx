import React from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 font-semibold">WordscOM</div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1">
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
          <div className="text-sm font-medium">Workspace</div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}