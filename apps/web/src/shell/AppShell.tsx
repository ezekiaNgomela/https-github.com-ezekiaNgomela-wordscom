import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIPanel } from './AIPanel';

export function AppShell() {
  return (
    <div className="h-screen w-full flex bg-[#111] text-white">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>

          <AIPanel />
        </div>
      </div>
    </div>
  );
}
