import React from 'react';
import { Bus, MapPin, Phone, ShieldCheck, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <footer className="mt-20 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 no-print">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Bus className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                RwandaGo Express
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Rwanda's verified national intercity transport booking network. Real-time seat reservations, Mobile Money settlement, and digital boarding tickets.
            </p>
          </div>

          {/* Major Terminals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Primary Terminals
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-neutral-500">
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Kigali: Nyabugogo Main Bus Terminal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Karongi: Lake Kivu Terminal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Huye: Gare Routière Centrale</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Musanze: Volcanoes Station</span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Platform Navigation
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-neutral-500">
              <li>
                <button onClick={() => setActiveView('search')} className="hover:text-emerald-600">
                  Search Bus Schedules
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('my-bookings')} className="hover:text-emerald-600">
                  My Tickets & Reservations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('staff-verifier')} className="hover:text-emerald-600">
                  Staff QR Ticket Verifier
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('admin-dashboard')} className="hover:text-emerald-600">
                  Administrator Console
                </button>
              </li>
            </ul>
          </div>

          {/* Helpline & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Customer Support
            </h4>
            <div className="mt-3 space-y-2 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono tabular-nums">+250 788 123 456 / 2525</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                <span>support@rwandago.rw</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-neutral-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Licensed by RURA Transport Authority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t border-neutral-100 pt-6 text-xs text-neutral-400 dark:border-neutral-800 sm:flex-row">
          <div>
            © 2026 RwandaGo Express. All rights reserved.
          </div>
          <div className="mt-2 sm:mt-0 flex gap-4 text-xs text-neutral-500">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Refund & Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
