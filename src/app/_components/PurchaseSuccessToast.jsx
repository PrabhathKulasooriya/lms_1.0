"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const PurchaseSuccessToast = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("purchase") === "success") {
      toast.success("🎉 Enrollment successful! Welcome to the course.");
      // Clean the URL without triggering a full reload
      router.replace(window.location.pathname, { scroll: false });
    }
  }, []);

  return null;
};

export default PurchaseSuccessToast;
