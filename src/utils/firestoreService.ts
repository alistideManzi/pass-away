import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  writeBatch,
} from './firebase';
import {
  User,
  Trip,
  Vehicle,
  RouteItem,
  Booking,
  Ticket,
  Payment,
  NotificationItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ROUTES,
  INITIAL_VEHICLES,
  INITIAL_TRIPS,
  INITIAL_BOOKINGS,
  INITIAL_TICKETS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

// User Database Operations
export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
  }
}

export async function getUserFromFirestore(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    return null;
  }
}

export function subscribeToUsers(callback: (users: User[]) => void) {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as User);
        callback(list);
      }
    },
    (err) => console.warn('Users listener notice:', err.message)
  );
}

// Trips Database Operations
export async function saveTripToFirestore(trip: Trip): Promise<void> {
  try {
    const tripRef = doc(db, 'trips', trip.id);
    await setDoc(tripRef, trip, { merge: true });
  } catch (error) {
    console.error('Error saving trip to Firestore:', error);
  }
}

export async function updateTripInFirestore(tripId: string, updates: Partial<Trip>): Promise<void> {
  try {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, updates);
  } catch (error) {
    console.error('Error updating trip in Firestore:', error);
  }
}

export function subscribeToTrips(callback: (trips: Trip[]) => void) {
  const tripsCol = collection(db, 'trips');
  return onSnapshot(
    tripsCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as Trip);
        callback(list);
      }
    },
    (err) => console.warn('Trips listener notice:', err.message)
  );
}

// Vehicles Database Operations
export async function saveVehicleToFirestore(vehicle: Vehicle): Promise<void> {
  try {
    const vehRef = doc(db, 'vehicles', vehicle.id);
    await setDoc(vehRef, vehicle, { merge: true });
  } catch (error) {
    console.error('Error saving vehicle to Firestore:', error);
  }
}

export function subscribeToVehicles(callback: (vehicles: Vehicle[]) => void) {
  const vehCol = collection(db, 'vehicles');
  return onSnapshot(
    vehCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as Vehicle);
        callback(list);
      }
    },
    (err) => console.warn('Vehicles listener notice:', err.message)
  );
}

// Routes Database Operations
export async function saveRouteToFirestore(route: RouteItem): Promise<void> {
  try {
    const routeRef = doc(db, 'routes', route.id);
    await setDoc(routeRef, route, { merge: true });
  } catch (error) {
    console.error('Error saving route to Firestore:', error);
  }
}

export function subscribeToRoutes(callback: (routes: RouteItem[]) => void) {
  const routesCol = collection(db, 'routes');
  return onSnapshot(
    routesCol,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as RouteItem);
        callback(list);
      }
    },
    (err) => console.warn('Routes listener notice:', err.message)
  );
}

// Bookings Database Operations
export async function saveBookingToFirestore(booking: Booking): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, booking, { merge: true });
  } catch (error) {
    console.error('Error saving booking to Firestore:', error);
  }
}

export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>): Promise<void> {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, updates);
  } catch (error) {
    console.error('Error updating booking in Firestore:', error);
  }
}

export function subscribeToBookings(callback: (bookings: Booking[]) => void) {
  const col = collection(db, 'bookings');
  return onSnapshot(
    col,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as Booking);
        callback(list);
      }
    },
    (err) => console.warn('Bookings listener notice:', err.message)
  );
}

// Tickets Database Operations
export async function saveTicketToFirestore(ticket: Ticket): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticket.id);
    await setDoc(ticketRef, ticket, { merge: true });
  } catch (error) {
    console.error('Error saving ticket to Firestore:', error);
  }
}

export async function updateTicketInFirestore(ticketId: string, updates: Partial<Ticket>): Promise<void> {
  try {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, updates);
  } catch (error) {
    console.error('Error updating ticket in Firestore:', error);
  }
}

export function subscribeToTickets(callback: (tickets: Ticket[]) => void) {
  const col = collection(db, 'tickets');
  return onSnapshot(
    col,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as Ticket);
        callback(list);
      }
    },
    (err) => console.warn('Tickets listener notice:', err.message)
  );
}

// Payments Database Operations
export async function savePaymentToFirestore(payment: Payment): Promise<void> {
  try {
    const paymentRef = doc(db, 'payments', payment.id);
    await setDoc(paymentRef, payment, { merge: true });
  } catch (error) {
    console.error('Error saving payment to Firestore:', error);
  }
}

export function subscribeToPayments(callback: (payments: Payment[]) => void) {
  const col = collection(db, 'payments');
  return onSnapshot(
    col,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => d.data() as Payment);
        callback(list);
      }
    },
    (err) => console.warn('Payments listener notice:', err.message)
  );
}

// Notifications
export async function saveNotificationToFirestore(notif: NotificationItem): Promise<void> {
  try {
    const notifRef = doc(db, 'notifications', notif.id);
    await setDoc(notifRef, notif, { merge: true });
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
  }
}

export function subscribeToNotifications(userId: string, callback: (notifs: NotificationItem[]) => void) {
  const col = collection(db, 'notifications');
  return onSnapshot(
    col,
    (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs
          .map((d) => d.data() as NotificationItem)
          .filter((n) => n.userId === userId);
        callback(list);
      }
    },
    (err) => console.warn('Notifications listener notice:', err.message)
  );
}

// Auto-seed initial baseline database data if Firestore is currently empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const routesSnap = await getDocs(collection(db, 'routes'));
    if (routesSnap.empty) {
      console.log('Seeding initial routes, trips, and baseline database to Firestore...');
      const batch = writeBatch(db);

      // Seed Users
      INITIAL_USERS.forEach((u) => {
        batch.set(doc(db, 'users', u.id), u, { merge: true });
      });

      // Seed Routes
      INITIAL_ROUTES.forEach((r) => {
        batch.set(doc(db, 'routes', r.id), r, { merge: true });
      });

      // Seed Vehicles
      INITIAL_VEHICLES.forEach((v) => {
        batch.set(doc(db, 'vehicles', v.id), v, { merge: true });
      });

      // Seed Trips
      INITIAL_TRIPS.forEach((t) => {
        batch.set(doc(db, 'trips', t.id), t, { merge: true });
      });

      // Seed Bookings
      INITIAL_BOOKINGS.forEach((b) => {
        batch.set(doc(db, 'bookings', b.id), b, { merge: true });
      });

      // Seed Tickets
      INITIAL_TICKETS.forEach((tk) => {
        batch.set(doc(db, 'tickets', tk.id), tk, { merge: true });
      });

      // Seed Payments
      INITIAL_PAYMENTS.forEach((p) => {
        batch.set(doc(db, 'payments', p.id), p, { merge: true });
      });

      // Seed Notifications
      INITIAL_NOTIFICATIONS.forEach((n) => {
        batch.set(doc(db, 'notifications', n.id), n, { merge: true });
      });

      await batch.commit();
      console.log('Database initial seeding completed successfully.');
    }
  } catch (err) {
    console.warn('Seed database notice (may already exist or offline):', err);
  }
}
