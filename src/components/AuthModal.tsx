import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  signInRealAccount,
  registerRealAccount,
  quickAccessRealAccount,
  PRESET_REAL_ACCOUNTS,
} from '../utils/authService';
import { Role, AdminSubRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Shield,
  UserCheck,
  Ticket,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultRole = 'customer' }) => {
  const { setCurrentUser, setCurrentRole, setAdminSubRole, setActiveView } = useApp();
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+250 78');
  const [nationalId, setNationalId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [adminSub, setAdminSub] = useState<AdminSubRole>('super_admin');

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signInRealAccount(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        if (res.user.adminSubRole) {
          setAdminSubRole(res.user.adminSubRole);
        }
        setSuccessMsg(`Welcome back, ${res.user.fullName}! Connected to database as ${res.user.role.toUpperCase()}.`);

        setTimeout(() => {
          if (res.user?.role === 'admin') setActiveView('admin-dashboard');
          else if (res.user?.role === 'staff') setActiveView('staff-verifier');
          else setActiveView('home');
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to sign in.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await registerRealAccount(
        fullName,
        email,
        password,
        phone,
        nationalId,
        selectedRole,
        adminSub
      );

      if (res.success && res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        if (res.user.adminSubRole) {
          setAdminSubRole(res.user.adminSubRole);
        }
        setSuccessMsg(`Account created and registered in database as ${res.user.role.toUpperCase()}!`);

        setTimeout(() => {
          if (res.user?.role === 'admin') setActiveView('admin-dashboard');
          else if (res.user?.role === 'staff') setActiveView('staff-verifier');
          else setActiveView('home');
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (type: 'admin' | 'staff' | 'customer') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await quickAccessRealAccount(type);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        if (res.user.adminSubRole) {
          setAdminSubRole(res.user.adminSubRole);
        }
        setSuccessMsg(`Signed in with verified real ${type.toUpperCase()} account in Firebase!`);

        setTimeout(() => {
          if (type === 'admin') setActiveView('admin-dashboard');
          else if (type === 'staff') setActiveView('staff-verifier');
          else setActiveView('home');
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || `Failed to sign in as ${type}.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error with quick authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Database Connected Status Badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Database className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
          <span>Real Database & Firebase Auth Connected</span>
        </div>

        {/* Header */}
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {mode === 'signin' ? 'Sign In to RwandaGo' : 'Create Real Account'}
        </h2>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          {mode === 'signin'
            ? 'Sign in with your real admin, staff, or customer account credentials.'
            : 'Register a real account stored automatically in the Firestore database.'}
        </p>

        {/* Tab Switcher */}
        <div className="mt-4 flex rounded-lg border border-neutral-200 p-1 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Sign In (Real Account)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              mode === 'register'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Register Real Account
          </button>
        </div>

        {/* Quick Real Account Sign-In Shortcuts */}
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Instant Real Account Access</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/60 p-2 text-center hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/30"
            >
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="mt-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200">Real Admin</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 truncate max-w-full">
                admin@rwandago.rw
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('staff')}
              className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-center hover:bg-amber-100 transition-colors disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/30"
            >
              <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="mt-1 text-[11px] font-bold text-amber-800 dark:text-amber-200">Real Staff</span>
              <span className="text-[9px] text-amber-600 dark:text-amber-400 truncate max-w-full">
                staff.kigali@rwandago.rw
              </span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('customer')}
              className="flex flex-col items-center justify-center rounded-lg border border-blue-200 bg-blue-50/60 p-2 text-center hover:bg-blue-100 transition-colors disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950/30"
            >
              <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="mt-1 text-[11px] font-bold text-blue-800 dark:text-blue-200">Real Customer</span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 truncate max-w-full">
                alistidemanzi@...
              </span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address *
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com or admin@rwandago.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password *
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter real password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating with Firebase...' : 'Sign In to Real Account'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Account Role to Provision *
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`flex flex-col items-center rounded-lg border p-2 text-center transition-all ${
                    selectedRole === 'customer'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold dark:bg-blue-950/40 dark:text-blue-200'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <Ticket className="h-4 w-4 text-blue-600 mb-1" />
                  <span className="text-[11px]">Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('staff')}
                  className={`flex flex-col items-center rounded-lg border p-2 text-center transition-all ${
                    selectedRole === 'staff'
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold dark:bg-amber-950/40 dark:text-amber-200'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <UserCheck className="h-4 w-4 text-amber-600 mb-1" />
                  <span className="text-[11px]">Staff Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`flex flex-col items-center rounded-lg border p-2 text-center transition-all ${
                    selectedRole === 'admin'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold dark:bg-emerald-950/40 dark:text-emerald-200'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  <Shield className="h-4 w-4 text-emerald-600 mb-1" />
                  <span className="text-[11px]">Administrator</span>
                </button>
              </div>
            </div>

            {selectedRole === 'admin' && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-2.5 dark:border-emerald-900 dark:bg-emerald-950/20">
                <label className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  Admin Authority Sub-Role
                </label>
                <div className="mt-1 flex gap-2">
                  {(['super_admin', 'trip_manager', 'finance_admin'] as AdminSubRole[]).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setAdminSub(sub)}
                      className={`flex-1 rounded py-1 text-[10px] font-semibold transition-colors ${
                        adminSub === sub
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-neutral-700 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      {sub === 'super_admin' ? 'Super Admin' : sub === 'trip_manager' ? 'Trip Mgr' : 'Finance'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Full Name *
              </label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alistide Manzi or David Gasana"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Email Address *
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Password * (Min 6 chars)
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Real Phone Number *
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+250 788 123 456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  National ID / Passport
                </label>
                <input
                  type="text"
                  placeholder="1199080012345678"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating in Database & Auth...' : `Register Real ${selectedRole.toUpperCase()} Account`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
