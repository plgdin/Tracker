import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";

const BakeryPattern = ({ dense = false }: { dense?: boolean }) => {
  const baseIcons = [
    { name: "flask-conical", className: "left-[6%] top-10 h-16 w-16 rotate-[-12deg]" },
    { name: "droplet", className: "right-[8%] top-16 h-14 w-14 rotate-[10deg]" },
    { name: "flame", className: "left-[16%] top-[38%] h-12 w-12 rotate-[18deg]" },
    { name: "wheat", className: "right-[22%] top-[46%] h-16 w-16 rotate-[-18deg]" },
    { name: "candy", className: "left-[47%] top-8 h-11 w-11 rotate-[22deg]" },
    { name: "chef-hat", className: "right-[42%] top-[58%] h-14 w-14 rotate-[-8deg]" },
    { name: "cup-soda", className: "left-[31%] top-[27%] h-12 w-12 rotate-[-20deg]" },
    { name: "citrus", className: "right-[31%] top-[18%] h-12 w-12 rotate-[14deg]" },
    { name: "package", className: "left-[38%] top-[70%] h-12 w-12 rotate-[8deg]" },
    { name: "leaf", className: "right-[15%] top-[67%] h-12 w-12 rotate-[-14deg]" },
    { name: "grape", className: "left-[72%] top-[32%] h-12 w-12 rotate-[18deg]" },
    { name: "utensils-crossed", className: "left-[9%] top-[72%] h-12 w-12 rotate-[16deg]" },
    { name: "soup", className: "left-[58%] top-[76%] h-12 w-12 rotate-[-10deg]" },
    { name: "coffee", className: "right-[6%] top-[45%] h-12 w-12 rotate-[12deg]" },
    { name: "milk", className: "left-[24%] top-[62%] h-11 w-11 rotate-[-8deg]" },
    { name: "egg", className: "right-[34%] top-[73%] h-10 w-10 rotate-[20deg]" },
  ];
  const denseIcons = [
    { name: "flask-conical", className: "left-[5%] top-[18%] h-12 w-12 rotate-[18deg]" },
    { name: "droplet", className: "right-[5%] top-[26%] h-12 w-12 rotate-[-12deg]" },
    { name: "pipette", className: "left-[12%] top-[55%] h-10 w-10 rotate-[-8deg]" },
    { name: "candy", className: "right-[13%] top-[58%] h-10 w-10 rotate-[20deg]" },
    { name: "citrus", className: "left-[52%] top-[35%] h-11 w-11 rotate-[-18deg]" },
    { name: "chef-hat", className: "right-[47%] top-[88%] h-12 w-12 rotate-[12deg]" },
    { name: "wheat", className: "left-[70%] top-[82%] h-12 w-12 rotate-[-22deg]" },
    { name: "coffee", className: "left-[28%] top-[84%] h-11 w-11 rotate-[16deg]" },
  ];
  const icons = dense ? [...baseIcons, ...denseIcons] : baseIcons;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {icons.map(({ name, className }) => (
        <img
          key={name}
          src={`https://api.iconify.design/lucide/${name}.svg?color=%238C8C8C`}
          alt=""
          loading="lazy"
          className={`absolute opacity-20 ${className}`}
        />
      ))}
    </div>
  );
};

export default function Login() {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/profile");
    }
  }, [user, isLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "admin"
        },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setLoading(false);
      if (data.session) {
        navigate("/");
      } else {
        setMessage("Check your email for the confirmation link!");
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <BakeryPattern dense />
      <div className="relative z-10 w-full max-w-lg space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-burnt-orange rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-burnt-orange/20">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-espresso">Chef & Joy</h1>
          <p className="text-taupe text-lg mt-1.5">Premium ingredients & professional chef supplies</p>
        </div>

        <Card className="border-espresso/5 shadow-xl shadow-espresso/5 rounded-[2rem] overflow-hidden bg-white p-6 md:p-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

            <CardHeader className="pt-2 px-0 pb-6">
              <CardTitle className="text-2xl font-bold font-heading text-espresso">Welcome</CardTitle>
              <CardDescription className="text-base text-taupe mt-1">Enter your credentials to continue</CardDescription>
            </CardHeader>

            <CardContent className="px-0">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-150 rounded-2xl text-green-700 text-sm">
                  {message}
                </div>
              )}

              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-base font-bold text-espresso mb-1 block">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-base font-bold text-espresso mb-1 block">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange text-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="auth-btn w-full mt-4 py-7 bg-burnt-orange hover:bg-[#C44D2A] text-white font-bold rounded-full transition-all shadow-md shadow-burnt-orange/20 text-lg uppercase tracking-wider"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-base font-bold text-espresso mb-1 block">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-base font-bold text-espresso mb-1 block">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-base font-bold text-espresso mb-1 block">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange text-lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="auth-btn w-full mt-4 py-7 bg-burnt-orange hover:bg-[#C44D2A] text-white font-bold rounded-full transition-all shadow-md shadow-burnt-orange/20 text-lg uppercase tracking-wider"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-center bg-transparent border-t-0 pt-6 px-0 pb-2">
              {activeTab === "signin" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-base text-taupe hover:text-burnt-orange transition-colors cursor-pointer"
                >
                  Don't have an account? <span className="font-semibold text-burnt-orange underline">Sign Up</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-base text-taupe hover:text-burnt-orange transition-colors cursor-pointer"
                >
                  Already have an account? <span className="font-semibold text-burnt-orange underline">Sign In</span>
                </button>
              )}
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
