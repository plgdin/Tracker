import { useNavigate } from 'react-router-dom';
import { Store, Globe, ChevronRight } from 'lucide-react';

export default function AdminPortal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-burnt-orange/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E3A393]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-taupe/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mb-4">
            Select Admin Portal
          </h1>
          <p className="text-taupe text-lg">
            Choose which store environment you want to manage today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full">
          {/* Online Store Card */}
          <button
            onClick={() => navigate('/adminonline')}
            className="group relative bg-white rounded-3xl p-8 text-left border-[6px] border-white shadow-soft hover:shadow-card hover:border-burnt-orange transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-burnt-orange/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-8 h-8 text-burnt-orange" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-3 flex items-center justify-between">
              Online Store
              <ChevronRight className="w-6 h-6 text-taupe/30 group-hover:text-burnt-orange group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-taupe leading-relaxed text-sm">
              Manage your public website storefront, online products, featured categories, and digital sales tracking.
            </p>
            <div className="mt-8 flex items-center text-sm font-semibold text-burnt-orange">
              Enter Portal
            </div>
          </button>

          {/* Offline Store Card */}
          <button
            onClick={() => navigate('/adminoffline')}
            className="group relative bg-white rounded-3xl p-8 text-left border-[6px] border-white shadow-soft hover:shadow-card hover:border-espresso transition-all duration-300 transform hover:-translate-y-2"
          >
            <div className="w-16 h-16 bg-espresso/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Store className="w-8 h-8 text-espresso" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-3 flex items-center justify-between">
              Offline Store
              <ChevronRight className="w-6 h-6 text-taupe/30 group-hover:text-espresso group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-taupe leading-relaxed text-sm">
              Manage physical inventory, in-store sales, back-office ledger, staff accounts, and purchasing.
            </p>
            <div className="mt-8 flex items-center text-sm font-semibold text-espresso">
              Enter Portal
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
