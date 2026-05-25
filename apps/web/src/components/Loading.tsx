import { Loader2 } from 'lucide-react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex w-full p-8 items-center justify-center">
      {content}
    </div>
  );
}
