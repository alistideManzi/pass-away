import express from 'express';
import { createServer as createViteServer } from 'vite';
import {
  getAllUsers,
  getUserByUid,
  upsertUser,
  getAllRoutes,
  createRoute,
  getAllVehicles,
  createVehicle,
  getAllTrips,
  createTrip,
  updateTrip,
  getAllBookings,
  createBookingRecord,
  updateBookingStatus,
  getAllTickets,
  createTicketRecord,
  boardTicketRecord,
  getAllPayments,
  createPaymentRecord,
  getAllNotifications,
  createNotificationRecord,
  markNotificationAsRead,
  seedDatabaseIfEmpty,
} from './src/db/queries.ts';
import { optionalAuth, requireAuth, AuthRequest } from './src/middleware/auth.ts';

const app = express();
const port = 3000;

app.use(express.json());

// Seed database on startup
seedDatabaseIfEmpty().catch((err) => {
  console.error('Failed to seed database:', err);
});

// Users
app.get('/api/users', async (_req, res) => {
  try {
    const usersList = await getAllUsers();
    res.json(usersList);
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await getUserByUid(req.params.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

app.post('/api/users', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userData = req.body;
    const savedUser = await upsertUser({
      ...userData,
      uid: userData.uid || req.user?.uid || userData.id,
    });
    res.json(savedUser);
  } catch (error: any) {
    console.error('Failed to save user:', error);
    res.status(500).json({ error: error.message || 'Failed to save user' });
  }
});

// Routes
app.get('/api/routes', async (_req, res) => {
  try {
    const routesList = await getAllRoutes();
    res.json(routesList);
  } catch (error: any) {
    console.error('Failed to fetch routes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch routes' });
  }
});

app.post('/api/routes', optionalAuth, async (req, res) => {
  try {
    const newRoute = await createRoute(req.body);
    res.json(newRoute);
  } catch (error: any) {
    console.error('Failed to create route:', error);
    res.status(500).json({ error: error.message || 'Failed to create route' });
  }
});

// Vehicles
app.get('/api/vehicles', async (_req, res) => {
  try {
    const vehiclesList = await getAllVehicles();
    res.json(vehiclesList);
  } catch (error: any) {
    console.error('Failed to fetch vehicles:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch vehicles' });
  }
});

app.post('/api/vehicles', optionalAuth, async (req, res) => {
  try {
    const newVehicle = await createVehicle(req.body);
    res.json(newVehicle);
  } catch (error: any) {
    console.error('Failed to create vehicle:', error);
    res.status(500).json({ error: error.message || 'Failed to create vehicle' });
  }
});

// Trips
app.get('/api/trips', async (_req, res) => {
  try {
    const tripsList = await getAllTrips();
    res.json(tripsList);
  } catch (error: any) {
    console.error('Failed to fetch trips:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch trips' });
  }
});

app.post('/api/trips', optionalAuth, async (req, res) => {
  try {
    const newTrip = await createTrip(req.body);
    res.json(newTrip);
  } catch (error: any) {
    console.error('Failed to create trip:', error);
    res.status(500).json({ error: error.message || 'Failed to create trip' });
  }
});

app.patch('/api/trips/:id', optionalAuth, async (req, res) => {
  try {
    const updated = await updateTrip(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    console.error('Failed to update trip:', error);
    res.status(500).json({ error: error.message || 'Failed to update trip' });
  }
});

// Bookings
app.get('/api/bookings', async (_req, res) => {
  try {
    const bookingsList = await getAllBookings();
    res.json(bookingsList);
  } catch (error: any) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', optionalAuth, async (req, res) => {
  try {
    const newBooking = await createBookingRecord(req.body);
    res.json(newBooking);
  } catch (error: any) {
    console.error('Failed to create booking:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

app.patch('/api/bookings/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const cancelled = await updateBookingStatus(req.params.id, 'CANCELLED');
    res.json(cancelled);
  } catch (error: any) {
    console.error('Failed to cancel booking:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel booking' });
  }
});

// Tickets
app.get('/api/tickets', async (_req, res) => {
  try {
    const ticketsList = await getAllTickets();
    res.json(ticketsList);
  } catch (error: any) {
    console.error('Failed to fetch tickets:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch tickets' });
  }
});

app.post('/api/tickets', optionalAuth, async (req, res) => {
  try {
    const newTicket = await createTicketRecord(req.body);
    res.json(newTicket);
  } catch (error: any) {
    console.error('Failed to create ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to create ticket' });
  }
});

app.post('/api/tickets/board', optionalAuth, async (req, res) => {
  try {
    const { ticketNumber, boardedBy } = req.body;
    const boarded = await boardTicketRecord(ticketNumber, boardedBy || 'Terminal Staff');
    if (!boarded) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(boarded);
  } catch (error: any) {
    console.error('Failed to board ticket:', error);
    res.status(500).json({ error: error.message || 'Failed to board ticket' });
  }
});

// Payments
app.get('/api/payments', async (_req, res) => {
  try {
    const paymentsList = await getAllPayments();
    res.json(paymentsList);
  } catch (error: any) {
    console.error('Failed to fetch payments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch payments' });
  }
});

app.post('/api/payments', optionalAuth, async (req, res) => {
  try {
    const newPayment = await createPaymentRecord(req.body);
    res.json(newPayment);
  } catch (error: any) {
    console.error('Failed to create payment:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment' });
  }
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const notificationsList = await getAllNotifications(userId);
    res.json(notificationsList);
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
  }
});

app.post('/api/notifications', optionalAuth, async (req, res) => {
  try {
    const newNotification = await createNotificationRecord(req.body);
    res.json(newNotification);
  } catch (error: any) {
    console.error('Failed to create notification:', error);
    res.status(500).json({ error: error.message || 'Failed to create notification' });
  }
});

app.patch('/api/notifications/:id/read', optionalAuth, async (req, res) => {
  try {
    const updated = await markNotificationAsRead(req.params.id);
    res.json(updated);
  } catch (error: any) {
    console.error('Failed to mark notification read:', error);
    res.status(500).json({ error: error.message || 'Failed to mark notification read' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
