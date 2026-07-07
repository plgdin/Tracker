import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useCartContext } from '../../../context/CartContext';

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsCartOpen } = useCartContext();

  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setOrderId(params.get('order') || 'UNKNOWN-ORDER');
    setAmount(params.get('amount') || '0');
    setName(params.get('name') || 'Guest');
  }, [location.search]);

  // Replace with actual UPI ID for the store
  const upiId = 'store@upi';
  const payeeName = 'Bake and Joy';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=Order%20${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={""}
        setSearchQuery={() => {}}
        selectedCategory={undefined}
        setSelectedCategory={() => {}}
        categories={[]}
        inStockOnly={false}
        setInStockOnly={() => {}}
      />
      
      <div className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-card border-[6px] border-white relative overflow-hidden animate-fade-in-up">
          {/* Decorative receipt zig-zag top/bottom could be added, but rounded looks cleaner */}
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-espresso mb-1">Order Received!</h1>
            <p className="text-taupe text-sm">Thank you for your order, {name}.</p>
          </div>

          <div className="bg-cream/50 rounded-2xl p-5 mb-8 border border-espresso/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-taupe text-sm font-medium">Order ID</span>
              <span className="text-espresso font-bold font-sans tracking-wide">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-taupe text-sm font-medium">Total Amount</span>
              <span className="text-burnt-orange font-bold text-xl">₹{amount}</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-heading text-lg font-bold text-espresso mb-4 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" /> Secure UPI Payment
            </h2>
            <div className="bg-white p-4 rounded-2xl border-2 border-espresso/5 inline-block mx-auto mb-4 shadow-soft">
              <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
            </div>
            <p className="text-taupe text-sm">Scan with any UPI app to pay</p>
            <div className="flex items-center justify-center gap-4 mt-3 opacity-60">
              {/* Dummy UPI app icons */}
              <div className="font-bold text-xs">GPay</div>
              <div className="font-bold text-xs">PhonePe</div>
              <div className="font-bold text-xs">Paytm</div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => window.print()}
              className="w-full py-4 bg-espresso/5 text-espresso font-semibold rounded-full hover:bg-espresso/10 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" /> Save Receipt
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-burnt-orange text-white font-semibold rounded-full hover:bg-[#C44D2A] transition-colors flex items-center justify-center gap-2 shadow-md shadow-burnt-orange/20"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
