import { pgTable, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name').notNull().default(''),
  phone: text('phone').default(''),
  role: text('role').notNull().default('customer'),
  adminSubRole: text('admin_sub_role'),
  nationalId: text('national_id'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const routes = pgTable('routes', {
  id: text('id').primaryKey(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  distanceKm: integer('distance_km').notNull().default(0),
  estimatedDuration: text('estimated_duration').notNull().default(''),
  popular: boolean('popular').notNull().default(false),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url'),
});

export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull(),
  registrationNumber: text('registration_number').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  capacity: integer('capacity').notNull().default(30),
  status: text('status').notNull().default('active'),
  amenities: jsonb('amenities').$type<string[]>().default([]),
});

export const trips = pgTable('trips', {
  id: text('id').primaryKey(),
  routeId: text('route_id').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  vehicleReg: text('vehicle_reg').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  operatorName: text('operator_name').notNull(),
  departureDate: text('departure_date').notNull(),
  departureTime: text('departure_time').notNull(),
  arrivalTime: text('arrival_time').notNull(),
  priceRwf: integer('price_rwf').notNull().default(0),
  totalSeats: integer('total_seats').notNull().default(30),
  bookedSeats: jsonb('booked_seats').$type<string[]>().default([]),
  reservedSeats: jsonb('reserved_seats').$type<any[]>().default([]),
  status: text('status').notNull().default('SCHEDULED'),
  amenities: jsonb('amenities').$type<string[]>().default([]),
});

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey(),
  bookingReference: text('booking_reference').notNull().unique(),
  userId: text('user_id').notNull(),
  tripId: text('trip_id').notNull(),
  passengers: jsonb('passengers').$type<any[]>().default([]),
  selectedSeats: jsonb('selected_seats').$type<string[]>().default([]),
  baseAmount: integer('base_amount').notNull().default(0),
  discountAmount: integer('discount_amount').notNull().default(0),
  totalAmount: integer('total_amount').notNull().default(0),
  promoCode: text('promo_code'),
  bookingStatus: text('booking_status').notNull().default('CONFIRMED'),
  createdAt: text('created_at').notNull(),
  paymentId: text('payment_id'),
  paymentMethod: text('payment_method'),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull(),
  ticketNumber: text('ticket_number').notNull().unique(),
  tripId: text('trip_id').notNull(),
  passengerName: text('passenger_name').notNull(),
  passengerPhone: text('passenger_phone').notNull().default(''),
  passengerIdNumber: text('passenger_id_number').notNull().default(''),
  seatNumber: text('seat_number').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departureDate: text('departure_date').notNull(),
  departureTime: text('departure_time').notNull(),
  arrivalTime: text('arrival_time').notNull(),
  operatorName: text('operator_name').notNull(),
  vehicleReg: text('vehicle_reg').notNull(),
  priceRwf: integer('price_rwf').notNull().default(0),
  qrCodeData: text('qr_code_data').notNull(),
  ticketStatus: text('ticket_status').notNull().default('VALID'),
  issuedAt: text('issued_at').notNull(),
  boardedAt: text('boarded_at'),
  boardedBy: text('boarded_by'),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id').notNull(),
  transactionReference: text('transaction_reference').notNull().unique(),
  amount: integer('amount').notNull().default(0),
  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull().default('SUCCESS'),
  accountOrPhone: text('account_or_phone').notNull().default(''),
  paidAt: text('paid_at').notNull(),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('booking'),
  createdAt: text('created_at').notNull(),
  read: boolean('read').notNull().default(false),
});
