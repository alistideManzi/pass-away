import React, { useState } from 'react';
import { useApp, VerificationResult } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  UserCheck,
  Bus,
  Clock,
  ShieldCheck,
  Camera,
  RefreshCw,
  Database,
} from 'lucide-react';

export const StaffVerifier: React.FC = () => {
  const {
    trips,
    tickets,
    verifyTicket,
    boardTicket,
    currentUser,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [boardFeedback, setBoardFeedback] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [manifestSearch, setManifestSearch] = useState('');

  // Selected trip for manifest
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const tripTickets = tickets.filter((t) => t.tripId === selectedTrip?.id);

  const filteredManifest = tripTickets.filter(
    (tkt) =>
      tkt.passengerName.toLowerCase().includes(manifestSearch.toLowerCase()) ||
      tkt.seatNumber.includes(manifestSearch) ||
      tkt.ticketNumber.toLowerCase().includes(manifestSearch.toLowerCase())
  );

  const handleVerify = (codeToTest?: string) => {
    setBoardFeedback(null);
    const code = codeToTest || inputCode;
    if (!code.trim()) return;

    const res = verifyTicket(code);
    setVerificationResult(res);
  };

  const handleBoardCurrent = async () => {
    if (!verificationResult?.ticket) return;
    const res = await boardTicket(verificationResult.ticket.ticketNumber);
    if (res.success) {
      setBoardFeedback(res.message);
      // Refresh verification
      setVerificationResult((prev) =>
        prev
          ? {
              ...prev,
              status: 'ALREADY_BOARDED',
              message: res.message,
              ticket: prev.ticket ? { ...prev.ticket, ticketStatus: 'BOARDED' } : undefined,
            }
          : null
      );
    }
  };

  // Quick test helpers
  const validTicketSample = tickets.find((t) => t.ticketStatus === 'VALID')?.ticketNumber || 'TKT-20260930-00125';
  const boardedTicketSample = tickets.find((t) => t.ticketStatus === 'BOARDED')?.ticketNumber;
  const cancelledTicketSample = tickets.find((t) => t.ticketStatus === 'CANCELLED')?.ticketNumber;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Staff & Operator Console
              </span>
              <span className="text-xs text-neutral-500">Terminal: Nyabugogo Gate 4</span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Database className="h-3 w-3 text-emerald-600 animate-pulse" />
                Firestore DB Live Sync
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {t.verifyTicket} & Boarding Manifest
            </h1>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Inspector: <strong className="text-neutral-900 dark:text-white">{currentUser.fullName}</strong></span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Real Account: {currentUser.email}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (5 cols): QR Scanner & Verification Unit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-600" />
              <span>Digital QR Ticket Scanner</span>
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Scan passenger boarding pass via device optical sensor or verify ticket number directly.
            </p>

            {/* Simulated Camera Viewfinder */}
            <div className="mt-4 relative overflow-hidden rounded-xl border border-neutral-300 bg-neutral-950 p-6 text-center text-white dark:border-neutral-700">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-500/10 relative">
                <div className="absolute top-2 left-2 h-4 w-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-2 right-2 h-4 w-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-emerald-400" />
                <QrCode className="h-12 w-12 text-emerald-400 opacity-60 animate-pulse" />
              </div>
              <div className="mt-3 text-xs font-mono text-emerald-400">
                [ CAMERA OPTICAL SCANNER ACTIVE ]
              </div>
              <div className="text-[11px] text-neutral-400">
                Point camera at customer QR code
              </div>
            </div>

            {/* Input Ticket Form */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Enter or Paste Ticket Number / QR Payload
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TKT-20260930-00125"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white py-2 px-3 text-xs font-mono text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  onClick={() => handleVerify()}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Test Simulation Buttons */}
            <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Quick Test Samples:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => {
                    setInputCode(validTicketSample);
                    handleVerify(validTicketSample);
                  }}
                  className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  Test Valid Ticket
                </button>
                {boardedTicketSample && (
                  <button
                    onClick={() => {
                      setInputCode(boardedTicketSample);
                      handleVerify(boardedTicketSample);
                    }}
                    className="rounded bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    Test Already Used
                  </button>
                )}
                {cancelledTicketSample && (
                  <button
                    onClick={() => {
                      setInputCode(cancelledTicketSample);
                      handleVerify(cancelledTicketSample);
                    }}
                    className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                  >
                    Test Cancelled Ticket
                  </button>
                )}
                <button
                  onClick={() => {
                    const fake = 'TKT-FAKE-99999';
                    setInputCode(fake);
                    handleVerify(fake);
                  }}
                  className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  Test Fake / Unregistered
                </button>
              </div>
            </div>
          </div>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div
              className={`rounded-xl border p-5 shadow-sm transition-all ${
                verificationResult.status === 'VALID'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : verificationResult.status === 'ALREADY_BOARDED'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {verificationResult.status === 'VALID' && (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                )}
                {verificationResult.status === 'ALREADY_BOARDED' && (
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                {(verificationResult.status === 'CANCELLED' || verificationResult.status === 'NOT_FOUND') && (
                  <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold tracking-tight">
                      {verificationResult.status === 'VALID' && '✅ VALID TICKET - ALLOW BOARDING'}
                      {verificationResult.status === 'ALREADY_BOARDED' && '⚠️ TICKET ALREADY USED'}
                      {verificationResult.status === 'CANCELLED' && '❌ CANCELLED / REFUNDED TICKET'}
                      {verificationResult.status === 'NOT_FOUND' && '❌ UNRECOGNIZED / INVALID TICKET'}
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-neutral-700 dark:text-neutral-300">
                    {verificationResult.message}
                  </p>

                  {verificationResult.ticket && (
                    <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-neutral-400">Passenger:</span>{' '}
                          <strong className="text-neutral-900 dark:text-white">
                            {verificationResult.ticket.passengerName}
                          </strong>
                        </div>
                        <div>
                          <span className="text-neutral-400">Seat:</span>{' '}
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {verificationResult.ticket.seatNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Trip:</span>{' '}
                          <span>{verificationResult.ticket.origin} → {verificationResult.ticket.destination}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Vehicle:</span>{' '}
                          <span className="font-mono font-bold">{verificationResult.ticket.vehicleReg}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Boarding CTA */}
                  {verificationResult.status === 'VALID' && (
                    <div className="mt-4">
                      <button
                        onClick={handleBoardCurrent}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-emerald-700 focus:outline-none"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>{t.markBoarded}</span>
                      </button>
                    </div>
                  )}

                  {boardFeedback && (
                    <div className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      ✓ {boardFeedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Passenger Boarding Manifest for Assigned Trip */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Bus className="h-5 w-5 text-emerald-600" />
                  <span>Assigned Departure Manifest</span>
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Real-time boarding status for scheduled coach departure.
                </p>
              </div>

              {/* Trip Selector */}
              <div>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="rounded-lg border border-neutral-300 bg-white py-1.5 px-2.5 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {trips.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.departureTime} - {tr.origin} to {tr.destination} ({tr.vehicleReg})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trip Stats Bar */}
            {selectedTrip && (
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800/40">
                <div>
                  <div className="text-[10px] uppercase text-neutral-400">Total Capacity</div>
                  <div className="text-base font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                    {selectedTrip.totalSeats} Seats
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400">Booked Seats</div>
                  <div className="text-base font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                    {selectedTrip.bookedSeats.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400">Boarded Count</div>
                  <div className="text-base font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {tripTickets.filter((t) => t.ticketStatus === 'BOARDED').length} / {tripTickets.length}
                  </div>
                </div>
              </div>
            )}

            {/* Manifest Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search manifest by passenger name, seat number, or ticket..."
                value={manifestSearch}
                onChange={(e) => setManifestSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            {/* Passenger List Table */}
            <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                  <tr>
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Passenger</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Ticket No</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredManifest.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No issued tickets match this departure manifest.
                      </td>
                    </tr>
                  ) : (
                    filteredManifest.map((tkt) => {
                      const isBoarded = tkt.ticketStatus === 'BOARDED';
                      const isCancelled = tkt.ticketStatus === 'CANCELLED';

                      return (
                        <tr
                          key={tkt.id}
                          className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            {tkt.seatNumber}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">
                            {tkt.passengerName}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-neutral-500 tabular-nums">
                            {tkt.passengerPhone}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                            {tkt.ticketNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                isBoarded
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isCancelled
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                              }`}
                            >
                              {isBoarded ? 'BOARDED' : isCancelled ? 'CANCELLED' : 'CONFIRMED'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {!isBoarded && !isCancelled && (
                              <button
                                onClick={() => {
                                  boardTicket(tkt.ticketNumber);
                                }}
                                className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                              >
                                Board
                              </button>
                            )}
                            {isBoarded && (
                              <span className="text-[10px] text-emerald-600 font-medium">
                                Checked In
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
