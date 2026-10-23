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
          <h1 className="font-heading font-black text-3xl text-[#351E28]">
            Physical Store & Brand Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#351E28]/70 mt-0.5">
            Configure store name, Bangalore address, WhatsApp ordering number, and announcement banner
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#351E28]/20 bg-white hover:bg-[#F8F7F0] text-xs font-bold text-[#351E28] transition-all self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-3xl border-2 border-[#351E28]/10 shadow-sm p-6 sm:p-8">
        
        {isSaved && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settings saved successfully! Changes are immediately active on the storefront.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Store Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Physical Store Name *
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Store Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
              />
            </div>
          </div>

          {/* Announcement Banner */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
              Top Announcement Bar Message
            </label>
            <input
              type="text"
              value={settings.announcement}
              onChange={(e) => handleChange('announcement', e.target.value)}
              placeholder="e.g. In-Store Counter Pickup Available · Order on WhatsApp for Same-Day Ready!"
              className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#351E28] outline-none"
            />
          </div>

          {/* Physical Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
              Physical Store Address *
            </label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-semibold text-[#351E28] outline-none"
            />
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Store WhatsApp Order Desk Number *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="919999999999 (country code + 10 digits)"
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-mono font-bold text-[#351E28] outline-none"
              />
              <span className="text-[10px] text-[#351E28]/50 mt-1 block">
                All checkout messages will open to this WhatsApp account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Store Phone Call Number
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-semibold text-[#351E28] outline-none"
              />
            </div>
          </div>

          {/* Opening Hours & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-semibold text-[#351E28] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-semibold text-[#351E28] outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1.5">
              Store Description (Shown in Footer & About)
            </label>
            <textarea
              rows={3}
              value={settings.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#351E28] outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#351E28]/10 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-sm shadow-lg shadow-[#FF5C34]/25 transition-all active:scale-95"
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
