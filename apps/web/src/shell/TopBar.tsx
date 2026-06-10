import { useParams } from 'react-router-dom';

export function TopBar() {
  const { id } = useParams();

  return (
    <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-[#111]">
      <div className="text-sm text-gray-300">
        {id ? `Document: ${id}` : 'Dashboard'}
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1 text-sm bg-white/10 rounded">Save</button>
        <button className="px-3 py-1 text-sm bg-white/10 rounded">Share</button>
        <button className="px-3 py-1 text-sm bg-blue-600 rounded">Export</button>
      </div>
    </div>
  );
}
