import Skeleton from '@/components/skeleton';

export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-2xl">
        <Skeleton className="w-full h-64 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-4" />
        <Skeleton className="h-5 w-1/2 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-2" />
      </div>
    </div>
  );
}