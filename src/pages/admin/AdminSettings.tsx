import { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, Copy, ExternalLink, Image, Store, Star, MapPin } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import type { StoreSettings } from '../../types/ecommerce';
import { INITIAL_SETTINGS, STORE_SHOWROOM_IMAGES } from '../../services/mockData';

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A6153]/70">Configuration</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2818]">
            Store & Brand Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5">
            Configure store branding, Kazhakuttam physical address, WhatsApp counter ordering desk, and showroom catalog assets
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

      {/* Verified Business Profile Card */}
      <div className="bg-[#4A2818] text-[#F9F4EE] rounded-[2.5rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-xs">
              <Store className="w-3.5 h-3.5 text-[#EAF05C]" />
              <span>Verified Store Profile · Justdial Listing</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bake N Joy — Kazhakuttam
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
              <span className="inline-flex items-center gap-1 font-bold text-[#EAF05C]">
                <Star className="w-3.5 h-3.5 fill-[#EAF05C] text-[#EAF05C]" />
                5.0 Rating (690 Verified Reviews)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-white/70" />
                Kazhakoottam to Karyavattom Road, Thiruvananthapuram
              </span>
            </div>
            <p className="text-xs text-white/70 max-w-2xl leading-relaxed pt-1">
              <strong>Business Nature:</strong> Baking Tool Dealers, Cake Moulds, Couverture Chocolate & Raw Materials, Cake Packaging. <span className="text-[#EAF05C] font-semibold">(Retail & Wholesale Supply Store · Not an eating bakery)</span>.
            </p>
          </div>

          <a
            href="https://www.justdial.com/Thiruvananthapuram/Bake-N-Joy-Kazhakuttam/0471PX471-X471-190622133608-Y4J6_BZDET"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#4A2818] hover:bg-[#F2E7DC] font-serif font-bold text-xs shadow-md transition-all shrink-0 self-start md:self-center"
          >
            <span>View Source on Justdial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
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
                placeholder="919447113608 (country code + 10 digits)"
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

      {/* Showroom & Scraped JD Media Gallery Section */}
      <div className="bg-white rounded-[2.5rem] border border-[#E8D8CC] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A2818] mb-1">
              <Image className="w-4 h-4" />
              <span>Store Showroom & Catalogue Images</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2818]">
              Scraped Justdial Visual Media
            </h3>
            <p className="text-xs text-[#7A6153] mt-0.5">
              Authentic high-resolution photographs of Bake N Joy Kazhakuttam store shelves, baking tools, cake packaging, and ingredients. Click to copy URLs for use in products.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2E7DC] text-[#4A2818] shrink-0 self-start sm:self-auto">
            {STORE_SHOWROOM_IMAGES.length} Authentic Photos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {STORE_SHOWROOM_IMAGES.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl border border-[#E8D8CC] overflow-hidden bg-[#FCFAF7] shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="aspect-4/3 w-full overflow-hidden bg-stone-100 relative">
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4A2818]/80 text-white backdrop-blur-xs">
                  {img.category}
                </span>
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                <h4 className="font-serif font-bold text-xs text-[#4A2818] line-clamp-1">
                  {img.title}
                </h4>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E8D8CC]/60">
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#7A6153] hover:text-[#4A2818]"
                  >
                    <span>View HD</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(img.url, img.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-[#F2E7DC] hover:bg-[#E8D8CC] text-[#4A2818] transition-colors"
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
