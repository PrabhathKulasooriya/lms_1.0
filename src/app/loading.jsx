export default function RootLoading() {
  return (
    <div className="pt-20 min-h-screen w-full bg-white flex flex-col items-center animate-pulse px-4">
      {/* Hero Section Skeleton */}
      <div className="max-w-5xl w-full flex flex-col items-center text-center py-16 space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded-full" />
        <div className="h-12 w-3/4 max-w-2xl bg-gray-200 rounded-2xl" />
        <div className="h-5 w-2/3 max-w-lg bg-gray-200 rounded-lg" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-36 bg-gray-200 rounded-xl" />
          <div className="h-12 w-36 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center space-y-2"
          >
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
