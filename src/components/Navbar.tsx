import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/translations';
import { Role, AdminSubRole, Language } from '../types';
import { AuthModal } from './AuthModal';
import {
  Bus,
  Moon,
  Sun,
  Bell,
  Ticket as TicketIcon,
  Shield,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Database,
  LogIn,
  LogOut,
  UserPlus,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    adminSubRole,
    setAdminSubRole,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    activeView,
    setActiveView,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalRole,
    signOutUser,
  } = useApp();

  const t = getTranslation(language);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const unreadNotifs = (notifications || []).filter((n) => !n.read);

  const navLinks = [
    { id: 'home', label: language === 'rw' ? 'Ahabanza' : language === 'fr' ? 'Accueil' : 'Home' },
    { id: 'search', label: t.searchTrips },
    { id: 'my-bookings', label: t.myBookings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/95 dark:supports-[backdrop-filter]:bg-neutral-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand title & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                <Bus className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                  RwandaGo
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Intercity Express Booking
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveView(link.id)}
                className={`transition-colors hover:text-neutral-900 dark:hover:text-white ${
                  activeView === link.id
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : ''
                }`}
              >
                {link.label}
              </button>
            ))}
            {currentRole === 'staff' && (
              <button
                onClick={() => setActiveView('staff-verifier')}
                className={`flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-white ${
                  activeView === 'staff-verifier'
                    ? 'font-semibold text-amber-600 dark:text-amber-400'
                    : ''
                }`}
              >
                <UserCheck className="h-4 w-4 text-amber-500" />
                <span>{t.staffPortal}</span>
              </button>
            )}
            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveView('admin-dashboard')}
                className={`flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-white ${
                  activeView === 'admin-dashboard'
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : ''
                }`}
              >
                <Shield className="h-4 w-4 text-emerald-500" />
                <span>{t.adminDashboard}</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Controls, Real Account Auth & Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowRoleMenu(false);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                title="Select Language"
              >
                <span className="uppercase">{language}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50">
                  {(['en', 'rw', 'fr'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setShowLangMenu(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-1.5 text-xs ${
                        language === lang
                          ? 'bg-neutral-100 font-semibold text-emerald-600 dark:bg-neutral-800 dark:text-emerald-400'
                          : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <span>
                        {lang === 'en' ? 'English' : lang === 'rw' ? 'Kinyarwanda' : 'Français'}
                      </span>
                      {language === lang && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowRoleMenu(false);
                  setShowLangMenu(false);
                }}
                className="relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(unreadNotifs?.length || 0) > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-neutral-200 bg-white py-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50">
                  <div className="flex items-center justify-between border-b border-neutral-100 px-4 pb-2 dark:border-neutral-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Notifications ({(notifications || []).length})
                    </span>
                    {(unreadNotifs?.length || 0) > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {(notifications || []).length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-500">No notifications</div>
                    ) : (
                      (notifications || []).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`cursor-pointer border-b border-neutral-50 px-4 py-2.5 transition-colors dark:border-neutral-800/50 ${
                            !notif.read
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {notif.title}
                          </div>
                          <div className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {notif.message}
                          </div>
                          <div className="mt-1 text-[10px] text-neutral-400 tabular-nums">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* REAL ACCOUNT PROFILE & SWITCHER */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotifMenu(false);
                  setShowLangMenu(false);
                }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  currentRole === 'admin'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : currentRole === 'staff'
                    ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-neutral-300 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                {currentRole === 'customer' && <TicketIcon className="h-3.5 w-3.5 text-blue-600" />}
                {currentRole === 'staff' && <UserCheck className="h-3.5 w-3.5 text-amber-600" />}
                {currentRole === 'admin' && <Shield className="h-3.5 w-3.5 text-emerald-600" />}

                <div className="flex flex-col text-left">
                  <span className="font-semibold capitalize leading-none text-[11px] truncate max-w-[110px]">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold leading-tight">
                    {currentRole}
                  </span>
                </div>

                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 z-50">
                  {/* Current Real User Info */}
                  <div className="border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Active Real Account
                      </span>
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <Database className="h-2.5 w-2.5" />
                        Firestore DB
                      </span>
                    </div>
                    <div className="mt-1 font-bold text-xs text-neutral-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate">{currentUser.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                      <span>Phone: {currentUser.phone}</span>
                    </div>
                  </div>

                  {/* Switch to Real Roles */}
                  <div className="mt-2.5">
                    <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      Switch Real Role / Account
                    </div>

                    {/* Admin Switch */}
                    <button
                      onClick={() => {
                        setCurrentRole('admin');
                        setShowRoleMenu(false);
                      }}
                      className={`mt-1 flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        currentRole === 'admin'
                          ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Shield className="mt-0.5 h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>Real Administrator</span>
                          {currentRole === 'admin' && (
                            <span className="text-[9px] bg-emerald-600 text-white rounded px-1">ACTIVE</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Create trips anywhere, manage vehicles, routes, customers & reports
                        </div>
                      </div>
                    </button>

                    {/* Staff Switch */}
                    <button
                      onClick={() => {
                        setCurrentRole('staff');
                        setShowRoleMenu(false);
                      }}
                      className={`mt-1 flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        currentRole === 'staff'
                          ? 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <UserCheck className="mt-0.5 h-4 w-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>Real Staff / Operator</span>
                          {currentRole === 'staff' && (
                            <span className="text-[9px] bg-amber-600 text-white rounded px-1">ACTIVE</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Scan QR codes, verify tickets, board passengers in database
                        </div>
                      </div>
                    </button>

                    {/* Customer Switch */}
                    <button
                      onClick={() => {
                        setCurrentRole('customer');
                        setShowRoleMenu(false);
                      }}
                      className={`mt-1 flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                        currentRole === 'customer'
                          ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <TicketIcon className="mt-0.5 h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <span>Real Customer</span>
                          {currentRole === 'customer' && (
                            <span className="text-[9px] bg-blue-600 text-white rounded px-1">ACTIVE</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          Search trips, select seats, SMS MoMo payment, get digital ticket
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Real Auth Actions */}
                  <div className="mt-3 border-t border-neutral-100 pt-2 dark:border-neutral-800 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        openAuthModal('customer');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 font-medium"
                    >
                      <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Sign In with Real Account (Firebase)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        openAuthModal('admin');
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 font-medium"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                      <span>Register Real Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        signOutUser();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal for Real Account Login & Registration */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultRole={authModalRole}
      />
    </>
  );
};
