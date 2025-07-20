import Skeleton from '@/components/skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md mb-8">
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <Skeleton className="h-10 w-full sm:basis-3/4" />
          <Skeleton className="h-10 w-full sm:basis-1/4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <Skeleton className="w-full h-40 mb-3" />
              <Skeleton className="h-6 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-3 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}