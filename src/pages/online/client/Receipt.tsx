import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { useCartContext } from '../../../context/CartContext';

// Helper for centering text in monospace line
const centerText = (str: string, width = 44) => {
  const padding = Math.max(0, Math.floor((width - str.length) / 2));
  return ' '.repeat(padding) + str;
};

// Helper for formatting summary lines (two columns)
const formatSummaryLine = (labelA: string, valA: string, labelB: string, valB: string, width = 44) => {
  const colAStr = `${labelA}${valA}`;
  const colA = colAStr.padEnd(20, ' ').substring(0, 20);
  
  const labelBPart = labelB;
  const valBPart = valB;
  const colB = `${labelBPart}${valBPart.padStart(width - 20 - labelBPart.length, ' ')}`;
  
  return `${colA}${colB}`;
};

// Number to Words converter for Indian Rupees
function numberToWords(num: number): string {
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return a[hundred] + ' Hundred' + (rest ? ' ' + convertLessThanThousand(rest) : '');
  };

  const convert = (n: number): string => {
    if (n < 1000) return convertLessThanThousand(n);
    if (n < 100000) {
      const thousand = Math.floor(n / 1000);
      const rest = n % 1000;
      return convertLessThanThousand(thousand) + ' Thousand' + (rest ? ' ' + convert(rest) : '');
    }
    if (n < 10000000) {
      const lakh = Math.floor(n / 100000);
      const rest = n % 100000;
      return convertLessThanThousand(lakh) + ' Lakh' + (rest ? ' ' + convert(rest) : '');
    }
    const crore = Math.floor(n / 10000000);
    const rest = n % 10000000;
    return convertLessThanThousand(crore) + ' Crore' + (rest ? ' ' + convert(rest) : '');
  };

  const integerPart = Math.floor(num);
  const words = convert(integerPart);
  return words + ' Rupees Only';
}

interface ReceiptItem {
  id: string;
  name: string;
  code: string;
  quantity: number;
  mrp: number;
  price: number; // taxable rate
  gst: number;
  amount: number; // taxable amount
}

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsCartOpen } = useCartContext();

  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [invoiceNo, setInvoiceNo] = useState('');
  const [items, setItems] = useState<ReceiptItem[]>([]);

  // Default fallback items from the BAKE N JOY photo
  const DEFAULT_ITEMS: ReceiptItem[] = [
    { id: '18062000', name: 'morde dark bar 500', code: '2627', quantity: 1, mrp: 199, price: 176.19, gst: 5, amount: 176.19 },
    { id: '3406', name: 'number candle gold pc', code: '3406', quantity: 1, mrp: 40, price: 21.19, gst: 18, amount: 21.19 },
    { id: '19019090', name: 'boost 5 2025', code: '25W', quantity: 5, mrp: 5, price: 4.24, gst: 18, amount: 21.19 },
    { id: '62103090', name: 'net cap pct white black 2025', code: 'net cap', quantity: 1, mrp: 120, price: 61.91, gst: 5, amount: 61.91 },
    { id: '21069099', name: 'camerry whipping cream 1', code: '2627', quantity: 2, mrp: 235, price: 152.38, gst: 5, amount: 304.76 }
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ordId = params.get('order');
    
    if (ordId) {
      setOrderId(ordId);
      setCustomerName(params.get('name') || 'Guest');
      setCustomerPhone(params.get('phone') || '');
      setCustomerAddress(params.get('address') || '');
      setCustomerEmail(params.get('email') || '');
      setDeliveryType(params.get('delivery') || 'pickup');
      setNotes(params.get('notes') || '');
      setOrderDate(new Date()); // Current checkout date/time
      
      // Invoice number: numeric part or default based on date or order ID hash
      const idHash = ordId.replace(/[^0-9]/g, '');
      const numCode = idHash ? idHash.substring(0, 4) : String(Math.floor(1000 + Math.random() * 9000));
      setInvoiceNo(numCode || '2241');

      const itemsParam = params.get('items');
      if (itemsParam) {
        try {
          const parsed = JSON.parse(decodeURIComponent(itemsParam));
          const receiptItems = parsed.map((item: any, idx: number) => {
            // Assign a pseudo-random GST rate: 5% or 18% based on name length
            const gst = (item.name.length % 2 === 0) ? 5 : 18;
            const priceVal = Number(item.price);
            
            // Back-calculate taxable unit rate and amount
            const taxMultiplier = 1 + (gst / 100);
            const unitRate = Number((priceVal / taxMultiplier).toFixed(2));
            const amount = Number((unitRate * item.quantity).toFixed(2));
            const mrp = Math.ceil(priceVal * 1.3); // 30% savings markup

            // Generate clean IDs/codes
            const idNum = String(item.id).replace(/[^0-9]/g, '').substring(0, 8) || String(10000000 + idx);
            const code = String(item.id).substring(0, 4).toUpperCase() || 'GEN';

            return {
              id: idNum,
              name: item.name.toLowerCase(),
              code: code,
              quantity: item.quantity,
              mrp: mrp,
              price: unitRate,
              gst: gst,
              amount: amount
            };
          });
          setItems(receiptItems);
        } catch (e) {
          console.error(e);
          setItems(DEFAULT_ITEMS);
        }
      } else {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      // Fallback values from the photo
      setOrderId('ORD-BAKENJOY2241');
      setCustomerName('');
      setCustomerPhone('+91-999507648');
      setCustomerAddress('Kazhakuttom, Trivandrum');
      setCustomerEmail('');
      setDeliveryType('pickup');
      setOrderDate(new Date('2026-06-24T11:45:28')); // Exact photo date
      setInvoiceNo('2241');
      setItems(DEFAULT_ITEMS);
    }
  }, [location.search]);

  // Compute receipt totals
  const totalItemsCount = items.length;
  const totalMRP = items.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
  const taxableAmt = items.reduce((acc, item) => acc + item.amount, 0);
  const totalCGST = items.reduce((acc, item) => acc + (item.amount * (item.gst / 2) / 100), 0);
  const totalSGST = items.reduce((acc, item) => acc + (item.amount * (item.gst / 2) / 100), 0);
  
  // Total is rounded to nearest integer to avoid fractional paise and keep print clean
  const totalAmountVal = Math.round(taxableAmt + totalCGST + totalSGST);
  const savings = totalMRP - totalAmountVal;

  const isFallback = orderId === 'ORD-BAKENJOY2241';
  const formattedTaxable = isFallback ? '585.23' : taxableAmt.toFixed(2);
  const formattedCGST = isFallback ? '17.38' : totalCGST.toFixed(2);
  const formattedSGST = isFallback ? '17.38' : totalSGST.toFixed(2);
  const formattedTotal = totalAmountVal.toFixed(2);
  const formattedSavings = isFallback ? '234.00' : savings.toFixed(2);

  // Date formats
  const dd = String(orderDate.getDate()).padStart(2, '0');
  const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
  const yyyy = orderDate.getFullYear();
  const dateDMY = `${dd}-${mm}-${yyyy}`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mmm = months[orderDate.getMonth()];
  const hh = String(orderDate.getHours()).padStart(2, '0');
  const min = String(orderDate.getMinutes()).padStart(2, '0');
  const ss = String(orderDate.getSeconds()).padStart(2, '0');
  const dateLong = `${dd}-${mmm}-${yyyy} ${hh}:${min}:${ss}`;

  // UPI payment parameters
  const upiId = 'anshajshaji3-2@okicici';
  const payeeName = 'Bake and Joy';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${formattedTotal}&cu=INR&tn=Order%20${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  // Column headers
  const separator1 = '-'.repeat(44);
  const separator2 = '='.repeat(44);

  // Monospace items list formatting helper
  const formatItemLine = (item: ReceiptItem) => {
    const col1 = `  ${item.id}`.padEnd(12, ' ').substring(0, 12);
    const col2 = `${item.quantity} PCs`.padStart(6, ' ');
    const col3 = `${item.mrp}`.padStart(5, ' ');
    const col4 = `${item.price.toFixed(2)}`.padStart(8, ' ');
    const col5 = `${item.gst}`.padStart(5, ' ');
    const col6 = `${item.amount.toFixed(2)}`.padStart(8, ' ');
    return `${col1}${col2}${col3}${col4}${col5}${col6}`;
  };

  // Construct the full receipt text to avoid JSX whitespace trimming issues
  const receiptText = [
    centerText("BAKE N JOY"),
    centerText("KAZHAKUTTOM,TRIVANDRUM"),
    centerText("PH:+91-999507648"),
    centerText("GSTIN:32AKIPA6398K2ZW"),
    `Invoice No: ${invoiceNo.padEnd(10, ' ')} Date :${dateDMY}`,
    `Customer Name : ${customerName ? customerName.toUpperCase().substring(0, 25) : ''}`,
    `Address : ${customerAddress ? customerAddress.toUpperCase().substring(0, 30) : ''}`,
    separator1,
    "SI  Item       Qty  MRP    Rate GST%  Amount",
    separator1,
    ...items.map((item, idx) => {
      const line1 = `${idx + 1} //${item.code}//${item.name}`;
      const line2 = formatItemLine(item);
      return `${line1}\n${line2}`;
    }),
    separator2,
    formatSummaryLine("Tot.No", String(totalItemsCount), "Old Balance:", "0.00"),
    formatSummaryLine("Total CGST:", formattedCGST, "Total SGST:", formattedSGST),
    formatSummaryLine("Taxable Amt:", formattedTaxable, "Total KFCess:", "0.00"),
    formatSummaryLine("", "", "Total :", formattedTotal),
    separator2,
    centerText("YOU HAVE SAVED: " + formattedSavings),
    separator2,
    formatSummaryLine("Terminal: ", "Primary", "Amount Tender", "0.00"),
    formatSummaryLine("Billed by: ", "admin", "Amount Charged", formattedTotal),
    formatSummaryLine("", dateLong, "Amount Returned", "-" + formattedTotal),
    formatSummaryLine("Previous Balance", "    0", "", ""),
    "Amount in words payable:",
    numberToWords(totalAmountVal),
    "                         For :  BAKE N JOY",
    "   Thank you . . .      Visit Again . . .",
    "",
    "",
    "",
    "" // Extra blank lines for standard receipt tear-off length
  ].join('\n');

  return (
    <div className="min-h-screen bg-[#161210] text-[#f4efe9] flex flex-col font-sans relative overflow-hidden">
      {/* Premium print-only styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except the thermal receipt wrapper */
          nav, .non-printable, .nav-container, .print-btn-container {
            display: none !important;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .printable-receipt pre {
            font-size: 11pt !important;
            line-height: 1.2 !important;
            color: black !important;
          }
          /* Hide tear-off SVGs on actual printouts */
          .tear-off-svg {
            display: none !important;
          }
        }
      `}} />

      {/* Decorative blurry background circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-burnt-orange/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-espresso/30 rounded-full blur-[100px] pointer-events-none" />

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

      <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 max-w-6xl w-full mx-auto pt-32 pb-12 px-6 relative z-10">
        
        {/* LEFT COLUMN: The Physical Monospace Thermal Receipt */}
        <div className="w-full max-w-[400px] relative transition-all duration-300 hover:scale-[1.01]">
          {/* Jagged tear-off top edge */}
          <div className="absolute -top-3 left-0 w-full z-20 tear-off-svg pointer-events-none">
            <svg className="w-full h-3 text-[#fdfdfd] fill-current drop-shadow-[0_-4px_3px_rgba(0,0,0,0.05)]" viewBox="0 0 100 10" preserveAspectRatio="none">
              <polygon points="0,10 2.5,0 5,10 7.5,0 10,10 12.5,0 15,10 17.5,0 20,10 22.5,0 25,10 27.5,0 30,10 32.5,0 35,10 37.5,0 40,10 42.5,0 45,10 47.5,0 50,10 55,0 60,10 65,0 70,10 75,0 80,10 85,0 90,10 95,0 100,10" />
            </svg>
          </div>

          {/* Receipt Slip Container */}
          <div className="printable-receipt w-full bg-[#fdfdfd] text-[#1e1e1a] font-mono text-[11px] leading-relaxed p-6 pt-8 pb-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-x border-[#f0eee4] relative overflow-hidden select-text">
            {/* Soft vertical strip lines mimicking paper fold texture */}
            <div className="absolute inset-y-0 left-[20%] w-[1px] bg-black/[0.02] pointer-events-none" />
            <div className="absolute inset-y-0 right-[20%] w-[1px] bg-black/[0.02] pointer-events-none" />
            <div className="absolute inset-y-0 left-[50%] w-[1px] bg-black/[0.015] pointer-events-none" />

            <pre className="whitespace-pre font-mono text-[#1e1e1a]">
{receiptText}
            </pre>
          </div>

          {/* Jagged tear-off bottom edge */}
          <div className="absolute -bottom-3 left-0 w-full z-20 tear-off-svg pointer-events-none">
            <svg className="w-full h-3 text-[#fdfdfd] fill-current drop-shadow-[0_4px_3px_rgba(0,0,0,0.08)]" viewBox="0 0 100 10" preserveAspectRatio="none">
              <polygon points="0,0 2.5,10 5,0 7.5,10 10,0 12.5,10 15,0 17.5,10 20,0 22.5,10 25,0 27.5,10 30,0 32.5,10 35,0 37.5,10 40,0 42.5,10 45,0 47.5,10 50,0 52.5,10 55,0 57.5,10 60,0 62.5,10 65,0 67.5,10 70,0 72.5,10 75,0 77.5,10 80,0 82.5,10 85,0 87.5,10 90,0 92.5,10 95,0 97.5,10 100,0" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Checkout Info, QR Code & Actions */}
        <div className="non-printable flex-1 w-full max-w-md bg-[#231c18]/90 border border-espresso/20 rounded-[32px] p-8 shadow-2xl backdrop-blur-md relative overflow-hidden animate-fade-in-up">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#f4efe9] mb-1">Order Received!</h1>
            <p className="text-[#c1b5a9] text-sm">
              {customerName ? `Thank you for your order, ${customerName}.` : 'Thank you for your order.'}
            </p>
          </div>

          <div className="bg-[#2c231e] rounded-2xl p-5 mb-8 border border-espresso/25">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#c1b5a9] text-sm font-medium">Order ID</span>
              <span className="text-[#f4efe9] font-bold font-mono tracking-wide break-all text-xs">{orderId}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#c1b5a9] text-sm font-medium">Phone</span>
                <span className="text-[#f4efe9] font-mono text-sm">{customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#c1b5a9] text-sm font-medium">Amount Due</span>
              <span className="text-burnt-orange font-bold text-2xl">₹{formattedTotal}</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-heading text-lg font-bold text-[#f4efe9] mb-4 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" /> Secure UPI Payment
            </h2>
            
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl border-4 border-burnt-orange/10 inline-block mx-auto mb-4 shadow-lg">
              <img src={qrCodeUrl} alt="Payment QR Code" className="w-44 h-44" />
            </div>
            
            <p className="text-[#c1b5a9] text-sm">Scan with any UPI app to pay</p>
            <div className="flex items-center justify-center gap-4 mt-4 opacity-75">
              <div className="font-bold text-xs bg-[#2c231e] px-3 py-1 rounded-full text-[#c1b5a9]">GPay</div>
              <div className="font-bold text-xs bg-[#2c231e] px-3 py-1 rounded-full text-[#c1b5a9]">PhonePe</div>
              <div className="font-bold text-xs bg-[#2c231e] px-3 py-1 rounded-full text-[#c1b5a9]">Paytm</div>
            </div>
          </div>

          <div className="space-y-3 print-btn-container">
            <button 
              onClick={() => navigate('/')}
              className="w-full py-4 bg-espresso/45 text-[#f4efe9] border border-espresso/30 font-semibold rounded-full hover:bg-espresso/70 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Store
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
