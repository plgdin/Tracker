import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function StorefrontWrapper() {
  const { initialize, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  return <Outlet />;
}
