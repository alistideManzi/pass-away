import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Booking, Ticket } from '../types';
import { getTranslation } from '../utils/translations';
import {
  Ticket as TicketIcon,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  AlertCircle,
} from 'lucide-react';

interface CustomerBookingsProps {
  onViewTicket: (tickets: Ticket[]) => void;
  onBookNew: () => void;
}

export const CustomerBookings: React.FC<CustomerBookingsProps> = ({ onViewTicket, onBookNew }) => {
  const { bookings, trips, tickets, cancelBooking, currentUser, language } = useApp();
  const t = getTranslation(language);

  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter bookings for current user
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    const res = await cancelBooking(cancelModalBooking.id);
    setCancelModalBooking(null);
    setFeedback(res.message);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.myBookings}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            View booking confirmations, download digital QR tickets, or request cancellations.
          </p>
        </div>

        <button
          onClick={onBookNew}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
        >
          + {t.bookNow}
        </button>
      </div>

      {feedback && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Bookings List */}
      <div className="mt-6 space-y-4">
        {userBookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
            <TicketIcon className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
              No Bookings Yet
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              You have not booked any trips. Search schedules across Rwanda to get started!
            </p>
            <button
              onClick={onBookNew}
              className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-emerald-600"
            >
              Search Available Trips
            </button>
          </div>
        ) : (
          userBookings.map((booking) => {
            const trip = trips.find((t) => t.id === booking.tripId);
            const bookingTickets = tickets.filter((tkt) => tkt.bookingId === booking.id);
            const isConfirmed = booking.bookingStatus === 'CONFIRMED';
            const isCancelled = booking.bookingStatus === 'CANCELLED';

            return (
              <div
                key={booking.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isConfirmed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isCancelled
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
                      {trip ? `${trip.origin} → ${trip.destination}` : 'Intercity Journey'}
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span>{trip?.departureDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>Departs: {trip?.departureTime}</span>
                      <span aria-hidden="true">·</span>
                      <span>Seats: <strong className="font-mono text-neutral-800 dark:text-neutral-200">{booking.selectedSeats.join(', ')}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{trip?.operatorName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <div className="text-sm font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {booking.totalAmount.toLocaleString()} RWF
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Method: {booking.paymentMethod === 'card' ? 'Bank Card' : 'Mobile Money'}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      {isConfirmed && bookingTickets.length > 0 && (
                        <button
                          onClick={() => onViewTicket(bookingTickets)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>View / Print Ticket</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => setCancelModalBooking(booking)}
                          className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                          {t.cancelBooking}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Cancel Booking {cancelModalBooking.bookingReference}?
              </h3>
            </div>

            <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-300">
              <p>
                Are you sure you want to cancel your reservation for seat(s){' '}
                <strong>{cancelModalBooking.selectedSeats.join(', ')}</strong>?
              </p>
              <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
                <div className="flex items-center justify-between">
                  <span>Original Paid Amount:</span>
                  <span className="font-mono tabular-nums font-bold">
                    {cancelModalBooking.totalAmount.toLocaleString()} RWF
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Refund (90% Policy):</span>
                  <span className="font-mono tabular-nums font-bold">
                    {Math.round(cancelModalBooking.totalAmount * 0.9).toLocaleString()} RWF
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-neutral-500">
                The released seats will immediately become available to other travelers.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Yes, Cancel & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
