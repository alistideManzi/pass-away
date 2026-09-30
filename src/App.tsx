import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { TripResults } from './components/TripResults';
import { SeatSelectorModal } from './components/SeatSelectorModal';
import { PassengerFormModal } from './components/PassengerFormModal';
import { PaymentModal } from './components/PaymentModal';
import { DigitalTicketView } from './components/DigitalTicketView';
import { CustomerBookings } from './components/CustomerBookings';
import { StaffVerifier } from './components/StaffVerifier';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { Ticket } from './types';
import {
  Search,
  Armchair,
  CreditCard,
  QrCode,
  ShieldCheck,
  Clock,
  Sparkles,
  Star,
  Bus,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  // Search state passed between HeroSearch and TripResults
  const [currentFilter, setCurrentFilter] = useState<{
    from: string;
    to: string;
    date: string;
    passengers: number;
  }>({
    from: 'Kigali',
    to: 'Karongi',
    date: '2026-09-30',
    passengers: 1,
  });

  const [inspectTickets, setInspectTickets] = useState<Ticket[]>([]);

  const handleHeroSearch = (from: string, to: string, date: string, passengers: number) => {
    setCurrentFilter({ from, to, date, passengers });
    setActiveView('search');
  };

  const handleViewTickets = (tickets: Ticket[]) => {
    setInspectTickets(tickets);
    setActiveView('ticket-success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <Navbar />

      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {activeView === 'home' && (
          <div>
            <HeroSearch onSearch={handleHeroSearch} />

            {/* How It Works Section */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Simple 4-Step Process
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  How Online Ticket Booking Works
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-xs text-neutral-500">
                  Book your journey across Rwanda in minutes without standing in long station lines.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
                    1. Search Route & Date
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Choose your origin, destination, and travel date to compare all licensed operators in real time.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <Armchair className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
                    2. Select Your Exact Seat
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Interactive bus layout allows you to pick window or aisle seats with automated 10-minute anti-double-booking lock.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
                    3. Pay via Mobile Money
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Approve instant USSD prompt on your MTN MoMo or Airtel Money line, or pay securely with Bank Card.
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-neutral-900 dark:text-white">
                    4. Get Digital QR Ticket
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    Receive your verified boarding pass instantly with verifiable QR code for fast terminal check-in.
                  </p>
                </div>
              </div>
            </section>

            {/* Featured Departures Today */}
            <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    Featured Departures Today
                  </h2>
                  <p className="text-xs text-neutral-500">
                    High-demand morning and afternoon express services
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('search')}
                  className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  View all scheduled trips →
                </button>
              </div>

              <div className="mt-4">
                <TripResults />
              </div>
            </section>

            {/* Customer Testimonials & Reviews */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-neutral-800">
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Verified Traveler Experiences
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  What Rwandan Travelers Say
                </h2>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    "Booking from Kigali to Karongi used to mean arriving at Nyabugogo 2 hours early to queue. With RwandaGo, I picked seat 05 from my phone, paid with MTN MoMo, and boarded smoothly."
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                    <span className="font-bold text-neutral-900 dark:text-white">Alistide Manzi</span>
                    <span className="text-neutral-400">Kigali → Karongi</span>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    "The seat selection layout is so accurate! I traveled with my elderly mother and specifically reserved two front seats together. No double booking, no hassle."
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                    <span className="font-bold text-neutral-900 dark:text-white">Claudine Mukamana</span>
                    <span className="text-neutral-400">Kigali → Musanze</span>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    "The staff scanned my QR ticket directly at Gate 4 in 2 seconds. The digital boarding pass with the tear-off look is super clean and professional."
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                    <span className="font-bold text-neutral-900 dark:text-white">Emmanuel Habimana</span>
                    <span className="text-neutral-400">Kigali → Huye</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SEARCH RESULTS */}
        {activeView === 'search' && (
          <TripResults searchFilter={currentFilter} />
        )}

        {/* VIEW 3: SEAT SELECTION */}
        {activeView === 'seat-select' && (
          <SeatSelectorModal
            onBack={() => setActiveView('search')}
            onProceed={() => setActiveView('passenger-details')}
          />
        )}

        {/* VIEW 4: PASSENGER DETAILS */}
        {activeView === 'passenger-details' && (
          <PassengerFormModal
            onBack={() => setActiveView('seat-select')}
            onProceed={() => setActiveView('payment')}
          />
        )}

        {/* VIEW 5: PAYMENT GATEWAY */}
        {activeView === 'payment' && (
          <PaymentModal
            onBack={() => setActiveView('passenger-details')}
            onSuccess={() => setActiveView('ticket-success')}
          />
        )}

        {/* VIEW 6: DIGITAL TICKET / BOARDING PASS */}
        {activeView === 'ticket-success' && (
          <DigitalTicketView
            tickets={inspectTickets}
            onBackToHome={() => {
              setInspectTickets([]);
              setActiveView('home');
            }}
          />
        )}

        {/* VIEW 7: CUSTOMER MY BOOKINGS */}
        {activeView === 'my-bookings' && (
          <CustomerBookings
            onViewTicket={handleViewTickets}
            onBookNew={() => setActiveView('search')}
          />
        )}

        {/* VIEW 8: STAFF / OPERATOR VERIFIER & MANIFEST */}
        {activeView === 'staff-verifier' && (
          <StaffVerifier />
        )}

        {/* VIEW 9: ADMIN DASHBOARD */}
        {activeView === 'admin-dashboard' && (
          <AdminDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
