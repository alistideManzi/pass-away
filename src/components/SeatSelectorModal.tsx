import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface SeatSelectorModalProps {
  onBack: () => void;
  onProceed: () => void;
}

export const SeatSelectorModal: React.FC<SeatSelectorModalProps> = ({ onBack, onProceed }) => {
  const { bookingDraft, toggleSeatSelection, trips, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes reservation timer

  const trip = (trips || []).find((t) => t.id === bookingDraft.trip?.id) || bookingDraft.trip;

  // Reservation countdown timer
  useEffect(() => {
    if (!bookingDraft.selectedSeats || bookingDraft.selectedSeats.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingDraft.selectedSeats?.length]);

  if (!trip) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm text-neutral-500">No trip selected.</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
        >
          Return to Trips
        </button>
      </div>
    );
  }

  const handleSeatClick = (seatNumber: string) => {
    setErrorMessage(null);
    const result = toggleSeatSelection(seatNumber);
    if (!result.success && result.message) {
      setErrorMessage(result.message);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const now = Date.now();
  const totalCapacity = trip.totalSeats || 30;

  // Generate seat array
  const seats = Array.from({ length: totalCapacity }, (_, i) => {
    const seatNum = (i + 1).toString().padStart(2, '0');
    const isBooked = (trip.bookedSeats || []).includes(seatNum);
    const isSelected = (bookingDraft.selectedSeats || []).includes(seatNum);
    const otherReservedHold = (trip.reservedSeats || []).find(
      (h) => h && h.seatNumber === seatNum && h.userId !== currentUser.id && h.expiresAt > now
    );
    const isReserved = Boolean(otherReservedHold);

    let state: 'available' | 'selected' | 'booked' | 'reserved' = 'available';
    if (isBooked) state = 'booked';
    else if (isSelected) state = 'selected';
    else if (isReserved) state = 'reserved';

    return { seatNum, state };
  });

  const selectedCount = bookingDraft.selectedSeats?.length || 0;
  const basePrice = trip.priceRwf;
  const totalAmount = selectedCount * basePrice;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Return Action */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trips</span>
        </button>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Seats held for:</span>
            <span className="font-mono font-bold tabular-nums text-amber-700 dark:text-amber-300">
              {formattedTime}
            </span>
          </div>
        )}
      </div>

      {/* Trip Information Summary Bar */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-500">Selected Journey</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white">
              {trip.origin} → {trip.destination}
            </div>
            <div className="mt-0.5 text-xs text-neutral-500">
              <span>{trip.operatorName}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>{trip.departureDate} at {trip.departureTime}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span className="font-mono">{trip.vehicleReg}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-neutral-500">Rate per Seat</div>
            <div className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
              {trip.priceRwf.toLocaleString()} RWF
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Seat Layout Grid */}
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left 2 Cols: Interactive Bus Layout */}
        <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-neutral-100 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto max-w-sm rounded-3xl border-2 border-neutral-300 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
            {/* Front of Bus & Driver Area */}
            <div className="mb-6 flex items-center justify-between border-b-2 border-dashed border-neutral-200 pb-4 dark:border-neutral-800">
              {/* Front Door */}
              <div className="flex flex-col items-center">
                <div className="rounded-md border border-neutral-300 px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase dark:border-neutral-700">
                  {t.frontDoor}
                </div>
              </div>

              {/* Driver Steering Area */}
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-400 bg-neutral-100 text-neutral-600 shadow-inner dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="3" x2="12" y2="12" />
                    <line x1="3" y1="12" x2="12" y2="12" />
                    <line x1="21" y1="12" x2="12" y2="12" />
                  </svg>
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  {t.driver}
                </span>
              </div>
            </div>

            {/* Coach Seating Grid (2 seats - Aisle - 2 seats) */}
            <div className="space-y-3">
              {Array.from({ length: Math.ceil(seats.length / 4) }).map((_, rowIndex) => {
                const s1 = seats[rowIndex * 4];
                const s2 = seats[rowIndex * 4 + 1];
                const s3 = seats[rowIndex * 4 + 2];
                const s4 = seats[rowIndex * 4 + 3];

                const renderSeatBtn = (seatItem?: typeof seats[0]) => {
                  if (!seatItem) return <div className="h-10 w-10" />;

                  let btnClasses = '';
                  let tooltip = `Seat ${seatItem.seatNum}`;

                  if (seatItem.state === 'available') {
                    btnClasses =
                      'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200';
                    tooltip += ' (Available)';
                  } else if (seatItem.state === 'selected') {
                    btnClasses =
                      'bg-blue-600 border-blue-700 text-white shadow-sm ring-2 ring-blue-400 dark:bg-blue-600 dark:border-blue-500';
                    tooltip += ' (Selected by you)';
                  } else if (seatItem.state === 'booked') {
                    btnClasses =
                      'bg-neutral-200 border-neutral-300 text-neutral-400 cursor-not-allowed dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-600';
                    tooltip += ' (Already Booked)';
                  } else if (seatItem.state === 'reserved') {
                    btnClasses =
                      'bg-amber-100 border-amber-300 text-amber-600 cursor-not-allowed dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400';
                    tooltip += ' (Locked in checkout)';
                  }

                  return (
                    <button
                      key={seatItem.seatNum}
                      type="button"
                      disabled={seatItem.state === 'booked' || seatItem.state === 'reserved'}
                      onClick={() => handleSeatClick(seatItem.seatNum)}
                      title={tooltip}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold font-mono tabular-nums transition-all active:scale-95 ${btnClasses}`}
                    >
                      {seatItem.seatNum}
                    </button>
                  );
                };

                return (
                  <div key={rowIndex} className="flex items-center justify-between">
                    {/* Left pair */}
                    <div className="flex gap-2">
                      {renderSeatBtn(s1)}
                      {renderSeatBtn(s2)}
                    </div>

                    {/* Central Aisle */}
                    <div className="h-8 w-6 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-neutral-300 dark:text-neutral-700">|</span>
                    </div>

                    {/* Right pair */}
                    <div className="flex gap-2">
                      {renderSeatBtn(s3)}
                      {renderSeatBtn(s4)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Back Row Notice */}
            <div className="mt-6 border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-400 dark:border-neutral-800">
              REAR OF COACH
            </div>
          </div>
        </div>

        {/* Right 1 Col: Legend, Summary & Proceed CTA */}
        <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Seat Status Legend
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40" />
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {t.seatAvailable} (Click to select)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border border-blue-700 bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {t.seatSelected} (Your choice)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border border-neutral-300 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800" />
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {t.seatBooked} (Sold out)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40" />
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  {t.seatReserved} (Temporary hold)
                </span>
              </div>
            </div>

            {/* Anti Double-booking security badge */}
            <div className="mt-6 rounded-lg border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                  When you select a seat, our database temporarily locks it to your session so other passengers cannot purchase it while you checkout.
                </p>
              </div>
            </div>

            {/* Real-time Reservation Calculation */}
            <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Selected Seats:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {selectedCount > 0 ? bookingDraft.selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span>Seats Count:</span>
                <span className="font-mono tabular-nums text-neutral-900 dark:text-white">
                  {selectedCount}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  Total Fare:
                </span>
                <span className="text-lg font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {totalAmount.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-8">
            <button
              disabled={selectedCount === 0}
              onClick={onProceed}
              className={`w-full rounded-xl py-3 px-4 text-xs font-bold shadow-md transition-all focus:outline-none ${
                selectedCount > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]'
                  : 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
              }`}
            >
              {selectedCount > 0
                ? `Continue with ${selectedCount} Seat${selectedCount > 1 ? 's' : ''}`
                : 'Select at least 1 seat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
