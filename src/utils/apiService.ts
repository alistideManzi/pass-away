import { RouteItem, Vehicle, Trip, Booking, Ticket, Payment, NotificationItem, User } from '../types';

export const apiService = {
  // Routes
  async getRoutes(): Promise<RouteItem[]> {
    const res = await fetch('/api/routes');
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },
  async createRoute(route: RouteItem): Promise<RouteItem> {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(route),
    });
    if (!res.ok) throw new Error('Failed to create route');
    return res.json();
  },

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const res = await fetch('/api/vehicles');
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
  },
  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    });
    if (!res.ok) throw new Error('Failed to create vehicle');
    return res.json();
  },

  // Trips
  async getTrips(): Promise<Trip[]> {
    const res = await fetch('/api/trips');
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },
  async createTrip(trip: Trip): Promise<Trip> {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return res.json();
  },
  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip> {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update trip');
    return res.json();
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const res = await fetch('/api/bookings');
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },
  async createBooking(booking: Booking): Promise<Booking> {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!res.ok) throw new Error('Failed to create booking');
    return res.json();
  },
  async cancelBooking(bookingId: string): Promise<Booking> {
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  },

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    const res = await fetch('/api/tickets');
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },
  async createTicket(ticket: Ticket): Promise<Ticket> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    if (!res.ok) throw new Error('Failed to create ticket');
    return res.json();
  },
  async boardTicket(ticketNumber: string, boardedBy: string): Promise<Ticket> {
    const res = await fetch('/api/tickets/board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketNumber, boardedBy }),
    });
    if (!res.ok) throw new Error('Failed to board ticket');
    return res.json();
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch('/api/payments');
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },
  async createPayment(payment: Payment): Promise<Payment> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  async saveUser(user: User): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to save user');
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const url = userId ? `/api/notifications?userId=${encodeURIComponent(userId)}` : '/api/notifications';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
  async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    if (!res.ok) throw new Error('Failed to create notification');
    return res.json();
  },
  async markNotificationRead(id: string): Promise<NotificationItem> {
    const res = await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },
};
