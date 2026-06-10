import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <div className="w-64 bg-[#0d0d0d] border-r border-white/10 p-4">
      <div className="text-lg font-bold mb-6">
        Wordscom
      </div>

      <Link to="/" className="block py-2 hover:text-blue-400">
        Dashboard
      </Link>

      <div className="mt-6 text-sm text-gray-400">
        Recent Documents
      </div>

      <div className="mt-2 space-y-2">
        <div className="p-2 bg-white/5 rounded">Doc 1</div>
        <div className="p-2 bg-white/5 rounded">Doc 2</div>
      </div>
    </div>
  );
}
