import { useState } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { Link } from "react-router-dom";
import { FileText, ShieldAlert, ArrowLeft } from "lucide-react";

export default function TermsAndConditions() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sections = [
    { id: "introduction", title: "1. Introduction & Acceptance" },
    { id: "accounts", title: "2. Account Registration & Security" },
    { id: "products", title: "3. Products, Pricing & Payment" },
    { id: "shipping", title: "4. Shipping, Deliveries & Pickup" },
    { id: "returns", title: "5. Returns, Refunds & Cancellations" },
    { id: "intellectual-property", title: "6. Intellectual Property" },
    { id: "liability", title: "7. Limitation of Liability" },
    { id: "governing-law", title: "8. Governing Law" },
    { id: "contact", title: "9. Contact Information" },
  ];

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col font-sans">
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-16 px-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-taupe">
          <Link to="/" className="hover:text-burnt-orange transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span>/</span>
          <span className="text-espresso font-semibold">Terms & Conditions</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-soft border border-espresso/5 mb-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-burnt-orange/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <span className="px-3 py-1 bg-burnt-orange/10 text-burnt-orange rounded-full text-xs font-bold uppercase tracking-wider">
              Legal Information
            </span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-3">
              Terms & Conditions
            </h1>
            <p className="text-taupe mt-4 text-lg leading-relaxed">
              Welcome to Bake & Joy. Please read these terms and conditions carefully before using our website or placing an order. By accessing or using any part of the site, you agree to be bound by these Terms of Service.
            </p>
            <p className="text-taupe/80 text-sm mt-4">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Layout: Sidebar + Terms Text */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents / Sidebar */}
          <aside className="lg:w-1/4 lg:sticky lg:top-28 h-fit bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-espresso/5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-espresso/70 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-burnt-orange" /> Table of Contents
            </h2>
            <nav className="flex flex-col gap-2">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollTo(sec.id)}
                  className="text-left text-sm text-taupe hover:text-burnt-orange hover:bg-burnt-orange/5 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  {sec.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Terms Text Content */}
          <article className="lg:w-3/4 bg-white p-8 md:p-12 rounded-3xl shadow-soft border border-espresso/5 prose prose-stone max-w-none">
            <div className="space-y-12 text-espresso/80 leading-relaxed">
              
              <section id="introduction" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  1. Introduction & Acceptance
                </h2>
                <p>
                  These Terms & Conditions ("Terms") govern your use of the website operated by <strong>Bake & Joy</strong>, located at this domain, and any related services, tools, and products offered through this platform.
                </p>
                <p className="mt-3">
                  Throughout the site, the terms "we", "us", and "our" refer to Bake & Joy. We offer this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
                </p>
                <p className="mt-3">
                  By visiting our site and/or purchasing something from us, you engage in our "Service" and agree to be bound by the following terms and conditions, including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
                </p>
              </section>

              <section id="accounts" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  2. Account Registration & Security
                </h2>
                <p>
                  To access certain features of the platform, including saving shopping lists, reviewing ledger entries, and checking out faster, you may be required to register for an account.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>You must provide accurate, current, and complete information during the registration process.</li>
                  <li>You are responsible for safeguarding your password and any activities or actions under your account.</li>
                  <li>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                  <li>We reserve the right to refuse service, terminate accounts, or remove/edit content at our sole discretion.</li>
                </ul>
              </section>

              <section id="products" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  3. Products, Pricing & Payment
                </h2>
                <p>
                  We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the site. However, we do not guarantee that the product descriptions, colors, or other content are accurate, complete, reliable, current, or error-free.
                </p>
                <p className="mt-3">
                  All prices are subject to change without notice. We reserve the right at any time to modify or discontinue any product or service without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the service.
                </p>
                <p className="mt-3">
                  We accept various forms of payment, which will be displayed at the checkout. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.
                </p>
              </section>

              <section id="shipping" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  4. Shipping, Deliveries & Pickup
                </h2>
                <p>
                  Bake & Joy offers shipping, local delivery, and in-store pickup options depending on your location and preferences.
                </p>
                <p className="mt-3">
                  Delivery dates and times are estimates only and cannot be guaranteed. We are not responsible for delays caused by shipping carriers, weather, incorrect delivery address information, or other circumstances beyond our reasonable control.
                </p>
                <p className="mt-3">
                  For in-store pickups, items must be picked up within the designated store hours as specified during checkout or communicated via email/message. Items not picked up within 48 hours may be subject to cancellation without a refund, especially for perishable goods.
                </p>
              </section>

              <section id="returns" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  5. Returns, Refunds & Cancellations
                </h2>
                <p>
                  Due to the perishable nature of many of our baking ingredients and food supplies, certain items are non-returnable and non-refundable once they have left our store or been shipped.
                </p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li><strong>Non-perishable items:</strong> May be returned within 7 days of delivery or pickup, provided they are in their original, unopened packaging.</li>
                  <li><strong>Perishable ingredients & custom orders:</strong> All sales are final. Cancellations for custom cakes or large orders must be requested at least 48 hours in advance to be eligible for a refund or store credit.</li>
                  <li><strong>Damaged goods:</strong> If you receive a damaged or incorrect product, please contact us within 24 hours of receipt with photo proof to arrange a replacement or refund.</li>
                </ul>
              </section>

              <section id="intellectual-property" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  6. Intellectual Property
                </h2>
                <p>
                  The Service and its original content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Bake & Joy, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
                </p>
              </section>

              <section id="liability" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  7. Limitation of Liability
                </h2>
                <div className="bg-espresso/5 border-l-4 border-burnt-orange p-4 rounded-r-xl mb-4 flex gap-3">
                  <ShieldAlert className="w-6 h-6 text-burnt-orange shrink-0 mt-0.5" />
                  <p className="text-sm text-espresso/90">
                    In no event shall Bake & Joy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </div>
                <p>
                  We do not guarantee, represent, or warrant that your use of our service will be uninterrupted, timely, secure, or error-free. You agree that from time to time we may remove the service for indefinite periods of time or cancel the service at any time, without notice to you.
                </p>
              </section>

              <section id="governing-law" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  8. Governing Law
                </h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                </p>
                <p className="mt-3">
                  Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </section>

              <section id="contact" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-espresso font-heading border-b border-espresso/10 pb-3 mb-4">
                  9. Contact Information
                </h2>
                <p>
                  Questions about the Terms & Conditions should be sent to us at:
                </p>
                <div className="mt-4 p-6 bg-cream/50 rounded-2xl border border-espresso/5 space-y-2">
                  <p><strong>Business Name:</strong> Bake & Joy Stores</p>
                  <p><strong>WhatsApp Support:</strong> +91-9876543210</p>
                  <p><strong>Support Hours:</strong> 9:00 AM - 8:00 PM (Monday - Saturday)</p>
                  <p><strong>Address:</strong> Bake & Joy Main Market Road, Bangalore, Karnataka, India</p>
                </div>
              </section>

            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-dark-chocolate text-white py-12 px-6 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-heading text-2xl font-bold mb-4">
                Bake & Joy
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Your one-stop shop for all baking supplies, decorations, and
                professional bakery equipment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-white/60 hover:text-burnt-orange transition-colors text-sm">
                  Home
                </Link>
                <Link to="/products" className="block text-white/60 hover:text-burnt-orange transition-colors text-sm">
                  Products
                </Link>
                <Link to="/terms" className="block text-white/60 hover:text-burnt-orange transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link to="/terms" className="block text-white/60 hover:text-burnt-orange transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-white/60">
                <p>WhatsApp: +91-9876543210</p>
                <p>Store Hours: 9 AM - 8 PM</p>
                <p>Monday - Saturday</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Bake & Joy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
