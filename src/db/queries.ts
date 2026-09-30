import { db } from './index.ts';
import {
  users,
  routes,
  vehicles,
  trips,
  bookings,
  tickets,
  payments,
  notifications,
} from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Two-layer error handling: Wrap and sanitize error in query layer
export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database query failed for users:', error);
    throw new Error('Failed to retrieve users', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const res = await db.select().from(users).where(eq(users.uid, uid));
    return res[0] || null;
  } catch (error) {
    console.error('Database query failed for user by uid:', error);
    throw new Error('Failed to retrieve user', { cause: error });
  }
}

export async function upsertUser(userData: {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role?: string;
  adminSubRole?: string;
  nationalId?: string;
  avatarUrl?: string;
}) {
  try {
    const res = await db
      .insert(users)
      .values({
        id: userData.id,
        uid: userData.uid,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone || '',
        role: userData.role || 'customer',
        adminSubRole: userData.adminSubRole || null,
        nationalId: userData.nationalId || null,
        avatarUrl: userData.avatarUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: userData.email,
          fullName: userData.fullName,
          phone: userData.phone || '',
          role: userData.role || 'customer',
          adminSubRole: userData.adminSubRole || null,
          nationalId: userData.nationalId || null,
          avatarUrl: userData.avatarUrl || null,
        },
      })
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database upsert failed for user:', error);
    throw new Error('Failed to save user', { cause: error });
  }
}

// Routes
export async function getAllRoutes() {
  try {
    return await db.select().from(routes);
  } catch (error) {
    console.error('Database query failed for routes:', error);
    throw new Error('Failed to retrieve routes', { cause: error });
  }
}

export async function createRoute(routeData: any) {
  try {
    const res = await db.insert(routes).values(routeData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for route:', error);
    throw new Error('Failed to create route', { cause: error });
  }
}

// Vehicles
export async function getAllVehicles() {
  try {
    return await db.select().from(vehicles);
  } catch (error) {
    console.error('Database query failed for vehicles:', error);
    throw new Error('Failed to retrieve vehicles', { cause: error });
  }
}

export async function createVehicle(vehicleData: any) {
  try {
    const res = await db.insert(vehicles).values(vehicleData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for vehicle:', error);
    throw new Error('Failed to create vehicle', { cause: error });
  }
}

// Trips
export async function getAllTrips() {
  try {
    return await db.select().from(trips);
  } catch (error) {
    console.error('Database query failed for trips:', error);
    throw new Error('Failed to retrieve trips', { cause: error });
  }
}

export async function createTrip(tripData: any) {
  try {
    const res = await db.insert(trips).values(tripData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for trip:', error);
    throw new Error('Failed to create trip', { cause: error });
  }
}

export async function updateTrip(tripId: string, updates: any) {
  try {
    const res = await db
      .update(trips)
      .set(updates)
      .where(eq(trips.id, tripId))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database update failed for trip:', error);
    throw new Error('Failed to update trip', { cause: error });
  }
}

// Bookings
export async function getAllBookings() {
  try {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  } catch (error) {
    console.error('Database query failed for bookings:', error);
    throw new Error('Failed to retrieve bookings', { cause: error });
  }
}

export async function createBookingRecord(bookingData: any) {
  try {
    const res = await db.insert(bookings).values(bookingData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for booking:', error);
    throw new Error('Failed to create booking', { cause: error });
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const res = await db
      .update(bookings)
      .set({ bookingStatus: status })
      .where(eq(bookings.id, bookingId))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database update failed for booking:', error);
    throw new Error('Failed to update booking status', { cause: error });
  }
}

// Tickets
export async function getAllTickets() {
  try {
    return await db.select().from(tickets).orderBy(desc(tickets.issuedAt));
  } catch (error) {
    console.error('Database query failed for tickets:', error);
    throw new Error('Failed to retrieve tickets', { cause: error });
  }
}

export async function createTicketRecord(ticketData: any) {
  try {
    const res = await db.insert(tickets).values(ticketData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for ticket:', error);
    throw new Error('Failed to create ticket', { cause: error });
  }
}

export async function boardTicketRecord(ticketNumber: string, boardedBy: string) {
  try {
    const existing = await db
      .select()
      .from(tickets)
      .where(eq(tickets.ticketNumber, ticketNumber));
    if (!existing.length) {
      return null;
    }
    const res = await db
      .update(tickets)
      .set({
        ticketStatus: 'BOARDED',
        boardedAt: new Date().toISOString(),
        boardedBy,
      })
      .where(eq(tickets.ticketNumber, ticketNumber))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database update failed for boarding ticket:', error);
    throw new Error('Failed to board ticket', { cause: error });
  }
}

// Payments
export async function getAllPayments() {
  try {
    return await db.select().from(payments).orderBy(desc(payments.paidAt));
  } catch (error) {
    console.error('Database query failed for payments:', error);
    throw new Error('Failed to retrieve payments', { cause: error });
  }
}

export async function createPaymentRecord(paymentData: any) {
  try {
    const res = await db.insert(payments).values(paymentData).returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for payment:', error);
    throw new Error('Failed to create payment', { cause: error });
  }
}

// Notifications
export async function getAllNotifications(userId?: string) {
  try {
    if (userId) {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
    }
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.error('Database query failed for notifications:', error);
    throw new Error('Failed to retrieve notifications', { cause: error });
  }
}

export async function createNotificationRecord(notificationData: any) {
  try {
    const res = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database insert failed for notification:', error);
    throw new Error('Failed to create notification', { cause: error });
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const res = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return res[0];
  } catch (error) {
    console.error('Database update failed for notification:', error);
    throw new Error('Failed to mark notification read', { cause: error });
  }
}

// Seeding helper
export async function seedDatabaseIfEmpty() {
  try {
    const existingRoutes = await db.select().from(routes);
    if (existingRoutes.length > 0) {
      return;
    }

    console.log('Seeding initial Cloud SQL relational data...');

    // Seed initial routes
    await db.insert(routes).values([
      {
        id: 'route-kgl-krg',
        origin: 'Kigali',
        destination: 'Karongi',
        distanceKm: 135,
        estimatedDuration: '3h 30m',
        popular: true,
        description: 'Scenic journey through the lush hills of Western Province down to Lake Kivu.',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'route-kgl-hye',
        origin: 'Kigali',
        destination: 'Huye',
        distanceKm: 132,
        estimatedDuration: '2h 45m',
        popular: true,
        description: 'Direct express to the intellectual capital, home to the Ethnographic Museum.',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'route-kgl-msz',
        origin: 'Kigali',
        destination: 'Musanze',
        distanceKm: 95,
        estimatedDuration: '2h 00m',
        popular: true,
        description: 'Gateway to the majestic Virunga volcanoes and world-famous mountain gorillas.',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'route-kgl-rbr',
        origin: 'Kigali',
        destination: 'Rubavu',
        distanceKm: 155,
        estimatedDuration: '3h 45m',
        popular: true,
        description: 'Fast express connection to the shores of Lake Kivu and the Gisenyi border.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'route-kgl-ngm',
        origin: 'Kigali',
        destination: 'Ngoma',
        distanceKm: 102,
        estimatedDuration: '2h 15m',
        popular: false,
        description: 'Eastern province express servicing Kibungo and surrounding agricultural hubs.',
        imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'route-kgl-rsz',
        origin: 'Kigali',
        destination: 'Rusizi',
        distanceKm: 245,
        estimatedDuration: '5h 30m',
        popular: false,
        description: 'Trans-Nyungwe forest highway connecting Kigali to the southern Lake Kivu basin.',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      },
    ]);

    // Seed vehicles
    await db.insert(vehicles).values([
      {
        id: 'veh-01',
        vehicleNumber: 'RG-101',
        registrationNumber: 'RAD 234 K',
        vehicleType: 'Toyota Coaster',
        capacity: 30,
        status: 'active',
        amenities: ['Free WiFi', 'AC', 'USB Charging', 'Speed Governor (60km/h)'],
      },
      {
        id: 'veh-02',
        vehicleNumber: 'RG-102',
        registrationNumber: 'RAE 558 B',
        vehicleType: 'Yutong Coach',
        capacity: 45,
        status: 'active',
        amenities: ['Free WiFi', 'AC', 'USB Charging', 'Reclining Seats', 'Luggage Compartment'],
      },
      {
        id: 'veh-03',
        vehicleNumber: 'RG-103',
        registrationNumber: 'RAC 912 P',
        vehicleType: 'Scania Cruiser',
        capacity: 50,
        status: 'active',
        amenities: ['High-speed 4G WiFi', 'Climate Control AC', 'USB Ports', 'Panoramic Windows'],
      },
      {
        id: 'veh-04',
        vehicleNumber: 'RG-104',
        registrationNumber: 'RAF 114 Z',
        vehicleType: 'Minibus VIP',
        capacity: 18,
        status: 'active',
        amenities: ['Leather Seats', 'Free Water', 'Fast WiFi', 'Direct Express'],
      },
    ]);

    // Seed trips
    const today = new Date().toISOString().split('T')[0];
    await db.insert(trips).values([
      {
        id: 'trip-01',
        routeId: 'route-kgl-krg',
        origin: 'Kigali (Nyabugogo)',
        destination: 'Karongi (Centre)',
        vehicleId: 'veh-01',
        vehicleReg: 'RAD 234 K',
        vehicleType: 'Toyota Coaster',
        operatorName: 'RwandaGo Express',
        departureDate: today,
        departureTime: '07:00',
        arrivalTime: '10:30',
        priceRwf: 3800,
        totalSeats: 30,
        bookedSeats: ['1A', '1B', '3C'],
        reservedSeats: [],
        status: 'SCHEDULED',
        amenities: ['Free WiFi', 'AC', 'USB Charging'],
      },
      {
        id: 'trip-02',
        routeId: 'route-kgl-hye',
        origin: 'Kigali (Nyabugogo)',
        destination: 'Huye (Gare Routiere)',
        vehicleId: 'veh-02',
        vehicleReg: 'RAE 558 B',
        vehicleType: 'Yutong Coach',
        operatorName: 'Horizon Express Ltd',
        departureDate: today,
        departureTime: '08:30',
        arrivalTime: '11:15',
        priceRwf: 3200,
        totalSeats: 45,
        bookedSeats: ['2A', '4B'],
        reservedSeats: [],
        status: 'SCHEDULED',
        amenities: ['Free WiFi', 'AC', 'USB Charging', 'Reclining Seats'],
      },
      {
        id: 'trip-03',
        routeId: 'route-kgl-msz',
        origin: 'Kigali (Nyabugogo)',
        destination: 'Musanze (Modern Park)',
        vehicleId: 'veh-04',
        vehicleReg: 'RAF 114 Z',
        vehicleType: 'Minibus VIP',
        operatorName: 'Volcano Express Express',
        departureDate: today,
        departureTime: '09:00',
        arrivalTime: '11:00',
        priceRwf: 2700,
        totalSeats: 18,
        bookedSeats: ['1A', '2B', '3A'],
        reservedSeats: [],
        status: 'SCHEDULED',
        amenities: ['Leather Seats', 'Free Water', 'Fast WiFi'],
      },
      {
        id: 'trip-04',
        routeId: 'route-kgl-rbr',
        origin: 'Kigali (Nyabugogo)',
        destination: 'Rubavu (Gisenyi Border)',
        vehicleId: 'veh-03',
        vehicleReg: 'RAC 912 P',
        vehicleType: 'Scania Cruiser',
        operatorName: 'Stella Express VIP',
        departureDate: today,
        departureTime: '11:00',
        arrivalTime: '14:45',
        priceRwf: 4500,
        totalSeats: 50,
        bookedSeats: ['1A', '1B', '2A', '2B'],
        reservedSeats: [],
        status: 'SCHEDULED',
        amenities: ['High-speed 4G WiFi', 'Climate Control AC', 'USB Ports'],
      },
    ]);

    // Seed default admin and staff users
    await db.insert(users).values([
      {
        id: 'usr-admin-1',
        uid: 'admin-seed-uid',
        email: 'diane.uwera@rwandago.rw',
        fullName: 'Diane Uwera',
        phone: '+250 788 999 888',
        role: 'admin',
        adminSubRole: 'super_admin',
        nationalId: '1198580045612345',
      },
      {
        id: 'usr-staff-1',
        uid: 'staff-seed-uid',
        email: 'j.bosco@rwandago.rw',
        fullName: 'Jean Bosco Nshimiyimana',
        phone: '+250 788 654 321',
        role: 'staff',
        nationalId: '1199080078912345',
      },
      {
        id: 'usr-customer-1',
        uid: 'customer-seed-uid',
        email: 'alistidemanzi@gmail.com',
        fullName: 'Alistide Manzi',
        phone: '+250 788 123 456',
        role: 'customer',
        nationalId: '1199880012345678',
      },
    ]);

    console.log('Seeding Cloud SQL relational data completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}
