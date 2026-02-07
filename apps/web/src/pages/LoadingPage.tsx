import { Loader2 } from 'lucide-react';

export const LoadingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center animate-pulse">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg tracking-wide">
          Loading...
        </p>
      </div>
    </div>
  );
};