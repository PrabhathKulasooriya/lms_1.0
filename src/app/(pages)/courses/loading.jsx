export default function CoursesLoading() {
  return (
    <div className="pt-16 min-h-screen w-full bg-gray-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          {/* Title Row */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-200" />
            <div className="h-6 w-36 bg-gray-200 rounded-md" />
            <div className="h-5 w-8 bg-gray-200 rounded-full" />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-8 w-14 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-24 bg-gray-200 rounded-full" />
            <span className="text-gray-200 select-none">|</span>
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 flex flex-col gap-12">
        {/* Section 1 Skeleton */}
        <section>
          {/* Section Heading */}
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-5 rounded-full bg-gray-200" />
            <div className="h-5 w-24 bg-gray-200 rounded-md" />
            <div className="h-4 w-6 bg-gray-200 rounded-full" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
              >
                {/* Image Placeholder */}
                <div className="relative aspect-[16/9] w-full bg-gray-200 flex flex-col justify-end p-4">
                  <div className="h-5 w-3/4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-gray-300 rounded" />
                </div>

                {/* Footer Placeholder */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-50 px-4 py-3">
                  <div className="flex flex-col justify-center space-y-1">
                    <div className="h-3 w-10 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center justify-center pl-4">
                    <div className="h-9 w-full bg-gray-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
