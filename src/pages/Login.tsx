import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-burnt-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-burnt-orange/20">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-espresso">Bake & Joy</h1>
          <p className="text-taupe mt-1">Freshly baked happiness</p>
        </div>

        <Card className="border-espresso/5 shadow-xl shadow-espresso/5 rounded-3xl overflow-hidden bg-white">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 rounded-none bg-espresso/5 p-1">
              <TabsTrigger value="signin" className="rounded-2xl py-2.5 text-sm font-semibold transition-all">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-2xl py-2.5 text-sm font-semibold transition-all">Sign Up</TabsTrigger>
            </TabsList>

            <CardHeader className="pt-6">
              <CardTitle className="text-xl font-heading text-espresso">Welcome</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-150 rounded-2xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-4 p-3.5 bg-green-50 border border-green-150 rounded-2xl text-green-700 text-sm">
                  {message}
                </div>
              )}

              <TabsContent value="signin" className="mt-0">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-6 bg-burnt-orange hover:bg-[#C44D2A] text-white font-semibold rounded-full transition-all shadow-md shadow-burnt-orange/20"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-xl border-espresso/15 focus-visible:ring-burnt-orange"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-6 bg-burnt-orange hover:bg-[#C44D2A] text-white font-semibold rounded-full transition-all shadow-md shadow-burnt-orange/20"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-espresso/5 bg-espresso/[0.01] py-4">
              <a href="/" className="text-sm text-taupe hover:text-burnt-orange transition-colors">
                ← Back to store
              </a>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
