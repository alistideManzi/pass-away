export type Role = 'customer' | 'staff' | 'admin';
export type AdminSubRole = 'super_admin' | 'trip_manager' | 'finance_admin';

export type Language = 'en' | 'rw' | 'fr';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  adminSubRole?: AdminSubRole;
  nationalId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface RouteItem {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDuration: string;
  popular: boolean;
  description: string;
  imageUrl?: string;
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  registrationNumber: string;
  vehicleType: 'Toyota Coaster' | 'Yutong Coach' | 'Scania Cruiser' | 'Minibus VIP';
  capacity: number;
  status: 'active' | 'maintenance' | 'reserved';
  amenities: string[];
}

export interface ReservedSeatHold {
  seatNumber: string;
  userId: string;
  expiresAt: number; // timestamp
}

export interface Trip {
  id: string;
  routeId: string;
  origin: string;
  destination: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleType: string;
  operatorName: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  arrivalTime: string;   // HH:MM
  priceRwf: number;
  totalSeats: number;
  bookedSeats: string[];
  reservedSeats: ReservedSeatHold[];
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  amenities: string[];
}

export interface Passenger {
  seatNumber: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  tripId: string;
  passengers: Passenger[];
  selectedSeats: string[];
  baseAmount: number;
  discountAmount: number;
  totalAmount: number;
  promoCode?: string;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  paymentId?: string;
  paymentMethod?: 'momo_mtn' | 'airtel_money' | 'card';
}

export interface Payment {
  id: string;
  bookingId: string;
  transactionReference: string;
  amount: number;
  paymentMethod: 'momo_mtn' | 'airtel_money' | 'card';
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  accountOrPhone: string;
  paidAt: string;
}

export interface Ticket {
  id: string;
  bookingId: string;
  ticketNumber: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  passengerIdNumber: string;
  seatNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  operatorName: string;
  vehicleReg: string;
  priceRwf: number;
  qrCodeData: string;
  ticketStatus: 'VALID' | 'BOARDED' | 'CANCELLED' | 'EXPIRED';
  issuedAt: string;
  boardedAt?: string;
  boardedBy?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'ticket' | 'alert';
  createdAt: string;
  read: boolean;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  description: string;
}
