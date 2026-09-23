export default function LearningLoading() {
  return (
    <div className="pt-16 min-h-screen bg-slate-900 animate-pulse text-white">
      {/* Top Header Skeleton */}
      <div className="bg-slate-800 border-b border-slate-700/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-700" />
          <div className="h-5 w-48 bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-24 bg-slate-700 rounded-full" />
      </div>

      {/* Main Content: Video/Content Area + Lesson List */}
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Player Screen Skeleton (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* 16:9 Video Aspect Ratio Box */}
          <div className="aspect-video w-full bg-slate-800 rounded-2xl border border-slate-700/50 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-700" />
          </div>

          {/* Lesson Title & Controls Skeleton */}
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 space-y-3">
            <div className="h-6 w-1/2 bg-slate-700 rounded" />
            <div className="h-4 w-1/4 bg-slate-700 rounded" />
          </div>
        </div>

        {/* Sidebar Lesson Accordion List Skeleton (1 col) */}
        <div className="lg:col-span-1 bg-slate-800 p-4 rounded-2xl border border-slate-700/50 space-y-4">
          <div className="h-5 w-32 bg-slate-700 rounded" />

          {/* Lesson Modules */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3 bg-slate-700/40 rounded-xl space-y-2"
              >
                <div className="h-4 w-3/4 bg-slate-700 rounded" />
                <div className="h-3 w-1/2 bg-slate-700/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
