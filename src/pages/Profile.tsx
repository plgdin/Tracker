import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut, Loader2, ArrowLeft, MapPin, Save, CheckCircle2 } from "lucide-react";

export default function Profile() {
  const { user, profile, isLoading, signOut, updateProfile } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (profile?.name) {
      setFullName(profile.name);
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    } else if (user?.email) {
      setFullName(user.email.split("@")[0]);
    }

    try {
      const saved = localStorage.getItem("user_address_details");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.addressLine1) setAddressLine1(parsed.addressLine1);
        if (parsed.addressLine2) setAddressLine2(parsed.addressLine2);
        if (parsed.city) setCity(parsed.city);
        if (parsed.state) setStateName(parsed.state);
        if (parsed.pincode) setPincode(parsed.pincode);
      } else if (user?.user_metadata?.address_details) {
        const parsed = user.user_metadata.address_details;
        if (parsed.addressLine1) setAddressLine1(parsed.addressLine1);
        if (parsed.addressLine2) setAddressLine2(parsed.addressLine2);
        if (parsed.city) setCity(parsed.city);
        if (parsed.state) setStateName(parsed.state);
        if (parsed.pincode) setPincode(parsed.pincode);
      }
    } catch {
      // ignore
    }
  }, [profile, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);

    const formattedAddress = [
      addressLine1.trim(),
      addressLine2.trim(),
      city.trim(),
      stateName.trim() ? `${stateName.trim()} - ${pincode.trim()}` : pincode.trim()
    ].filter(Boolean).join(", ");

    const details = {
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim(),
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim()
    };

    try {
      // 1. Sync to local storage for checkout autofill
      localStorage.setItem("user_address_details", JSON.stringify(details));
      localStorage.setItem("user_address", formattedAddress);
      window.dispatchEvent(new Event("storage"));

      // 2. Persist in Supabase auth user_metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          address: formattedAddress,
          address_details: details
        }
      });

      // 3. Update profiles table
      await supabase.from("profiles").update({
        name: fullName.trim()
      }).eq("id", user.id);

      // 4. Update authStore
      await updateProfile({
        name: fullName.trim()
      });

      setMessage({ type: 'success', text: 'Name and delivery address saved successfully! ✨' });
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A2818]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24 px-6 pb-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))] md:pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-taupe hover:text-[#4A2818] transition-colors font-medium mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white border border-espresso/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm overflow-hidden">
            <User className="w-12 h-12 text-taupe/40" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-espresso">
            {fullName || profile?.name || user.email?.split("@")[0] || "My Profile"}
          </h1>
          <p className="text-taupe text-lg mt-1 capitalize">
            {profile?.role === "customer" ? "Customer Account" : `${profile?.role || 'Customer'} Account`}
          </p>
        </div>

        <Card className="border-espresso/5 shadow-xl shadow-espresso/5 rounded-[2rem] overflow-hidden bg-white p-6 md:p-8">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-espresso/10 mb-6">
            <CardTitle className="text-2xl font-bold font-heading text-espresso">
              Account Details
            </CardTitle>
            <CardDescription className="text-base text-taupe mt-1">
              Manage your personal information and delivery address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-0">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {message && (
                <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : null}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider">
                  Personal Information
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso flex items-center gap-1.5">
                    <User size={14} className="text-[#8B4513]" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso flex items-center gap-1.5">
                    <Mail size={14} className="text-[#8B4513]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso/10 bg-black/[0.03] text-sm text-taupe font-medium cursor-not-allowed"
                  />
                  <p className="text-[11px] text-taupe">Email address cannot be changed directly.</p>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-4 pt-4 border-t border-espresso/10">
                <h3 className="text-xs font-bold text-[#8C6D58] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#8B4513]" /> Saved Delivery Address
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso">
                    Flat / House No. / Building / Apartment
                  </label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="e.g. Flat 4B, Emerald Heights"
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-espresso">
                    Street / Landmark / Area
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Near Technopark Phase 1, Kazhakuttom"
                    className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso">City / Town</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Trivandrum"
                      className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Kerala"
                      className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-espresso">PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 695582"
                      className="w-full px-4 py-2.5 rounded-xl border border-espresso/15 bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#4A2818] text-sm text-espresso font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 bg-[#4A2818] hover:bg-[#361B0E] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{isSaving ? "Saving Changes..." : "Save Changes"}</span>
                </Button>
              </div>
            </form>

            <div className="pt-6 mt-6 border-t border-espresso/10">
              <Button
                type="button"
                onClick={handleSignOut}
                variant="outline"
                className="w-full py-5 text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
