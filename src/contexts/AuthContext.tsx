import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const ADMIN_EMAIL = 'benjaminnshimiye633@gmail.com';

export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export interface AppUserProfile {
  email: string | null;
  role: UserRole;
  branchId: string | null;
  staffName: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: AppUserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isBranchOperator: boolean;
  signUp: (email: string, pass: string) => Promise<User>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getFallbackRole(email: string | null | undefined): UserRole {
  if (email === ADMIN_EMAIL) return 'admin';
  return 'customer';
}

function normalizeProfile(user: User, data?: Record<string, any> | null): AppUserProfile {
  const fallbackRole = getFallbackRole(user.email);
  const role = (data?.role as UserRole | undefined) || fallbackRole;
  return {
    email: user.email,
    role,
    branchId: data?.branchId || null,
    staffName: data?.staffName || user.displayName || user.email?.split('@')[0] || null,
  };
}

async function ensureUserProfile(user: User, existingData?: Record<string, any> | null) {
  const role = (existingData?.role as UserRole | undefined) || getFallbackRole(user.email);
  const payload = {
    email: user.email,
    role,
    branchId: existingData?.branchId || null,
    staffName: existingData?.staffName || user.displayName || user.email?.split('@')[0] || null,
    updatedAt: serverTimestamp(),
  };

  if (!existingData) {
    await setDoc(doc(db, 'users', user.uid), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    return;
  }

  if (!existingData.role || existingData.email !== user.email) {
    await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const data = userSnap.exists() ? userSnap.data() : null;
        await ensureUserProfile(user, data);
        setUserProfile(normalizeProfile(user, data));
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setUserProfile(normalizeProfile(user, null));
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      role: getFallbackRole(user.email),
      branchId: null,
      staffName: user.displayName || user.email?.split('@')[0] || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.exists() ? userSnap.data() : null;
    await ensureUserProfile(user, data);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const role = userProfile?.role || (currentUser ? getFallbackRole(currentUser.email) : 'customer');
  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || isAdmin;
  const isStaff = role === 'staff';
  const isBranchOperator = isManager || isStaff;

  const value = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    isManager,
    isStaff,
    isBranchOperator,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
