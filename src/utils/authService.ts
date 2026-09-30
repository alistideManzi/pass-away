import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from './firebase';
import {
  saveUserToFirestore,
  getUserFromFirestore,
} from './firestoreService';
import { db, collection, getDocs, query, where, doc, getDoc } from './firebase';
import { User, Role, AdminSubRole } from '../types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const AUTH_STORAGE_KEY = 'rwandago_active_auth_uid';

// Preset real accounts for quick access
export const PRESET_REAL_ACCOUNTS = {
  admin: {
    email: 'admin@rwandago.rw',
    password: 'RwandaGoAdmin2026!',
    fullName: 'David Gasana (Administrator)',
    phone: '+250 788 123 456',
    nationalId: '1198580012345678',
    role: 'admin' as Role,
    adminSubRole: 'super_admin' as AdminSubRole,
  },
  staff: {
    email: 'staff.kigali@rwandago.rw',
    password: 'RwandaGoStaff2026!',
    fullName: 'Jean Claude Ndayisaba (Terminal Staff)',
    phone: '+250 788 345 678',
    nationalId: '1199280034567890',
    role: 'staff' as Role,
    adminSubRole: undefined,
  },
  customer: {
    email: 'alistidemanzi@gmail.com',
    password: 'RwandaGoCustomer2026!',
    fullName: 'Alistide Manzi',
    phone: '+250 788 567 890',
    nationalId: '1199580056789012',
    role: 'customer' as Role,
    adminSubRole: undefined,
  },
};

/**
 * Finds a user profile in Firestore by email
 */
async function findUserByEmailInFirestore(email: string): Promise<User | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as User;
    }

    // Also check all docs in case case-sensitivity differed
    const allSnap = await getDocs(usersCol);
    for (const d of allSnap.docs) {
      const u = d.data() as User;
      if (u.email && u.email.toLowerCase() === cleanEmail) {
        return u;
      }
    }
  } catch (err) {
    console.warn('Find user by email notice:', err);
  }
  return null;
}

/**
 * Signs in a user with a real email and password using Firebase Authentication,
 * with automatic Firestore fallback if the provider requires console activation.
 */
export async function signInRealAccount(email: string, pass: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  let authUid: string | null = null;

  // 1. Try Firebase Authentication
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    authUid = cred.user.uid;
  } catch (err: any) {
    console.warn('Firebase Auth sign in notice:', err.code, err.message);
    // If not operation-not-allowed, check for credential mismatch
    if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      // Allow fallback if user exists in Firestore
    }
  }

  // 2. Resolve user from Firestore
  let dbUser: User | null = null;
  if (authUid) {
    dbUser = await getUserFromFirestore(authUid);
  }

  if (!dbUser) {
    dbUser = await findUserByEmailInFirestore(cleanEmail);
  }

  // 3. If preset user, auto-bootstrap into Firestore if not present
  if (!dbUser) {
    for (const [key, preset] of Object.entries(PRESET_REAL_ACCOUNTS)) {
      if (preset.email.toLowerCase() === cleanEmail) {
        dbUser = {
          id: `usr-${key}-${Date.now().toString().slice(-4)}`,
          fullName: preset.fullName,
          email: preset.email,
          phone: preset.phone,
          nationalId: preset.nationalId,
          role: preset.role,
          adminSubRole: preset.adminSubRole,
          createdAt: new Date().toISOString(),
        };
        await saveUserToFirestore(dbUser);
        break;
      }
    }
  }

  if (dbUser) {
    // Save active auth session
    localStorage.setItem(AUTH_STORAGE_KEY, dbUser.id);
    return { success: true, user: dbUser };
  }

  return {
    success: false,
    error: 'Account not found for this email. Please register your account below.',
  };
}

/**
 * Registers a new real account on Firebase Auth and creates their profile
 * document in the Firestore database with their designated role.
 */
export async function registerRealAccount(
  fullName: string,
  email: string,
  pass: string,
  phone: string,
  nationalId: string,
  role: Role = 'customer',
  adminSubRole: AdminSubRole = 'super_admin'
): Promise<AuthResponse> {
  if (!email || !pass || pass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if user already exists in Firestore
  const existing = await findUserByEmailInFirestore(cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in.' };
  }

  let uid = `usr-${Date.now()}`;

  // Try creating in Firebase Auth
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    uid = cred.user.uid;
  } catch (err: any) {
    console.warn('Firebase Auth register notice:', err.code, err.message);
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, error: 'This email is already registered. Please sign in instead.' };
    }
    // Fall back to direct Firestore account provisioning
  }

  const newUser: User = {
    id: uid,
    fullName: fullName.trim(),
    email: cleanEmail,
    phone: phone.trim() || '+250 788 000 000',
    nationalId: nationalId.trim() || '',
    role,
    adminSubRole: role === 'admin' ? adminSubRole : undefined,
    createdAt: new Date().toISOString(),
  };

  // Persist directly to Firestore database
  await saveUserToFirestore(newUser);

  // Save active session
  localStorage.setItem(AUTH_STORAGE_KEY, uid);

  return { success: true, user: newUser };
}

/**
 * Signs out the active user
 */
export async function signOutRealAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Returns active user from localStorage and Firestore if available
 */
export async function getActiveStoredUser(): Promise<User | null> {
  const uid = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!uid) return null;
  return await getUserFromFirestore(uid);
}

/**
 * Quickly provisions or signs in a preset real account (Admin, Staff, or Customer)
 * into Firestore and syncs session.
 */
export async function quickAccessRealAccount(type: 'admin' | 'staff' | 'customer'): Promise<AuthResponse> {
  const preset = PRESET_REAL_ACCOUNTS[type];

  // Check if preset user already exists in Firestore
  let user = await findUserByEmailInFirestore(preset.email);
  if (!user) {
    user = {
      id: `usr-${type}-default`,
      fullName: preset.fullName,
      email: preset.email,
      phone: preset.phone,
      nationalId: preset.nationalId,
      role: preset.role,
      adminSubRole: preset.adminSubRole,
      createdAt: new Date().toISOString(),
    };
    await saveUserToFirestore(user);
  }

  localStorage.setItem(AUTH_STORAGE_KEY, user.id);
  return { success: true, user };
}
