import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { ASSET_IMAGES } from '../data/mockData';
import { Search, MapPin, Calendar, Users, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (from: string, to: string, date: string, passengers: number) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch }) => {
  const { language, routes } = useApp();
  const t = getTranslation(language);

  const [fromLocation, setFromLocation] = useState('Kigali');
  const [toLocation, setToLocation] = useState('Karongi');
  const [travelDate, setTravelDate] = useState('2026-09-30');
  const [passengerCount, setPassengerCount] = useState(1);

  const locations = ['Kigali', 'Karongi', 'Huye', 'Musanze', 'Rubavu', 'Rusizi', 'Nyagatare'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(fromLocation, toLocation, travelDate, passengerCount);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setFromLocation(from);
    setToLocation(to);
    onSearch(from, to, travelDate, passengerCount);
  };

  return (
    <div className="relative">
      {/* Hero Banner Background with Authentic Rwandan Transport Imagery */}
      <div className="relative h-[480px] w-full overflow-hidden bg-neutral-900">
        <img
          src={ASSET_IMAGES.hero}
          alt="Modern passenger express bus traversing Rwanda's scenic rolling green hills"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center brightness-[0.72] filter"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/30" />

        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ textWrap: 'balance' }}>
              {language === 'rw'
                ? 'Gufata Itike y’Urugendo mu Rwanda Hose mu Buryo Bworoshye'
                : language === 'fr'
                ? 'Réservez vos voyages en toute sérénité à travers le Rwanda'
                : 'Book Your Journey Across Rwanda Easily'}
            </h1>
            <p className="mt-3 text-base text-neutral-200 sm:text-lg">
              {language === 'rw'
                ? 'Shakisha ingendo z’imodoka, hitamo umwanya wishimiye, wishyure ukoresheje Mobile Money uhite ubona itike yawe ya QR Code ako kanya.'
                : language === 'fr'
                ? 'Consultez les horaires, réservez vos sièges en temps réel, payez par Mobile Money et obtenez votre billet digital avec QR code instantanément.'
                : 'Real-time seat selection, instant Mobile Money payments, and verifiable digital QR tickets for premier intercity coach services.'}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Floating Search Bar Container */}
      <div className="relative mx-auto -mt-20 max-w-6xl px-4 sm:px-6 lg:px-8 z-20">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 sm:p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-9">
            {/* Origin */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.from}
              </label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <select
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} disabled={loc === toLocation}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.to}
              </label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                <select
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc} disabled={loc === fromLocation}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travel Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.date}
              </label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  value={travelDate}
                  min="2026-09-30"
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {t.passengers}
              </label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <select
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-2 text-sm font-medium text-neutral-900 focus:border-emerald-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="flex items-end lg:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 text-sm font-semibold text-white shadow transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <Search className="h-4 w-4" />
                <span>{t.searchTrips}</span>
              </button>
            </div>
          </form>

          {/* Quick Route Shortcuts */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Quick Search:</span>
            <button
              onClick={() => handleQuickRoute('Kigali', 'Karongi')}
              className="rounded bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Kigali → Karongi (5,000 RWF)
            </button>
            <button
              onClick={() => handleQuickRoute('Kigali', 'Huye')}
              className="rounded bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Kigali → Huye (4,500 RWF)
            </button>
            <button
              onClick={() => handleQuickRoute('Kigali', 'Musanze')}
              className="rounded bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Kigali → Musanze (4,000 RWF)
            </button>
            <button
              onClick={() => handleQuickRoute('Kigali', 'Rubavu')}
              className="rounded bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              Kigali → Rubavu (7,000 RWF)
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Quantitative Proof Adjacency */}
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">Anti-Double Booking Guarantee</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">10-minute temporary seat lock preventing race conditions</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">Instant MoMo & QR Boarding</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Verified Mobile Money gateway with terminal scanner ready</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 dark:text-white">Licensed Operators Only</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Volcano, Horizon, Ritco, Stella, Capital VIP fleets</div>
            </div>
          </div>
        </div>

        {/* Featured Popular Destinations Grid with High-Fidelity Assets */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {t.popularDestinations}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Explore major transport hubs and scenic destinations across Rwanda
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(routes || []).slice(0, 4).map((route) => (
              <div
                key={route.id}
                onClick={() => handleQuickRoute(route.origin, route.destination)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="h-44 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img
                    src={route.imageUrl || ASSET_IMAGES.kigali}
                    alt={`${route.origin} to ${route.destination}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-neutral-900 dark:text-white">
                      {route.origin} → {route.destination}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {route.distanceKm} km
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {route.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                    <span className="text-neutral-500">{route.estimatedDuration}</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400">
                      <span>Book Trip</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
