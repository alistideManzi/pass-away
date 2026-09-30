import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Tag,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface PaymentModalProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onBack, onSuccess }) => {
  const {
    bookingDraft,
    applyPromoCode,
    processCheckoutPayment,
    currentUser,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [paymentMethod, setPaymentMethod] = useState<'momo_mtn' | 'airtel_money' | 'card'>('momo_mtn');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+250 788 123 456');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Payment gateway simulation states: 'idle' | 'initiating' | 'awaiting_approval' | 'confirmed'
  const [paymentState, setPaymentState] = useState<'idle' | 'initiating' | 'awaiting_approval' | 'confirmed'>('idle');
  const [countdown, setCountdown] = useState(15);
  const [errorText, setErrorText] = useState<string | null>(null);

  const trip = bookingDraft.trip;
  const seatCount = bookingDraft.selectedSeats?.length || 0;
  const basePrice = trip ? trip.priceRwf * seatCount : 0;
  const discount = bookingDraft.discountAmount || 0;
  const totalPayable = Math.max(0, basePrice - discount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput.trim());
    setPromoMessage({ success: res.success, text: res.message });
  };

  const handleStartPayment = async () => {
    setErrorText(null);
    setPaymentState('initiating');

    // Simulate gateway handoff
    setTimeout(() => {
      setPaymentState('awaiting_approval');
    }, 1200);
  };

  const handleApproveUSSD = async () => {
    setPaymentState('initiating');

    const account = paymentMethod === 'card' ? cardNumber : phoneNumber;
    const res = await processCheckoutPayment(paymentMethod, account);

    if (res.success) {
      setPaymentState('confirmed');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Confetti fallback
      }
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } else {
      setPaymentState('idle');
      setErrorText(res.error || 'Payment failed. Please verify your funds and retry.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={onBack}
        disabled={paymentState !== 'idle'}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition-colors hover:text-neutral-900 disabled:opacity-50 dark:text-neutral-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Passenger Details</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Payment Provider Selection & Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Select Payment Method
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Transactions are encrypted and verified directly via telecom and banking switches.
            </p>

            {errorText && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorText}</span>
              </div>
            )}

            {/* Provider Options */}
            <div className="mt-6 space-y-3">
              {/* MTN MoMo */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  paymentMethod === 'momo_mtn'
                    ? 'border-yellow-500 bg-yellow-50/40 ring-1 ring-yellow-500 dark:bg-yellow-950/20'
                    : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'momo_mtn'}
                    onChange={() => setPaymentMethod('momo_mtn')}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 font-bold text-neutral-900 shadow-sm text-xs">
                    MTN
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      MTN Mobile Money
                    </div>
                    <div className="text-xs text-neutral-500">
                      Instant *182# prompt to your MTN line
                    </div>
                  </div>
                </div>
                <Smartphone className="h-5 w-5 text-neutral-400" />
              </label>

              {/* Airtel Money */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  paymentMethod === 'airtel_money'
                    ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500 dark:bg-red-950/20'
                    : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'airtel_money'}
                    onChange={() => setPaymentMethod('airtel_money')}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 font-bold text-white shadow-sm text-xs">
                    Airtel
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      Airtel Money
                    </div>
                    <div className="text-xs text-neutral-500">
                      Direct push to your Airtel Money wallet
                    </div>
                  </div>
                </div>
                <Smartphone className="h-5 w-5 text-neutral-400" />
              </label>

              {/* Card */}
              <label
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500 dark:bg-blue-950/20'
                    : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentProvider"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm text-xs">
                    Card
                  </div>
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white">
                      Credit / Debit Card
                    </div>
                    <div className="text-xs text-neutral-500">
                      Visa, Mastercard & Rwanda National Switch
                    </div>
                  </div>
                </div>
                <CreditCard className="h-5 w-5 text-neutral-400" />
              </label>
            </div>

            {/* Input Details */}
            <div className="mt-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
              {paymentMethod === 'card' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-xs font-mono text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        defaultValue="12/28"
                        className="mt-1 w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-xs font-mono text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        defaultValue="382"
                        maxLength={4}
                        className="mt-1 w-full rounded-lg border border-neutral-300 bg-white py-2 px-3 text-xs font-mono text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {paymentMethod === 'momo_mtn' ? 'MTN MoMo Number' : 'Airtel Money Number'}
                  </label>
                  <div className="relative mt-1">
                    <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs font-mono tabular-nums text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    A USSD authorization push prompt will be dispatched to this handset.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive USSD Simulator Modal Frame when initiating payment */}
          {paymentState === 'awaiting_approval' && (
            <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-6 shadow-lg dark:bg-emerald-950/20">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Smartphone className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      USSD Prompt Dispatched
                    </h3>
                    <span className="flex items-center gap-1 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <Clock className="h-3.5 w-3.5" />
                      Waiting for PIN...
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                    Payment request of <span className="font-bold tabular-nums">{totalPayable.toLocaleString()} RWF</span> for RwandaGo Express sent to <span className="font-mono font-semibold">{phoneNumber}</span>.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleApproveUSSD}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 focus:outline-none"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t.simulateApproval} (*182#)</span>
                    </button>
                    <button
                      onClick={() => setPaymentState('idle')}
                      className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Price Breakdown & Promo Codes */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              {t.paymentSummary}
            </h3>

            {trip && (
              <div className="mt-4 border-b border-neutral-100 pb-4 text-xs dark:border-neutral-800">
                <div className="font-semibold text-neutral-900 dark:text-white">
                  {trip.origin} → {trip.destination}
                </div>
                <div className="mt-0.5 text-neutral-500">
                  {trip.departureDate} · {trip.departureTime}
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-neutral-700 dark:text-neutral-300">
                  <span>Seats: {bookingDraft.selectedSeats.join(', ')}</span>
                  <span>({seatCount} passenger{seatCount > 1 ? 's' : ''})</span>
                </div>
              </div>
            )}

            {/* Calculations */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>{t.baseFare}</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                  {basePrice.toLocaleString()} RWF
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    <span>{t.discount} ({bookingDraft.promoCode?.code})</span>
                  </span>
                  <span className="font-mono tabular-nums font-semibold">
                    - {discount.toLocaleString()} RWF
                  </span>
                </div>
              )}

              <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {t.totalToPay}
                  </span>
                  <span className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {totalPayable.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. RWANDA2026)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 px-3 text-xs uppercase font-mono text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-700"
                >
                  {t.apply}
                </button>
              </form>

              {promoMessage && (
                <div
                  className={`mt-2 text-[11px] ${
                    promoMessage.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'
                  }`}
                >
                  {promoMessage.text}
                </div>
              )}
            </div>

            {/* Pay Button */}
            {paymentState === 'idle' && (
              <div className="mt-6">
                <button
                  onClick={handleStartPayment}
                  className="w-full rounded-xl bg-emerald-600 py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] focus:outline-none"
                >
                  Pay {totalPayable.toLocaleString()} RWF & Generate Ticket
                </button>
              </div>
            )}

            {paymentState === 'initiating' && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span>Contacting {paymentMethod === 'card' ? 'Bank Gateway' : 'MoMo Switch'}...</span>
              </div>
            )}
          </div>

          {/* Guarantee Info */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2 font-semibold text-neutral-800 dark:text-neutral-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Refund Guarantee</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              {t.refundPolicy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
