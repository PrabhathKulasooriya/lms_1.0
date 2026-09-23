export default function DashboardLoading() {
  return (
    <div className="flex flex-row w-full max-w-screen h-full min-h-screen animate-pulse bg-gray-50">
      {/* Sidebar Skeleton */}
      <div className="w-[70px] md:w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col gap-6">
        <div className="h-8 w-8 md:w-32 bg-gray-200 rounded-xl mx-auto md:mx-0 mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto md:mx-0" />
            <div className="hidden md:block h-4 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Main Area Skeleton */}
      <div className="flex-1 mt-16 p-6 md:p-10 space-y-6 max-w-5xl">
        {/* Profile/Welcome Banner Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-56 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Dashboard Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Table/List Skeleton */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded mb-2" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-50 rounded-xl flex items-center justify-between px-4"
            >
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
