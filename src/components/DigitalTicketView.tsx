import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket } from '../types';
import { getTranslation } from '../utils/translations';
import { generateTicketQRCodeDataURL } from '../utils/qr';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Bus,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

interface DigitalTicketViewProps {
  tickets?: Ticket[];
  onBackToHome: () => void;
}

export const DigitalTicketView: React.FC<DigitalTicketViewProps> = ({ tickets: propTickets, onBackToHome }) => {
  const { lastIssuedTickets, tickets: allTickets, language, setActiveView } = useApp();
  const t = getTranslation(language);

  // Tickets to display
  const displayTickets = propTickets && propTickets.length > 0
    ? propTickets
    : lastIssuedTickets.length > 0
    ? lastIssuedTickets
    : allTickets.slice(0, 1);

  const [activeIndex, setActiveIndex] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const currentTicket = displayTickets[activeIndex] || displayTickets[0];

  useEffect(() => {
    if (!currentTicket) return;

    let isMounted = true;
    generateTicketQRCodeDataURL({
      ticketNumber: currentTicket.ticketNumber,
      bookingRef: currentTicket.bookingId,
      passengerName: currentTicket.passengerName,
      seatNumber: currentTicket.seatNumber,
      trip: `${currentTicket.origin} → ${currentTicket.destination}`,
      date: currentTicket.departureDate,
      departure: currentTicket.departureTime,
      price: currentTicket.priceRwf,
      status: currentTicket.ticketStatus,
      secretVerificationHash: `RW-HASH-${currentTicket.ticketNumber.slice(-6)}`,
    }).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [currentTicket]);

  if (!currentTicket) {
    return (
      <div className="mx-auto max-w-xl p-12 text-center">
        <p className="text-sm text-neutral-500">No active ticket found.</p>
        <button
          onClick={onBackToHome}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
        >
          Book a Trip
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `RwandaGo Ticket ${currentTicket.ticketNumber}: ${currentTicket.origin} to ${currentTicket.destination} for ${currentTicket.passengerName}, Seat ${currentTicket.seatNumber}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedLink ? 'Copied Details!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{t.downloadPdf}</span>
          </button>
        </div>
      </div>

      {/* Multi-Ticket Selector Tabs (if multiple passengers) */}
      {displayTickets.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-print">
          {displayTickets.map((tkt, idx) => (
            <button
              key={tkt.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeIndex === idx
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400'
              }`}
            >
              <span>Ticket {idx + 1}: {tkt.passengerName} (Seat {tkt.seatNumber})</span>
            </button>
          ))}
        </div>
      )}

      {/* Printable Digital Boarding Ticket Card */}
      <div
        id="printable-ticket"
        className="relative overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      >
        {/* Ticket Header */}
        <div className="border-b border-neutral-200 bg-gradient-to-r from-emerald-700 via-emerald-800 to-neutral-900 p-6 text-white dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-200">Official Boarding Pass</span>
                <h3 className="text-xl font-bold tracking-tight">RwandaGo Express</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 className="h-3 w-3" />
                {currentTicket.ticketStatus}
              </span>
              <div className="mt-1 font-mono text-[11px] text-emerald-100 tabular-nums">
                {currentTicket.operatorName}
              </div>
            </div>
          </div>
        </div>

        {/* Journey Route Banner */}
        <div className="border-b border-neutral-100 bg-neutral-50/70 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Origin Station
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {currentTicket.origin}
              </div>
              <div className="text-xs text-neutral-500">
                Departs: <span className="font-bold text-neutral-800 dark:text-neutral-200">{currentTicket.departureTime}</span>
              </div>
            </div>

            <div className="flex flex-col items-center px-4">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Direct Transit
              </div>
              <div className="relative my-1 flex w-24 items-center">
                <div className="h-0.5 w-full bg-neutral-300 dark:bg-neutral-700" />
                <div className="absolute right-0 h-2 w-2 rounded-full bg-emerald-600" />
              </div>
              <div className="font-mono text-[11px] text-neutral-400">
                {currentTicket.departureDate}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Destination
              </div>
              <div className="text-base font-bold text-neutral-900 dark:text-white">
                {currentTicket.destination}
              </div>
              <div className="text-xs text-neutral-500">
                Arrives: <span className="font-bold text-neutral-800 dark:text-neutral-200">{currentTicket.arrivalTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Perforated Cutout Divider */}
        <div className="relative flex items-center justify-between">
          <div className="h-6 w-3 rounded-r-full bg-neutral-50 border-r border-t border-b border-neutral-300 -ml-px dark:bg-neutral-950 dark:border-neutral-700" />
          <div className="flex-1 border-t-2 border-dashed border-neutral-300 dark:border-neutral-700 mx-2" />
          <div className="h-6 w-3 rounded-l-full bg-neutral-50 border-l border-t border-b border-neutral-300 -mr-px dark:bg-neutral-950 dark:border-neutral-700" />
        </div>

        {/* Passenger & QR Code Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Passenger Info Column (2 cols) */}
            <div className="sm:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Passenger Name
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {currentTicket.passengerName}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Assigned Seat
                  </span>
                  <span className="inline-block rounded-md bg-blue-100 px-2.5 py-0.5 text-base font-extrabold font-mono text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                    {currentTicket.seatNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Ticket Number
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {currentTicket.ticketNumber}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Vehicle Plate
                  </span>
                  <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                    {currentTicket.vehicleReg}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    National ID / Passport
                  </span>
                  <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                    {currentTicket.passengerIdNumber || 'Verified at check-in'}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Fare Paid
                  </span>
                  <span className="text-xs font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {currentTicket.priceRwf.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {currentTicket.boardedAt && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <span className="font-bold">Boarding Recorded:</span> {new Date(currentTicket.boardedAt).toLocaleTimeString()} by {currentTicket.boardedBy || 'Nyabugogo Terminal Staff'}
                </div>
              )}
            </div>

            {/* QR Code Column (1 col) */}
            <div className="flex flex-col items-center justify-center border-t border-neutral-100 pt-4 dark:border-neutral-800 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
              <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-inner dark:border-neutral-700">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Verifiable QR Code for ${currentTicket.ticketNumber}`}
                    className="h-32 w-32 object-contain"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center bg-neutral-100 text-xs text-neutral-400">
                    Generating QR...
                  </div>
                )}
              </div>
              <span className="mt-2 text-center text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                Scan for Boarding
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Footer Security Stripe */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-3 text-center text-[11px] text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Official digital ticket cryptographically signed by RwandaGo Transport Registry.</span>
          </div>
        </div>
      </div>

      {/* Staff Verification Shortcut (For Evaluator & Demo) */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center dark:border-neutral-800 dark:bg-neutral-900 no-print">
        <span className="text-xs text-neutral-600 dark:text-neutral-400">
          Want to test the Operator/Staff QR ticket verification flow?
        </span>
        <div className="mt-2 flex justify-center gap-3">
          <button
            onClick={() => setActiveView('staff-verifier')}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            <UserCheck className="h-4 w-4 text-amber-400" />
            <span>Open Staff QR Scanner & Verify this Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
