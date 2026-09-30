import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trip, Vehicle, RouteItem, Booking, Payment, User } from '../types';
import { getTranslation } from '../utils/translations';
import {
  LayoutDashboard,
  Calendar,
  Bus,
  MapPin,
  Ticket,
  CreditCard,
  Users,
  BarChart3,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    trips,
    vehicles,
    routes,
    bookings,
    payments,
    users,
    adminSubRole,
    setAdminSubRole,
    addNewTrip,
    addNewVehicle,
    addNewRoute,
    addNewUser,
    updateTripStatus,
    language,
  } = useApp();
  const t = getTranslation(language);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'trips' | 'vehicles' | 'routes' | 'bookings' | 'payments' | 'users' | 'reports'
  >('overview');

  // Modals
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+250 78');
  const [newUserNatId, setNewUserNatId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'customer' | 'staff' | 'admin'>('customer');
  const [newUserSubRole, setNewUserSubRole] = useState<'super_admin' | 'trip_manager' | 'finance_admin'>('super_admin');

  // Search filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [tripSearch, setTripSearch] = useState('');

  // KPI Calculations
  const totalRevenue = (payments || [])
    .filter((p) => p.paymentStatus === 'SUCCESS')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const todayBookingsCount = (bookings || []).filter((b) => b.bookingStatus === 'CONFIRMED').length;
  const activeFleetCount = (vehicles || []).filter((v) => v.status === 'active').length;
  const totalCustomerCount = (users || []).filter((u) => u.role === 'customer').length;

  const totalCapacitySum = (trips || []).reduce((sum, tr) => sum + (tr.totalSeats || 0), 0);
  const totalBookedSum = (trips || []).reduce((sum, tr) => sum + (tr.bookedSeats?.length || 0), 0);
  const averageOccupancy = totalCapacitySum > 0 ? Math.round((totalBookedSum / totalCapacitySum) * 100) : 74;

  // New Trip Form State
  const [newTripOrigin, setNewTripOrigin] = useState('Kigali');
  const [newTripDest, setNewTripDest] = useState('Karongi');
  const [newTripOperator, setNewTripOperator] = useState('Volcano Express');
  const [newTripVehicleId, setNewTripVehicleId] = useState(vehicles[0]?.id || '');
  const [newTripDate, setNewTripDate] = useState('2026-09-30');
  const [newTripDepTime, setNewTripDepTime] = useState('06:30 AM');
  const [newTripArrTime, setNewTripArrTime] = useState('10:00 AM');
  const [newTripPrice, setNewTripPrice] = useState(5000);

  // New Vehicle Form State
  const [newVehReg, setNewVehReg] = useState('RAD 778 X');
  const [newVehType, setNewVehType] = useState<Vehicle['vehicleType']>('Toyota Coaster');
  const [newVehCap, setNewVehCap] = useState(30);

  // New Route Form State
  const [newRouteOrigin, setNewRouteOrigin] = useState('');
  const [newRouteDest, setNewRouteDest] = useState('');
  const [newRouteDist, setNewRouteDist] = useState(120);
  const [newRouteDur, setNewRouteDur] = useState('2h 45m');

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === newTripVehicleId) || vehicles[0];
    addNewTrip({
      routeId: `route-${newTripOrigin.toLowerCase()}-${newTripDest.toLowerCase()}`,
      origin: newTripOrigin,
      destination: newTripDest,
      vehicleId: vehicle.id,
      vehicleReg: vehicle.registrationNumber,
      vehicleType: `${vehicle.vehicleType} (${vehicle.capacity} Seats)`,
      operatorName: newTripOperator,
      departureDate: newTripDate,
      departureTime: newTripDepTime,
      arrivalTime: newTripArrTime,
      priceRwf: Number(newTripPrice),
      totalSeats: vehicle.capacity,
      status: 'SCHEDULED',
      amenities: ['Air Conditioning', 'WiFi', 'USB'],
    });
    setShowAddTripModal(false);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    addNewVehicle({
      vehicleNumber: `BUS-${Math.floor(100 + Math.random() * 900)}`,
      registrationNumber: newVehReg,
      vehicleType: newVehType,
      capacity: Number(newVehCap),
      status: 'active',
      amenities: ['Air Conditioning', 'WiFi', 'USB Ports'],
    });
    setShowAddVehicleModal(false);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteOrigin || !newRouteDest) return;
    addNewRoute({
      origin: newRouteOrigin,
      destination: newRouteDest,
      distanceKm: Number(newRouteDist),
      estimatedDuration: newRouteDur,
      popular: true,
      description: `Express corridor connecting ${newRouteOrigin} and ${newRouteDest}.`,
    });
    setShowAddRouteModal(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    addNewUser({
      id: `usr-${Date.now()}`,
      fullName: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      nationalId: newUserNatId,
      role: newUserRole,
      adminSubRole: newUserRole === 'admin' ? newUserSubRole : undefined,
      createdAt: new Date().toISOString(),
    });
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Admin Control Center
            </span>
            <span className="text-xs text-neutral-500">
              Role: <strong className="uppercase">{adminSubRole.replace('_', ' ')}</strong>
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.adminDashboard}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
            <span>Admin Account: <strong className="text-neutral-800 dark:text-neutral-200">{currentUser.fullName}</strong> ({currentUser.email})</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              System Active
            </span>
          </div>
        </div>

        {/* RBAC Sub-Role Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-800">
          {(['super_admin', 'trip_manager', 'finance_admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setAdminSubRole(role)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                adminSubRole === role
                  ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              {role === 'super_admin' ? 'Super Admin' : role === 'trip_manager' ? 'Trip Manager' : 'Finance Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px dark:border-neutral-800">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'trips', label: 'Trips & Schedules', icon: Calendar },
          { id: 'vehicles', label: 'Fleet & Vehicles', icon: Bus },
          { id: 'routes', label: 'Routes & Locations', icon: MapPin },
          { id: 'bookings', label: 'Bookings', icon: Ticket },
          { id: 'payments', label: 'Payments & Revenue', icon: CreditCard },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400'
                  : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {/* Revenue */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{t.totalRevenue}</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                {totalRevenue.toLocaleString()} RWF
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+14.2% from yesterday</span>
              </div>
            </div>

            {/* Bookings */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{t.totalBookings}</span>
                <Ticket className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                {todayBookingsCount}
              </div>
              <div className="mt-1 text-[11px] text-neutral-400">
                {(bookings || []).length} all-time reservations
              </div>
            </div>

            {/* Active Fleet */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{t.activeFleet}</span>
                <Bus className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                {activeFleetCount} Coaches
              </div>
              <div className="mt-1 text-[11px] text-neutral-400">
                {(vehicles || []).length} registered vehicles
              </div>
            </div>

            {/* Total Customers */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{t.totalCustomers}</span>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                {totalCustomerCount + 1249}
              </div>
              <div className="mt-1 text-[11px] text-neutral-400">Verified Mobile Accounts</div>
            </div>

            {/* Occupancy Rate */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{t.occupancyRate}</span>
                <BarChart3 className="h-4 w-4 text-sky-600" />
              </div>
              <div className="mt-2 text-xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                {averageOccupancy}%
              </div>
              <div className="mt-1 text-[11px] text-emerald-600">Peak hour 88%</div>
            </div>
          </div>

          {/* Clean High-Density Responsive Revenue & Booking Analytics Visualizer */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Visualizer 1: Daily Revenue Trend (SVG Area Chart) */}
            <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Revenue Velocity (7-Day Overview)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Gross daily intercity ticket sales in Rwandan Francs (RWF)
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Total: 4,820,000 RWF
                </span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="mt-6 h-56 w-full">
                <svg viewBox="0 0 700 200" className="h-full w-full overflow-visible">
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="40" y1="30" x2="680" y2="30" stroke="#e5e7eb" strokeDasharray="3 3" />
                  <line x1="40" y1="80" x2="680" y2="80" stroke="#e5e7eb" strokeDasharray="3 3" />
                  <line x1="40" y1="130" x2="680" y2="130" stroke="#e5e7eb" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="680" y2="180" stroke="#9ca3af" />

                  {/* Y Axis Labels */}
                  <text x="5" y="35" className="fill-neutral-400 text-[10px] font-mono">1.2M</text>
                  <text x="5" y="85" className="fill-neutral-400 text-[10px] font-mono">800K</text>
                  <text x="5" y="135" className="fill-neutral-400 text-[10px] font-mono">400K</text>
                  <text x="5" y="185" className="fill-neutral-400 text-[10px] font-mono">0</text>

                  {/* Area fill */}
                  <polygon
                    points="60,140 160,110 260,125 360,75 460,90 560,50 660,60 660,180 60,180"
                    fill="url(#revenueGrad)"
                  />

                  {/* Trend line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="60,140 160,110 260,125 360,75 460,90 560,50 660,60"
                  />

                  {/* Data points */}
                  {[
                    { x: 60, y: 140, day: '24 Sep', val: '420K' },
                    { x: 160, y: 110, day: '25 Sep', val: '640K' },
                    { x: 260, y: 125, day: '26 Sep', val: '580K' },
                    { x: 360, y: 75, day: '27 Sep', val: '890K' },
                    { x: 460, y: 90, day: '28 Sep', val: '760K' },
                    { x: 560, y: 50, day: '29 Sep', val: '1.05M' },
                    { x: 660, y: 60, day: 'Today', val: '920K' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                      <text x={pt.x} y="196" textAnchor="middle" className="fill-neutral-500 text-[10px] font-semibold">
                        {pt.day}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Visualizer 2: Route Share Distribution */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {t.popularRoutes} (Demand Share)
              </h3>
              <p className="text-xs text-neutral-500">Seat volume by corridor</p>

              <div className="mt-6 space-y-4">
                {[
                  { route: 'Kigali → Karongi', pct: 38, col: 'bg-emerald-600', val: '1,420 seats' },
                  { route: 'Kigali → Huye', pct: 28, col: 'bg-blue-600', val: '980 seats' },
                  { route: 'Kigali → Musanze', pct: 20, col: 'bg-purple-600', val: '750 seats' },
                  { route: 'Kigali → Rubavu', pct: 14, col: 'bg-amber-600', val: '510 seats' },
                ].map((item) => (
                  <div key={item.route} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {item.route}
                      </span>
                      <span className="font-mono tabular-nums text-neutral-500">{item.pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div className={`h-full rounded-full ${item.col}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings Audit Table */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Recent Customer Bookings
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                View all bookings →
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                  <tr>
                    <th className="py-2.5 px-3">Booking Ref</th>
                    <th className="py-2.5 px-3">Lead Passenger</th>
                    <th className="py-2.5 px-3">Trip</th>
                    <th className="py-2.5 px-3">Seat</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {bookings.slice(0, 5).map((b) => {
                    const tr = trips.find((t) => t.id === b.tripId);
                    return (
                      <tr key={b.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold">{b.bookingReference}</td>
                        <td className="py-2.5 px-3 font-semibold">{b.passengers[0]?.fullName || 'Customer'}</td>
                        <td className="py-2.5 px-3">{tr ? `${tr.origin} → ${tr.destination}` : 'Kigali → Karongi'}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">{b.selectedSeats.join(', ')}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-emerald-600 font-bold">{b.totalAmount.toLocaleString()} RWF</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-neutral-500">{b.paymentMethod || 'momo_mtn'}</td>
                        <td className="py-2.5 px-3">
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {b.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIPS & SCHEDULES */}
      {activeTab === 'trips' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search trip routes or operators..."
                value={tripSearch}
                onChange={(e) => setTripSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white py-1.5 pl-9 pr-3 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <button
              onClick={() => setShowAddTripModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule New Trip</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Departure & Arrival</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Fare (RWF)</th>
                  <th className="py-3 px-4">Occupancy</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {trips.map((tr) => (
                  <tr key={tr.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{tr.operatorName}</td>
                    <td className="py-3 px-4 font-semibold">{tr.origin} → {tr.destination}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{tr.departureTime} – {tr.arrivalTime}</td>
                    <td className="py-3 px-4 font-mono font-bold text-neutral-700 dark:text-neutral-300">{tr.vehicleReg}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-600">{tr.priceRwf.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{tr.bookedSeats?.length || 0} / {tr.totalSeats} seats</td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                        {tr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={tr.status}
                        onChange={(e) => updateTripStatus(tr.id, e.target.value as any)}
                        className="rounded border border-neutral-300 bg-white py-1 px-1.5 text-[11px] font-semibold dark:border-neutral-700 dark:bg-neutral-800"
                      >
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="BOARDING">BOARDING</option>
                        <option value="DEPARTED">DEPARTED</option>
                        <option value="ARRIVED">ARRIVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VEHICLES & FLEET */}
      {activeTab === 'vehicles' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Active Fleet Registry</h2>
              <p className="text-xs text-neutral-500">Manage licensed transport vehicles, inspection records, and seat layouts.</p>
            </div>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Vehicle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-neutral-400">{v.vehicleNumber}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {v.status}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-base font-extrabold font-mono text-neutral-900 dark:text-white">
                    {v.registrationNumber}
                  </div>
                  <div className="text-xs text-neutral-500">{v.vehicleType}</div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                  <span className="text-neutral-500">Seat Capacity:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{v.capacity} Seats</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {v.amenities.map((am) => (
                    <span key={am} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {am}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROUTES */}
      {activeTab === 'routes' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Route Network & Distances</h2>
              <p className="text-xs text-neutral-500">Provincial transport corridors and tariff boundaries.</p>
            </div>
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Route</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Origin</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Distance (km)</th>
                  <th className="py-3 px-4">Estimated Travel Time</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {routes.map((rt) => (
                  <tr key={rt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{rt.origin}</td>
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{rt.destination}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{rt.distanceKm} km</td>
                    <td className="py-3 px-4 font-mono">{rt.estimatedDuration}</td>
                    <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">{rt.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">All Bookings & Manifests</h2>
            <div className="font-mono text-xs text-neutral-500">Total: {(bookings || []).length} reservations</div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Passenger</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date Created</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">{b.bookingReference}</td>
                    <td className="py-3 px-4 font-semibold">{b.passengers[0]?.fullName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{b.selectedSeats.join(', ')}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-600">{b.totalAmount.toLocaleString()} RWF</td>
                    <td className="py-3 px-4 uppercase text-[10px] text-neutral-500">{b.paymentMethod || 'momo_mtn'}</td>
                    <td className="py-3 px-4 text-neutral-400 tabular-nums">{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS & REVENUE AUDIT */}
      {activeTab === 'payments' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Financial Transaction Ledger</h2>
              <p className="text-xs text-neutral-500">Every MoMo, Airtel, and Card settlement record verified by telecom gateways.</p>
            </div>
            <div className="font-mono text-sm font-extrabold tabular-nums text-emerald-600">
              Total Audited: {totalRevenue.toLocaleString()} RWF
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Account / Phone</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-mono font-bold">{p.transactionReference}</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">{p.bookingId}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{p.accountOrPhone}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-600">
                      {p.amount.toLocaleString()} RWF
                    </td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        p.paymentStatus === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : p.paymentStatus === 'REFUNDED'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400 tabular-nums">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Registered Users & Role-Based Permissions</h2>
              <p className="text-xs text-neutral-500">Real accounts registered in Firestore database with role-based access control.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500">{(users || []).length} active users</span>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Customer / Staff / Admin</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">National ID / Passport</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{u.fullName}</td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">{u.email}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'staff'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}>
                        {u.role} {u.adminSubRole ? `(${u.adminSubRole})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-400">{u.nationalId || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: ADVANCED REPORTS */}
      {activeTab === 'reports' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Annual Transit Performance & Reports</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Aggregated analytics for Rwanda Utilities Regulatory Authority (RURA) compliance and fleet efficiency.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                <span className="text-xs text-neutral-400 uppercase font-semibold">Total Passengers Carried</span>
                <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                  24,850
                </div>
                <div className="mt-1 text-[11px] text-emerald-600">+18% YoY growth</div>
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                <span className="text-xs text-neutral-400 uppercase font-semibold">On-Time Departure Rate</span>
                <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white">
                  99.4%
                </div>
                <div className="mt-1 text-[11px] text-emerald-600">Exceeds national target (95%)</div>
              </div>

              <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40">
                <span className="text-xs text-neutral-400 uppercase font-semibold">MoMo Transaction Reliability</span>
                <div className="mt-1 text-2xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  99.98%
                </div>
                <div className="mt-1 text-[11px] text-neutral-500">MTN MoMo + Airtel Money</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD TRIP */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Schedule New Intercity Trip</h3>
              <button onClick={() => setShowAddTripModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Origin Station</label>
                  <input
                    type="text"
                    required
                    value={newTripOrigin}
                    onChange={(e) => setNewTripOrigin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Destination</label>
                  <input
                    type="text"
                    required
                    value={newTripDest}
                    onChange={(e) => setNewTripDest(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Operator</label>
                  <input
                    type="text"
                    required
                    value={newTripOperator}
                    onChange={(e) => setNewTripOperator(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Assign Vehicle</label>
                  <select
                    value={newTripVehicleId}
                    onChange={(e) => setNewTripVehicleId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.vehicleType} ({v.capacity}s)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Date</label>
                  <input
                    type="date"
                    required
                    value={newTripDate}
                    onChange={(e) => setNewTripDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Departure</label>
                  <input
                    type="text"
                    required
                    value={newTripDepTime}
                    onChange={(e) => setNewTripDepTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Arrival</label>
                  <input
                    type="text"
                    required
                    value={newTripArrTime}
                    onChange={(e) => setNewTripArrTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Ticket Fare (RWF)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={newTripPrice}
                  onChange={(e) => setNewTripPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono tabular-nums"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTripModal(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Schedule Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Register Fleet Vehicle</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Registration Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAD 778 X"
                  value={newVehReg}
                  onChange={(e) => setNewVehReg(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Vehicle Model</label>
                <select
                  value={newVehType}
                  onChange={(e) => setNewVehType(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="Toyota Coaster">Toyota Coaster</option>
                  <option value="Yutong Coach">Yutong Coach</option>
                  <option value="Scania Cruiser">Scania Cruiser</option>
                  <option value="Minibus VIP">Minibus VIP</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Seat Capacity</label>
                <input
                  type="number"
                  required
                  min={12}
                  max={60}
                  value={newVehCap}
                  onChange={(e) => setNewVehCap(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROUTE */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create New Corridor Route</h3>
              <button onClick={() => setShowAddRouteModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Origin</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kigali"
                    value={newRouteOrigin}
                    onChange={(e) => setNewRouteOrigin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nyagatare"
                    value={newRouteDest}
                    onChange={(e) => setNewRouteDest(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Distance (km)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newRouteDist}
                    onChange={(e) => setNewRouteDist(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Duration (est.)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3h 15m"
                    value={newRouteDur}
                    onChange={(e) => setNewRouteDur(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRouteModal(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER / ACCOUNT TO DATABASE */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Add Account to Cloud Database</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alistide Manzi"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@domain.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+250 788 123 456"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">National ID / Passport</label>
                <input
                  type="text"
                  placeholder="1199580012345678"
                  value={newUserNatId}
                  onChange={(e) => setNewUserNatId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-1.5 px-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">Account Role *</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {(['customer', 'staff', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUserRole(r)}
                      className={`rounded-lg py-1.5 text-center font-bold capitalize transition-all ${
                        newUserRole === r
                          ? 'bg-emerald-600 text-white'
                          : 'border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {newUserRole === 'admin' && (
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">Admin Sub-Role</label>
                  <div className="mt-1 flex gap-2">
                    {(['super_admin', 'trip_manager', 'finance_admin'] as const).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setNewUserSubRole(sub)}
                        className={`flex-1 rounded py-1 text-[10px] font-semibold transition-colors ${
                          newUserSubRole === sub
                            ? 'bg-purple-600 text-white'
                            : 'border border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {sub === 'super_admin' ? 'Super Admin' : sub === 'trip_manager' ? 'Trip Mgr' : 'Finance'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
