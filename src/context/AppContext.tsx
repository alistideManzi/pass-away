import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Role,
  AdminSubRole,
  Language,
  RouteItem,
  Vehicle,
  Trip,
  Booking,
  Ticket,
  Payment,
  NotificationItem,
  PromoCode,
  Passenger,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ROUTES,
  INITIAL_VEHICLES,
  INITIAL_TRIPS,
  INITIAL_BOOKINGS,
  INITIAL_PAYMENTS,
  INITIAL_TICKETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROMOS,
} from '../data/mockData';
import { parseTicketQRString } from '../utils/qr';
import { auth, onAuthStateChanged } from '../utils/firebase';
import { getActiveStoredUser, signOutRealAccount } from '../utils/authService';
import { apiService } from '../utils/apiService';
import {
  saveTripToFirestore,
  updateTripInFirestore,
  saveVehicleToFirestore,
  saveRouteToFirestore,
  saveBookingToFirestore,
  updateBookingInFirestore,
  saveTicketToFirestore,
  updateTicketInFirestore,
  savePaymentToFirestore,
  saveNotificationToFirestore,
  saveUserToFirestore,
  getUserFromFirestore,
  subscribeToTrips,
  subscribeToVehicles,
  subscribeToRoutes,
  subscribeToBookings,
  subscribeToTickets,
  subscribeToPayments,
  subscribeToUsers,
  seedFirestoreIfEmpty,
} from '../utils/firestoreService';

interface BookingDraft {
  trip: Trip | null;
  selectedSeats: string[];
  passengers: Passenger[];
  promoCode?: PromoCode;
  discountAmount: number;
}

export interface VerificationResult {
  status: 'VALID' | 'ALREADY_BOARDED' | 'CANCELLED' | 'NOT_FOUND';
  message: string;
  ticket?: Ticket;
  trip?: Trip;
}

interface AppContextType {
  // Authentication & Role
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  adminSubRole: AdminSubRole;
  setAdminSubRole: (subRole: AdminSubRole) => void;
  users: User[];
  loginAsUser: (userId: string) => void;
  registerUser: (name: string, email: string, phone: string, nationalId: string, role?: Role) => Promise<void>;
  signOutUser: () => Promise<void>;

  // Auth Modal State
  isAuthModalOpen: boolean;
  openAuthModal: (defaultRole?: Role) => void;
  closeAuthModal: () => void;
  authModalRole: Role;

  // Language & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Database Connection
  isDatabaseLive: boolean;

  // Core Data Collections
  routes: RouteItem[];
  vehicles: Vehicle[];
  trips: Trip[];
  bookings: Booking[];
  tickets: Ticket[];
  payments: Payment[];
  notifications: NotificationItem[];
  promos: PromoCode[];

  // Navigation & View State
  activeView: string;
  setActiveView: (view: string) => void;
  bookingDraft: BookingDraft;
  setBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  lastCompletedBooking: Booking | null;
  lastIssuedTickets: Ticket[];

  // Booking Flow & Concurrency
  selectTripForBooking: (trip: Trip) => void;
  toggleSeatSelection: (seatNumber: string) => { success: boolean; message?: string };
  setPassengerDetails: (passengers: Passenger[]) => void;
  applyPromoCode: (codeStr: string) => { success: boolean; message: string };
  processCheckoutPayment: (
    method: 'momo_mtn' | 'airtel_money' | 'card',
    accountNumber: string
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  // Ticket Operations
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  verifyTicket: (qrOrCode: string) => VerificationResult;
  boardTicket: (ticketNumber: string) => Promise<{ success: boolean; message: string }>;

  // Admin Actions
  addNewTrip: (tripData: Omit<Trip, 'id' | 'bookedSeats' | 'reservedSeats'>) => Promise<void>;
  addNewVehicle: (vehicleData: Omit<Vehicle, 'id'>) => Promise<void>;
  addNewRoute: (routeData: Omit<RouteItem, 'id'>) => Promise<void>;
  addNewUser: (userData: User) => Promise<void>;
  updateTripStatus: (tripId: string, status: Trip['status']) => Promise<void>;

  // Notification helpers
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'rwandago_users_v2',
  TRIPS: 'rwandago_trips_v2',
  VEHICLES: 'rwandago_vehicles_v2',
  ROUTES: 'rwandago_routes_v2',
  BOOKINGS: 'rwandago_bookings_v2',
  TICKETS: 'rwandago_tickets_v2',
  PAYMENTS: 'rwandago_payments_v2',
  NOTIFICATIONS: 'rwandago_notifications_v2',
  LANGUAGE: 'rwandago_lang_v2',
  THEME: 'rwandago_theme_v2',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeTrip(trip: any): Trip {
  return {
    ...trip,
    bookedSeats: Array.isArray(trip?.bookedSeats) ? trip.bookedSeats : [],
    reservedSeats: Array.isArray(trip?.reservedSeats) ? trip.reservedSeats : [],
    amenities: Array.isArray(trip?.amenities) ? trip.amenities : [],
    totalSeats: typeof trip?.totalSeats === 'number' ? trip.totalSeats : 30,
    priceRwf: typeof trip?.priceRwf === 'number' ? trip.priceRwf : 5000,
  };
}

function normalizeBooking(booking: any): Booking {
  return {
    ...booking,
    passengers: Array.isArray(booking?.passengers) ? booking.passengers : [],
    selectedSeats: Array.isArray(booking?.selectedSeats) ? booking.selectedSeats : [],
    totalAmount: typeof booking?.totalAmount === 'number' ? booking.totalAmount : 0,
  };
}

function normalizeVehicle(veh: any): Vehicle {
  return {
    ...veh,
    amenities: Array.isArray(veh?.amenities) ? veh.amenities : [],
    capacity: typeof veh?.capacity === 'number' ? veh.capacity : 30,
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    return Array.isArray(loaded) ? loaded : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || INITIAL_USERS[0]);
  const [currentRole, setCurrentRoleState] = useState<Role>(() => currentUser.role || 'customer');
  const [adminSubRole, setAdminSubRole] = useState<AdminSubRole>('super_admin');

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<Role>('customer');

  const [language, setLanguageState] = useState<Language>(() => loadStored(STORAGE_KEYS.LANGUAGE, 'en'));
  const [darkMode, setDarkMode] = useState<boolean>(() => loadStored(STORAGE_KEYS.THEME, false));
  const [isDatabaseLive, setIsDatabaseLive] = useState(true);

  // Collections
  const [routes, setRoutes] = useState<RouteItem[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.ROUTES, INITIAL_ROUTES);
    return Array.isArray(loaded) ? loaded : INITIAL_ROUTES;
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    return Array.isArray(loaded) ? loaded.map(normalizeVehicle) : INITIAL_VEHICLES.map(normalizeVehicle);
  });
  const [trips, setTrips] = useState<Trip[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.TRIPS, INITIAL_TRIPS);
    return Array.isArray(loaded) ? loaded.map(normalizeTrip) : INITIAL_TRIPS.map(normalizeTrip);
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    return Array.isArray(loaded) ? loaded.map(normalizeBooking) : INITIAL_BOOKINGS.map(normalizeBooking);
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.TICKETS, INITIAL_TICKETS);
    return Array.isArray(loaded) ? loaded : INITIAL_TICKETS;
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    return Array.isArray(loaded) ? loaded : INITIAL_PAYMENTS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const loaded = loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return Array.isArray(loaded) ? loaded : INITIAL_NOTIFICATIONS;
  });
  const [promos] = useState<PromoCode[]>(INITIAL_PROMOS);

  const [activeView, setActiveView] = useState<string>('home');
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    trip: null,
    selectedSeats: [],
    passengers: [],
    discountAmount: 0,
  });

  const [lastCompletedBooking, setLastCompletedBooking] = useState<Booking | null>(null);
  const [lastIssuedTickets, setLastIssuedTickets] = useState<Ticket[]>([]);

  // 1. Initial Seed & Database Listeners
  useEffect(() => {
    // Seed initial dataset to Firestore if empty
    seedFirestoreIfEmpty();

    // Fetch initial datasets from Cloud SQL backend
    apiService.getTrips().then((t) => {
      if (Array.isArray(t) && t.length > 0) setTrips(t.map(normalizeTrip));
    }).catch(() => {});
    apiService.getRoutes().then((r) => {
      if (Array.isArray(r) && r.length > 0) setRoutes(r);
    }).catch(() => {});
    apiService.getVehicles().then((v) => {
      if (Array.isArray(v) && v.length > 0) setVehicles(v.map(normalizeVehicle));
    }).catch(() => {});
    apiService.getBookings().then((b) => {
      if (Array.isArray(b) && b.length > 0) setBookings(b.map(normalizeBooking));
    }).catch(() => {});
    apiService.getTickets().then((tk) => {
      if (Array.isArray(tk) && tk.length > 0) setTickets(tk);
    }).catch(() => {});
    apiService.getPayments().then((p) => {
      if (Array.isArray(p) && p.length > 0) setPayments(p);
    }).catch(() => {});
    apiService.getUsers().then((u) => {
      if (Array.isArray(u) && u.length > 0) setUsers(u);
    }).catch(() => {});

    // Listen to live database collections
    const unsubTrips = subscribeToTrips((liveTrips) => {
      if (Array.isArray(liveTrips) && liveTrips.length > 0) setTrips(liveTrips.map(normalizeTrip));
    });

    const unsubVehicles = subscribeToVehicles((liveVehs) => {
      if (Array.isArray(liveVehs) && liveVehs.length > 0) setVehicles(liveVehs.map(normalizeVehicle));
    });

    const unsubRoutes = subscribeToRoutes((liveRoutes) => {
      if (Array.isArray(liveRoutes) && liveRoutes.length > 0) setRoutes(liveRoutes);
    });

    const unsubBookings = subscribeToBookings((liveBks) => {
      if (Array.isArray(liveBks) && liveBks.length > 0) setBookings(liveBks.map(normalizeBooking));
    });

    const unsubTickets = subscribeToTickets((liveTkts) => {
      if (Array.isArray(liveTkts) && liveTkts.length > 0) setTickets(liveTkts);
    });

    const unsubPayments = subscribeToPayments((livePays) => {
      if (Array.isArray(livePays) && livePays.length > 0) setPayments(livePays);
    });

    const unsubUsers = subscribeToUsers((liveUsers) => {
      if (Array.isArray(liveUsers) && liveUsers.length > 0) setUsers(liveUsers);
    });

    return () => {
      unsubTrips();
      unsubVehicles();
      unsubRoutes();
      unsubBookings();
      unsubTickets();
      unsubPayments();
      unsubUsers();
    };
  }, []);

  // 2. Listen to Firebase Auth state & restore active stored user session
  useEffect(() => {
    getActiveStoredUser().then((stored) => {
      if (stored) {
        setCurrentUser(stored);
        setCurrentRoleState(stored.role);
        if (stored.adminSubRole) setAdminSubRole(stored.adminSubRole);
      }
    }).catch(() => {});

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch user from Firestore
        const dbUser = await getUserFromFirestore(fbUser.uid);
        if (dbUser) {
          setCurrentUser(dbUser);
          setCurrentRoleState(dbUser.role);
          if (dbUser.adminSubRole) setAdminSubRole(dbUser.adminSubRole);
        } else {
          // Default profile if not yet written
          const fallbackUser: User = {
            id: fbUser.uid,
            fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || '',
            phone: '+250 788 000 000',
            role: fbUser.email?.includes('admin') ? 'admin' : fbUser.email?.includes('staff') ? 'staff' : 'customer',
            createdAt: new Date().toISOString(),
          };
          await saveUserToFirestore(fallbackUser);
          setCurrentUser(fallbackUser);
          setCurrentRoleState(fallbackUser.role);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }, [trips]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
  }, [vehicles]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  }, [routes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, JSON.stringify(lang));
  };

  const openAuthModal = (defaultRole: Role = 'customer') => {
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const setCurrentRole = (role: Role) => {
    setCurrentRoleState(role);
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
    if (role === 'admin') {
      setActiveView('admin-dashboard');
    } else if (role === 'staff') {
      setActiveView('staff-verifier');
    } else {
      setActiveView('home');
    }
  };

  const loginAsUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentRoleState(user.role);
      if (user.role === 'admin') setActiveView('admin-dashboard');
      else if (user.role === 'staff') setActiveView('staff-verifier');
      else setActiveView('home');
    }
  };

  const signOutUser = async () => {
    await signOutRealAccount();
    // Switch to first default customer
    const defaultCust = users.find((u) => u.role === 'customer') || INITIAL_USERS[0];
    setCurrentUser(defaultCust);
    setCurrentRoleState('customer');
    setActiveView('home');
  };

  const registerUser = async (name: string, email: string, phone: string, nationalId: string, role: Role = 'customer') => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: name,
      email,
      phone,
      nationalId,
      role,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentRoleState(role);
    await saveUserToFirestore(newUser);
  };

  // Seat hold cleaner
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTrips((prevTrips) =>
        prevTrips.map((t) => {
          if (!t.reservedSeats || !Array.isArray(t.reservedSeats) || t.reservedSeats.length === 0) return t;
          const activeHolds = t.reservedSeats.filter((h) => h && h.expiresAt > now);
          if (activeHolds.length === t.reservedSeats.length) return t;
          return { ...t, reservedSeats: activeHolds };
        })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectTripForBooking = (trip: Trip) => {
    setBookingDraft({
      trip,
      selectedSeats: [],
      passengers: [],
      discountAmount: 0,
      promoCode: undefined,
    });
    setActiveView('seat-select');
  };

  const toggleSeatSelection = (seatNumber: string): { success: boolean; message?: string } => {
    if (!bookingDraft.trip) return { success: false, message: 'No trip selected' };
    const trip = trips.find((t) => t.id === bookingDraft.trip!.id);
    if (!trip) return { success: false, message: 'Trip not found' };

    if ((trip.bookedSeats || []).includes(seatNumber)) {
      return { success: false, message: `Seat ${seatNumber} is already booked by another traveler.` };
    }

    const now = Date.now();
    const otherHold = (trip.reservedSeats || []).find(
      (h) => h && h.seatNumber === seatNumber && h.userId !== currentUser.id && h.expiresAt > now
    );
    if (otherHold) {
      return { success: false, message: `Seat ${seatNumber} is currently held in checkout by another customer.` };
    }

    const isCurrentlySelected = (bookingDraft.selectedSeats || []).includes(seatNumber);

    if (isCurrentlySelected) {
      const newSelected = (bookingDraft.selectedSeats || []).filter((s) => s !== seatNumber);
      setBookingDraft((prev) => ({
        ...prev,
        selectedSeats: newSelected,
        passengers: (prev.passengers || []).filter((p) => p.seatNumber !== seatNumber),
      }));

      const updatedReserved = (trip.reservedSeats || []).filter(
        (h) => !(h && h.seatNumber === seatNumber && h.userId === currentUser.id)
      );
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === trip.id ? { ...t, reservedSeats: updatedReserved } : t))
      );
      updateTripInFirestore(trip.id, { reservedSeats: updatedReserved });
      return { success: true };
    } else {
      if ((bookingDraft.selectedSeats?.length || 0) >= 6) {
        return { success: false, message: 'You can reserve a maximum of 6 seats per booking.' };
      }

      const newSelected = [...(bookingDraft.selectedSeats || []), seatNumber];
      const newPassenger: Passenger = {
        seatNumber,
        fullName: newSelected.length === 1 ? currentUser.fullName : '',
        phone: newSelected.length === 1 ? currentUser.phone : '+250 78',
        email: newSelected.length === 1 ? currentUser.email : '',
        idNumber: newSelected.length === 1 ? currentUser.nationalId || '' : '',
      };

      setBookingDraft((prev) => ({
        ...prev,
        selectedSeats: newSelected,
        passengers: [...(prev.passengers || []), newPassenger],
      }));

      const expiresAt = Date.now() + 10 * 60 * 1000;
      const filteredHolds = (trip.reservedSeats || []).filter(
        (h) => !(h && h.seatNumber === seatNumber && h.userId === currentUser.id)
      );
      const updatedReserved = [...filteredHolds, { seatNumber, userId: currentUser.id, expiresAt }];

      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === trip.id ? { ...t, reservedSeats: updatedReserved } : t))
      );
      updateTripInFirestore(trip.id, { reservedSeats: updatedReserved });
      return { success: true };
    }
  };

  const setPassengerDetails = (passengers: Passenger[]) => {
    setBookingDraft((prev) => ({ ...prev, passengers }));
  };

  const applyPromoCode = (codeStr: string): { success: boolean; message: string } => {
    const cleanCode = codeStr.trim().toUpperCase();
    const found = promos.find((p) => p.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, message: 'Invalid promo code. Try RWANDA2026 or EARLYBIRD.' };
    }
    const baseFare = (bookingDraft.trip?.priceRwf || 5000) * (bookingDraft.selectedSeats.length || 1);
    let discount = 0;
    if (found.discountPercent) {
      discount = Math.round((baseFare * found.discountPercent) / 100);
    } else if (found.discountAmount) {
      discount = found.discountAmount;
    }
    setBookingDraft((prev) => ({
      ...prev,
      promoCode: found,
      discountAmount: discount,
    }));
    return { success: true, message: `Promo code ${found.code} applied! Saved ${discount.toLocaleString()} RWF` };
  };

  const processCheckoutPayment = async (
    method: 'momo_mtn' | 'airtel_money' | 'card',
    accountNumber: string
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> => {
    if (!bookingDraft.trip || (bookingDraft.selectedSeats?.length || 0) === 0) {
      return { success: false, error: 'No seats selected.' };
    }
    const trip = trips.find((t) => t.id === bookingDraft.trip!.id);
    if (!trip) return { success: false, error: 'Trip no longer exists.' };

    for (const seat of (bookingDraft.selectedSeats || [])) {
      if ((trip.bookedSeats || []).includes(seat)) {
        return {
          success: false,
          error: `Seat ${seat} has already been paid for by another customer. Please select another seat.`,
        };
      }
    }

    const seatCount = bookingDraft.selectedSeats?.length || 0;
    const baseFare = trip.priceRwf * seatCount;
    const finalAmount = Math.max(0, baseFare - bookingDraft.discountAmount);
    const bookingRef = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const bookingId = `bk-${Date.now()}`;
    const paymentId = `pay-${Date.now()}`;
    const txPrefix = method === 'momo_mtn' ? 'MOM' : method === 'airtel_money' ? 'ART' : 'CRD';
    const txRef = `${txPrefix}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: paymentId,
      bookingId,
      transactionReference: txRef,
      amount: finalAmount,
      paymentMethod: method,
      paymentStatus: 'SUCCESS',
      accountOrPhone: accountNumber,
      paidAt: new Date().toISOString(),
    };

    const passengersList = (bookingDraft.passengers?.length || 0) > 0
      ? bookingDraft.passengers
      : (bookingDraft.selectedSeats || []).map((seat) => ({
          seatNumber: seat,
          fullName: currentUser.fullName,
          phone: currentUser.phone,
          email: currentUser.email,
          idNumber: currentUser.nationalId || '1199880012345678',
        }));

    const newBooking: Booking = {
      id: bookingId,
      bookingReference: bookingRef,
      userId: currentUser.id,
      tripId: trip.id,
      passengers: passengersList,
      selectedSeats: bookingDraft.selectedSeats || [],
      baseAmount: baseFare,
      discountAmount: bookingDraft.discountAmount,
      totalAmount: finalAmount,
      promoCode: bookingDraft.promoCode?.code,
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      paymentId,
      paymentMethod: method,
    };

    const newTickets: Ticket[] = [];
    const numPassengers = passengersList.length || 1;
    for (let i = 0; i < passengersList.length; i++) {
      const passenger = passengersList[i];
      const ticketNum = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
      const qrData = JSON.stringify({
        ticketNumber: ticketNum,
        bookingRef,
        passengerName: passenger.fullName,
        seatNumber: passenger.seatNumber,
        trip: `${trip.origin} → ${trip.destination}`,
        date: trip.departureDate,
        departure: trip.departureTime,
        price: Math.round(finalAmount / numPassengers),
        status: 'PAID',
        secretVerificationHash: `RW-HASH-${ticketNum.slice(-6)}`,
      });

      const ticketItem: Ticket = {
        id: `tkt-${Date.now()}-${i}`,
        bookingId,
        ticketNumber: ticketNum,
        tripId: trip.id,
        passengerName: passenger.fullName,
        passengerPhone: passenger.phone,
        passengerIdNumber: passenger.idNumber,
        seatNumber: passenger.seatNumber,
        origin: trip.origin,
        destination: trip.destination,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        operatorName: trip.operatorName,
        vehicleReg: trip.vehicleReg,
        priceRwf: Math.round(finalAmount / numPassengers),
        qrCodeData: qrData,
        ticketStatus: 'VALID',
        issuedAt: new Date().toISOString(),
      };
      newTickets.push(ticketItem);
      // Save ticket to Firestore
      await saveTicketToFirestore(ticketItem);
    }

    const updatedBooked = Array.from(new Set([...(trip.bookedSeats || []), ...(bookingDraft.selectedSeats || [])]));
    const updatedReserved = (trip.reservedSeats || []).filter((h) => !(bookingDraft.selectedSeats || []).includes(h.seatNumber));

    // Update in-memory state
    setTrips((prevTrips) =>
      prevTrips.map((t) =>
        t.id === trip.id
          ? { ...t, bookedSeats: updatedBooked, reservedSeats: updatedReserved }
          : t
      )
    );
    setBookings((prev) => [newBooking, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setTickets((prev) => [...newTickets, ...prev]);

    // Persist to Cloud SQL & Firestore
    apiService.updateTrip(trip.id, {
      bookedSeats: updatedBooked,
      reservedSeats: updatedReserved,
    }).catch(() => {});
    apiService.createBooking(newBooking).catch(() => {});
    apiService.createPayment(newPayment).catch(() => {});
    Promise.all(newTickets.map((t) => apiService.createTicket(t))).catch(() => {});

    await updateTripInFirestore(trip.id, {
      bookedSeats: updatedBooked,
      reservedSeats: updatedReserved,
    });
    await saveBookingToFirestore(newBooking);
    await savePaymentToFirestore(newPayment);

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Ticket Issued & Confirmed!',
      message: `Your booking ${bookingRef} (${trip.origin} → ${trip.destination}) is confirmed. Seat(s): ${bookingDraft.selectedSeats.join(', ')}.`,
      type: 'ticket',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    apiService.createNotification(newNotif).catch(() => {});
    await saveNotificationToFirestore(newNotif);

    setLastCompletedBooking(newBooking);
    setLastIssuedTickets(newTickets);

    setBookingDraft({
      trip: null,
      selectedSeats: [],
      passengers: [],
      discountAmount: 0,
      promoCode: undefined,
    });
    setActiveView('ticket-success');

    return { success: true, booking: newBooking };
  };

  const cancelBooking = async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.bookingStatus === 'CANCELLED') return { success: false, message: 'Booking is already cancelled.' };

    const trip = trips.find((t) => t.id === booking.tripId);
    if (trip) {
      const remainingSeats = trip.bookedSeats.filter((s) => !booking.selectedSeats.includes(s));
      setTrips((prevTrips) =>
        prevTrips.map((t) => (t.id === trip.id ? { ...t, bookedSeats: remainingSeats } : t))
      );
      apiService.updateTrip(trip.id, { bookedSeats: remainingSeats }).catch(() => {});
      await updateTripInFirestore(trip.id, { bookedSeats: remainingSeats });
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: 'CANCELLED' } : b))
    );
    await updateBookingInFirestore(bookingId, { bookingStatus: 'CANCELLED' });

    setTickets((prev) =>
      prev.map((t) => (t.bookingId === bookingId ? { ...t, ticketStatus: 'CANCELLED' } : t))
    );
    // Update tickets in Firestore
    const relatedTickets = tickets.filter((t) => t.bookingId === bookingId);
    for (const tkt of relatedTickets) {
      await updateTicketInFirestore(tkt.id, { ticketStatus: 'CANCELLED' });
    }

    const refundAmount = Math.round(booking.totalAmount * 0.9);
    const refundPayment: Payment = {
      id: `pay-rf-${Date.now()}`,
      bookingId: booking.id,
      transactionReference: `REFUND-${Date.now().toString().slice(-6)}`,
      amount: refundAmount,
      paymentMethod: booking.paymentMethod || 'momo_mtn',
      paymentStatus: 'REFUNDED',
      accountOrPhone: currentUser.phone,
      paidAt: new Date().toISOString(),
    };
    setPayments((prev) => [refundPayment, ...prev]);
    await savePaymentToFirestore(refundPayment);

    const refundNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: booking.userId,
      title: 'Booking Cancelled & Refund Issued',
      message: `Booking ${booking.bookingReference} cancelled. Refund of ${refundAmount.toLocaleString()} RWF has been returned.`,
      type: 'alert',
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [refundNotif, ...prev]);
    await saveNotificationToFirestore(refundNotif);

    apiService.cancelBooking(bookingId).catch(() => {});
    apiService.createPayment(refundPayment).catch(() => {});
    apiService.createNotification(refundNotif).catch(() => {});

    return {
      success: true,
      message: `Booking successfully cancelled. Refund of ${refundAmount.toLocaleString()} RWF (90%) processed.`,
    };
  };

  const verifyTicket = (qrOrCode: string): VerificationResult => {
    const parsed = parseTicketQRString(qrOrCode);
    const ticketNo = parsed ? parsed.ticketNumber : qrOrCode.trim();

    const ticket = tickets.find((t) => t.ticketNumber === ticketNo || t.id === ticketNo);
    if (!ticket) {
      return {
        status: 'NOT_FOUND',
        message: `Ticket "${ticketNo}" does not exist in the RwandaGo registry. Possible invalid ticket.`,
      };
    }

    const trip = trips.find((t) => t.id === ticket.tripId);

    if (ticket.ticketStatus === 'CANCELLED') {
      return {
        status: 'CANCELLED',
        message: `This ticket has been CANCELLED and refunded. Do not allow passenger to board.`,
        ticket,
        trip,
      };
    }

    if (ticket.ticketStatus === 'BOARDED') {
      return {
        status: 'ALREADY_BOARDED',
        message: `ALREADY USED: Passenger ${ticket.passengerName} boarded at ${ticket.boardedAt ? new Date(ticket.boardedAt).toLocaleTimeString() : 'earlier'} by ${ticket.boardedBy || 'Staff'}. Prevent double boarding!`,
        ticket,
        trip,
      };
    }

    return {
      status: 'VALID',
      message: `VALID TICKET: ${ticket.passengerName} (Seat ${ticket.seatNumber}). Departure: ${ticket.departureTime}, ${ticket.origin} → ${ticket.destination}.`,
      ticket,
      trip,
    };
  };

  const boardTicket = async (ticketNumber: string): Promise<{ success: boolean; message: string }> => {
    const ticket = tickets.find((t) => t.ticketNumber === ticketNumber);
    if (!ticket) return { success: false, message: 'Ticket not found' };
    if (ticket.ticketStatus === 'BOARDED') return { success: false, message: 'Ticket has already been boarded.' };
    if (ticket.ticketStatus === 'CANCELLED') return { success: false, message: 'Cannot board cancelled ticket.' };

    const boardedAt = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketNumber === ticketNumber
          ? { ...t, ticketStatus: 'BOARDED', boardedAt, boardedBy: currentUser.fullName }
          : t
      )
    );

    // Save to Cloud SQL & Firestore in real-time
    apiService.boardTicket(ticketNumber, currentUser.fullName).catch(() => {});
    await updateTicketInFirestore(ticket.id, {
      ticketStatus: 'BOARDED',
      boardedAt,
      boardedBy: currentUser.fullName,
    });

    return {
      success: true,
      message: `Passenger ${ticket.passengerName} (Seat ${ticket.seatNumber}) successfully marked as BOARDED!`,
    };
  };

  // Admin Actions
  const addNewTrip = async (tripData: Omit<Trip, 'id' | 'bookedSeats' | 'reservedSeats'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      bookedSeats: [],
      reservedSeats: [],
    };
    setTrips((prev) => [newTrip, ...prev]);
    apiService.createTrip(newTrip).catch(() => {});
    await saveTripToFirestore(newTrip);
  };

  const addNewVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `veh-${Date.now()}`,
    };
    setVehicles((prev) => [...prev, newVehicle]);
    apiService.createVehicle(newVehicle).catch(() => {});
    await saveVehicleToFirestore(newVehicle);
  };

  const addNewRoute = async (routeData: Omit<RouteItem, 'id'>) => {
    const newRoute: RouteItem = {
      ...routeData,
      id: `route-${Date.now()}`,
    };
    setRoutes((prev) => [...prev, newRoute]);
    apiService.createRoute(newRoute).catch(() => {});
    await saveRouteToFirestore(newRoute);
  };

  const addNewUser = async (userData: User) => {
    setUsers((prev) => [...prev, userData]);
    apiService.saveUser(userData).catch(() => {});
    await saveUserToFirestore(userData);
  };

  const updateTripStatus = async (tripId: string, status: Trip['status']) => {
    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status } : t)));
    apiService.updateTrip(tripId, { status }).catch(() => {});
    await updateTripInFirestore(tripId, { status });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole,
        setCurrentRole,
        adminSubRole,
        setAdminSubRole,
        users,
        loginAsUser,
        registerUser,
        signOutUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalRole,
        language,
        setLanguage,
        darkMode,
        toggleDarkMode,
        isDatabaseLive,
        routes,
        vehicles,
        trips,
        bookings,
        tickets,
        payments,
        notifications,
        promos,
        activeView,
        setActiveView,
        bookingDraft,
        setBookingDraft,
        lastCompletedBooking,
        lastIssuedTickets,
        selectTripForBooking,
        toggleSeatSelection,
        setPassengerDetails,
        applyPromoCode,
        processCheckoutPayment,
        cancelBooking,
        verifyTicket,
        boardTicket,
        addNewTrip,
        addNewVehicle,
        addNewRoute,
        addNewUser,
        updateTripStatus,
        markNotificationAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
