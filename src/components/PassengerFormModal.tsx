import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Passenger } from '../types';
import { getTranslation } from '../utils/translations';
import { ArrowLeft, User, Phone, Mail, CreditCard, Shield, AlertCircle } from 'lucide-react';

interface PassengerFormModalProps {
  onBack: () => void;
  onProceed: () => void;
}

export const PassengerFormModal: React.FC<PassengerFormModalProps> = ({ onBack, onProceed }) => {
  const { bookingDraft, setPassengerDetails, language } = useApp();
  const t = getTranslation(language);

  const [passengers, setPassengers] = useState<Passenger[]>(() => {
    return (bookingDraft.passengers && bookingDraft.passengers.length > 0)
      ? bookingDraft.passengers
      : (bookingDraft.selectedSeats || []).map((seat, index) => ({
          seatNumber: seat,
          fullName: index === 0 ? 'Alistide Manzi' : '',
          phone: index === 0 ? '+250 788 123 456' : '+250 78',
          email: index === 0 ? 'alistidemanzi@gmail.com' : '',
          idNumber: index === 0 ? '1199880012345678' : '',
        }));
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate fields
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName.trim()) {
        setValidationError(`Please enter Full Name for Passenger ${i + 1} (Seat ${p.seatNumber}).`);
        return;
      }
      if (!p.phone.trim() || p.phone.trim().length < 9) {
        setValidationError(`Please enter a valid phone number for Passenger ${i + 1} (Seat ${p.seatNumber}).`);
        return;
      }
      if (!p.idNumber.trim()) {
        setValidationError(`Please enter National ID or Passport for Passenger ${i + 1} (Seat ${p.seatNumber}).`);
        return;
      }
    }

    setPassengerDetails(passengers);
    onProceed();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Seat Selection</span>
      </button>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.passengerDetails}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Official travel regulations in Rwanda require passenger manifest identification prior to boarding.
          </p>
        </div>

        {validationError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleContinue} className="mt-6 space-y-6">
          {passengers.map((passenger, index) => (
            <div
              key={passenger.seatNumber}
              className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/30"
            >
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    Passenger {index + 1}
                  </span>
                </div>
                <div className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold font-mono text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Seat: {passenger.seatNumber}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {t.fullName} *
                  </label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alistide Manzi"
                      value={passenger.fullName}
                      onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {t.phoneNumber} *
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+250 788 123 456"
                      value={passenger.phone}
                      onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono tabular-nums"
                    />
                  </div>
                </div>

                {/* ID / Passport */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {t.nationalId} *
                  </label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="16 digits ID or Passport Number"
                      value={passenger.idNumber}
                      onChange={(e) => updatePassenger(index, 'idNumber', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {t.emailAddress}
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="name@example.com (for ticket copy)"
                      value={passenger.email}
                      onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
            >
              Back
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {t.continueToPayment}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
