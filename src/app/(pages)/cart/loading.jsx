import { Loader2 } from "lucide-react";

export default function CartLoading() {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#0b408e]">
        <Loader2 size={32} className="animate-spin text-[#0b408e]" />
        <p className="text-sm font-medium text-gray-500">Loading your cart...</p>
      </div>
    </div>
  );
}
