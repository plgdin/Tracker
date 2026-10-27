import { useNavigate } from 'react-router-dom';
import { Store, Globe, ChevronRight, X, Hotel } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface AdminPortalProps {
  isModal?: boolean;
  onClose?: () => void;
  /** When true, shows customer-facing store selector instead of admin portal links */
  isCustomerMode?: boolean;
}

export default function AdminPortal({ isModal = false, onClose, isCustomerMode = false }: AdminPortalProps) {
  const navigate = useNavigate();
  const { setStoreType, setClientSegment } = useAppStore();

  const handleOnlineSelect = () => {
    if (isCustomerMode) {
      setClientSegment('hotel');
      if (onClose) onClose();
    } else {
      setStoreType('online');
      if (isModal && onClose) onClose();
      navigate('/adminonline');
    }
  };

  const handleOfflineSelect = () => {
    if (isCustomerMode) {
      setClientSegment('bakery');
      if (onClose) onClose();
    } else {
      setStoreType('offline');
      if (isModal && onClose) onClose();
      navigate('/adminoffline');
    }
  };

  // Customer-facing copy
  const heading = isCustomerMode
    ? 'Choose Your Store'
    : 'Select Admin Portal';

  const subtitle = isCustomerMode
    ? 'Browse products from our Hotel or Bakery collection.'
    : 'Choose which store environment you want to manage today.';

  const onlineTitle = isCustomerMode ? 'Hotel Store' : 'Online Store';
  const offlineTitle = isCustomerMode ? 'Bakery Store' : 'Offline Store';

  const onlineDescription = isCustomerMode
    ? 'Explore premium ingredients, chef supplies, and culinary essentials for hotel kitchens.'
    : 'Manage your public website storefront, online products, featured categories, and digital sales tracking.';

  const offlineDescription = isCustomerMode
    ? 'Discover fresh baking supplies, tools, moulds, and everything for your bakery needs.'
    : 'Manage physical inventory, in-store sales, back-office ledger, staff accounts, and purchasing.';

  const onlineCta = isCustomerMode ? 'Browse Hotel Store' : 'Enter Portal';
  const offlineCta = isCustomerMode ? 'Browse Bakery Store' : 'Enter Portal';

  const OnlineIcon = isCustomerMode ? Hotel : Globe;

  return (
    <div className={`${isModal ? 'fixed inset-0 z-[100] overflow-y-auto' : 'min-h-screen relative'} bg-cream flex flex-col items-center justify-center p-6 overflow-hidden`}>
      {/* Close button for modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/85 hover:bg-white text-espresso shadow-soft hover:shadow-card transition-all duration-300 transform hover:scale-105 cursor-pointer border border-espresso/5"
          style={{ padding: '0.75rem' }}
          aria-label="Close store selector"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-burnt-orange/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E3A393]/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-20 w-[500px] h-[500px] bg-taupe/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 w-full max-w-4xl mx-auto my-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mb-4">
            {heading}
          </h1>
          <p className="text-taupe text-lg">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full">
          {/* Online Store Card */}
          <button
            onClick={handleOnlineSelect}
            className="group relative bg-white rounded-3xl p-8 text-left border-[6px] border-white shadow-soft hover:shadow-card hover:border-burnt-orange transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            style={{ padding: '2rem' }}
          >
            <div className="w-16 h-16 bg-burnt-orange/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <OnlineIcon className="w-8 h-8 text-burnt-orange" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-3 flex items-center justify-between">
              {onlineTitle}
              <ChevronRight className="w-6 h-6 text-taupe/30 group-hover:text-burnt-orange group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-taupe leading-relaxed text-sm">
              {onlineDescription}
            </p>
            <div className="mt-8 flex items-center text-sm font-semibold text-burnt-orange">
              {onlineCta}
            </div>
          </button>

          {/* Offline Store Card */}
          <button
            onClick={handleOfflineSelect}
            className="group relative bg-white rounded-3xl p-8 text-left border-[6px] border-white shadow-soft hover:shadow-card hover:border-espresso transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
            style={{ padding: '2rem' }}
          >
            <div className="w-16 h-16 bg-espresso/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Store className="w-8 h-8 text-espresso" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-3 flex items-center justify-between">
              {offlineTitle}
              <ChevronRight className="w-6 h-6 text-taupe/30 group-hover:text-espresso group-hover:translate-x-1 transition-all" />
            </h2>
            <p className="text-taupe leading-relaxed text-sm">
              {offlineDescription}
            </p>
            <div className="mt-8 flex items-center text-sm font-semibold text-espresso">
              {offlineCta}
            </div>
          </button>
        </div>

        {isModal && onClose && (
          <div className="text-center mt-10 animate-fade-in-up">
            <button
              onClick={onClose}
              className="text-taupe hover:text-burnt-orange font-semibold text-sm transition-colors underline underline-offset-4 cursor-pointer"
            >
              {isCustomerMode ? 'Skip for now' : 'Or view storefront instead'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
