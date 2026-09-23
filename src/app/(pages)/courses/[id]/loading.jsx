export default function CourseDetailLoading() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 animate-pulse selection:bg-[#9fe03c] selection:text-[#0b408e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Back Link Skeleton */}
        <div className="h-4 w-24 bg-gray-200 rounded mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Hero Banner Card */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="aspect-[16/9] w-full bg-gray-200 flex flex-col justify-end p-6 md:p-8 space-y-3">
                <div className="h-8 w-3/4 bg-gray-300 rounded-lg" />
                <div className="h-4 w-1/3 bg-gray-300 rounded" />
              </div>
            </div>

            {/* Course Information & Curriculum Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 space-y-6 shadow-sm">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>

              {/* Lessons Skeleton */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-gray-100 rounded-2xl flex items-center justify-between px-4"
                  >
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
              {/* Price Skeleton */}
              <div className="space-y-1">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-36 bg-gray-200 rounded-lg" />
              </div>

              {/* CTA Button Skeleton */}
              <div className="h-12 w-full bg-gray-200 rounded-2xl" />

              {/* Course Features List */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
