import { Loader2 } from "lucide-react";

export default function CartCheckoutLoading() {
  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-[#0b408e]">
        <Loader2 size={28} className="animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading checkout...</p>
      </div>
    </div>
  );
}
