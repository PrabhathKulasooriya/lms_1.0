"use client";
import { useEffect, Suspense } from "react"; // Added Suspense
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Move the logic to a child component
const SuccessLogic = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      toast.success("🎉 Enrollment successful! Welcome to the course.");
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router]); // Added dependencies for best practice

  return null;
};

// Export the component wrapped in Suspense
export default function PurchaseSuccessToast() {
  return (
    <Suspense fallback={null}>
      <SuccessLogic />
    </Suspense>
  );
}
