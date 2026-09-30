import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trip } from '../types';
import { getTranslation } from '../utils/translations';
import {
  Clock,
  MapPin,
  Wifi,
  Wind,
  Zap,
  Coffee,
  CheckCircle,
  Filter,
  ArrowUpDown,
  Bus,
} from 'lucide-react';

interface TripResultsProps {
  searchFilter?: {
    from: string;
    to: string;
    date: string;
    passengers: number;
  };
}

export const TripResults: React.FC<TripResultsProps> = ({ searchFilter }) => {
  const { trips, language, selectTripForBooking } = useApp();
  const t = getTranslation(language);

  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'departure' | 'price' | 'seats'>('departure');

  // Filter trips
  const filteredTrips = (trips || []).filter((trip) => {
    // If searchFilter provided
    if (searchFilter?.from && !trip.origin.toLowerCase().includes(searchFilter.from.toLowerCase())) {
      return false;
    }
    if (searchFilter?.to && !trip.destination.toLowerCase().includes(searchFilter.to.toLowerCase())) {
      return false;
    }

    // Operator filter
    if (selectedOperator !== 'all' && trip.operatorName !== selectedOperator) {
      return false;
    }

    // Time filter
    if (selectedTimeOfDay !== 'all') {
      const hour = parseInt(trip.departureTime.split(':')[0], 10);
      const isPM = trip.departureTime.includes('PM') && hour !== 12;
      const hour24 = isPM ? hour + 12 : hour;

      if (selectedTimeOfDay === 'morning' && (hour24 < 6 || hour24 >= 12)) return false;
      if (selectedTimeOfDay === 'afternoon' && (hour24 < 12 || hour24 >= 18)) return false;
      if (selectedTimeOfDay === 'evening' && hour24 < 18) return false;
    }

    return true;
  });

  // Sort trips
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'price') {
      return a.priceRwf - b.priceRwf;
    }
    if (sortBy === 'seats') {
      const aAvailable = (a.totalSeats || 30) - (a.bookedSeats?.length || 0);
      const bAvailable = (b.totalSeats || 30) - (b.bookedSeats?.length || 0);
      return bAvailable - aAvailable;
    }
    // Default departure time
    return (a.departureTime || '').localeCompare(b.departureTime || '');
  });

  const operators = Array.from(new Set((trips || []).map((t) => t.operatorName).filter(Boolean)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header Banner */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {searchFilter?.from && searchFilter?.to ? (
              <span>
                {searchFilter.from} → {searchFilter.to}
              </span>
            ) : (
              <span>All Available Intercity Trips</span>
            )}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Date: {searchFilter?.date || '30 Sep 2026'}</span>
            <span aria-hidden="true">·</span>
            <span>{(sortedTrips || []).length} scheduled coaches found</span>
          </div>
        </div>

        {/* Filter Controls (Segmented Bar) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Operator Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="all">{t.allOperators}</option>
              {operators.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            <select
              value={selectedTimeOfDay}
              onChange={(e) => setSelectedTimeOfDay(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="all">Any Departure Time</option>
              <option value="morning">{t.morning}</option>
              <option value="afternoon">{t.afternoon}</option>
              <option value="evening">{t.evening}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              <option value="departure">Sort: Departure Time</option>
              <option value="price">Sort: Price (Lowest)</option>
              <option value="seats">Sort: Seats Available</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trips Listing */}
      <div className="mt-6 space-y-4">
        {(sortedTrips || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
            <Bus className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
              {t.emptyTrips}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Try adjusting your route filters or clearing the operator selection.
            </p>
          </div>
        ) : (
          sortedTrips.map((trip) => {
            const bookedCount = trip.bookedSeats?.length || 0;
            const reservedCount = trip.reservedSeats?.length || 0;
            const availableSeats = Math.max(0, (trip.totalSeats || 30) - bookedCount - reservedCount);
            const isFull = availableSeats === 0;

            return (
              <div
                key={trip.id}
                className="group relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  {/* Left Column: Operator & Vehicle */}
                  <div className="lg:w-1/4">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-neutral-900 dark:text-white">
                        {trip.operatorName}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{trip.vehicleType}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
                        {trip.vehicleReg}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div className="mt-3 flex items-center gap-3 text-neutral-400">
                      <span title="Free Onboard WiFi">
                        <Wifi className="h-4 w-4 text-emerald-600" />
                      </span>
                      <span title="Air Conditioning">
                        <Wind className="h-4 w-4 text-sky-600" />
                      </span>
                      <span title="USB Charging Ports">
                        <Zap className="h-4 w-4 text-amber-500" />
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Departure, Duration, Arrival */}
                  <div className="flex flex-1 items-center justify-between gap-4 border-y border-neutral-100 py-3 dark:border-neutral-800 sm:px-6 lg:border-y-0 lg:py-0">
                    {/* Departure */}
                    <div className="text-left">
                      <div className="text-lg font-extrabold tabular-nums text-neutral-900 dark:text-white">
                        {trip.departureTime}
                      </div>
                      <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {trip.origin}
                      </div>
                    </div>

                    {/* Duration Graphic */}
                    <div className="flex flex-1 flex-col items-center px-4">
                      <div className="text-[11px] font-medium text-neutral-400 tabular-nums">
                        Direct Express
                      </div>
                      <div className="relative my-1 flex w-full max-w-[140px] items-center">
                        <div className="h-0.5 w-full bg-neutral-200 dark:bg-neutral-700" />
                        <div className="absolute right-0 h-2 w-2 rounded-full bg-emerald-600" />
                        <div className="absolute left-0 h-2 w-2 rounded-full bg-neutral-400" />
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {trip.status}
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-right">
                      <div className="text-lg font-extrabold tabular-nums text-neutral-900 dark:text-white">
                        {trip.arrivalTime}
                      </div>
                      <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {trip.destination}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Price & Seat Selection Action */}
                  <div className="flex items-center justify-between gap-6 border-t border-neutral-100 pt-3 dark:border-neutral-800 lg:w-1/4 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <div className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {trip.priceRwf.toLocaleString()} RWF
                      </div>
                      <div className="text-xs text-neutral-500">
                        <span className={`font-semibold tabular-nums ${availableSeats <= 5 ? 'text-amber-600' : 'text-neutral-700 dark:text-neutral-300'}`}>
                          {availableSeats}
                        </span>{' '}
                        {t.availableSeats}
                      </div>
                    </div>

                    <button
                      disabled={isFull}
                      onClick={() => selectTripForBooking(trip)}
                      className={`rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all focus:outline-none ${
                        isFull
                          ? 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
                          : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-700'
                      }`}
                    >
                      {isFull ? 'Sold Out' : t.selectSeats}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
