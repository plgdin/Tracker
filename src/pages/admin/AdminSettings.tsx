import { useState, useEffect } from 'react';
import { Save, RotateCcw, Check } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import type { StoreSettings } from '../../types/ecommerce';
import { INITIAL_SETTINGS } from '../../services/mockData';

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const s = await settingsService.getSettings();
      setSettings(s);
    };
    load();
  }, []);

  const handleChange = (key: keyof StoreSettings, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await settingsService.updateSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = async () => {
    if (confirm('Reset store settings to initial defaults?')) {
      const reset = await settingsService.resetToDefaults();
      setSettings(reset);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A6153]/70">Configuration</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2818]">
            Store & Brand Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5">
            Configure store branding, Trivandrum physical address, WhatsApp counter ordering desk, and announcement banner
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#E8D8CC] bg-white hover:bg-[#F2E7DC] text-xs font-serif font-bold text-[#4A2818] transition-all self-start sm:self-auto shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-[2.5rem] border border-[#E8D8CC] shadow-sm p-6 sm:p-8">
        
        {isSaved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-serif font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Settings saved successfully! Changes are immediately active on your artisan storefront.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Store Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Physical Store Name *
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Store Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
              />
            </div>
          </div>

          {/* Announcement Banner */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
              Top Announcement Bar Message
            </label>
            <input
              type="text"
              value={settings.announcement}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="e.g. In-Store Counter Pickup Available · Order on WhatsApp for Same-Day Ready!"
              className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
            />
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
              Physical Store Address *
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
            />
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Store WhatsApp Order Desk Number *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="919999999999 (country code + 10 digits)"
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-mono font-medium text-[#4A2818] outline-none"
              />
              <span className="text-[10px] text-[#7A6153] mt-1 block">
                All checkout messages will open to this WhatsApp account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Store Phone Call Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-mono font-medium text-[#4A2818] outline-none"
              />
            </div>
          </div>

          {/* Opening Hours & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1.5">
              Store Description (Shown in Footer & About)
            </label>
            <textarea
              rows={3}
              value={settings.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-[#FCFAF7] border border-[#E8D8CC] focus:border-[#4A2818] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#E8D8CC] flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
