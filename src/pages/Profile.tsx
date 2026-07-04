import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut, Loader2, ArrowLeft } from "lucide-react";

export default function Profile() {
  const { user, profile, isLoading, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burnt-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 px-6 pb-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-taupe hover:text-burnt-orange transition-colors font-medium mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white border border-espresso/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm overflow-hidden">
            <User className="w-12 h-12 text-taupe/40" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-espresso">
            {profile?.name || user.email?.split("@")[0] || "My Profile"}
          </h1>
          <p className="text-taupe text-lg mt-1 capitalize">
            {profile?.role === "customer" ? "Customer Account" : `${profile?.role} Account`}
          </p>
        </div>

        <Card className="border-espresso/5 shadow-xl shadow-espresso/5 rounded-[2rem] overflow-hidden bg-white p-6 md:p-8">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-espresso/10 mb-6">
            <CardTitle className="text-2xl font-bold font-heading text-espresso">
              Account Details
            </CardTitle>
            <CardDescription className="text-base text-taupe mt-1">
              Manage your personal information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-0 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-espresso" />
              </div>
              <div>
                <p className="text-sm font-semibold text-taupe uppercase tracking-wider mb-0.5">
                  Full Name
                </p>
                <p className="text-lg font-medium text-espresso">
                  {profile?.name || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-espresso" />
              </div>
              <div>
                <p className="text-sm font-semibold text-taupe uppercase tracking-wider mb-0.5">
                  Email Address
                </p>
                <p className="text-lg font-medium text-espresso">
                  {user.email}
                </p>
              </div>
            </div>
            
            <div className="pt-6 mt-6 border-t border-espresso/10">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full py-6 text-lg font-bold border-2 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
