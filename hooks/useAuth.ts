import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ─── Types ─────────────────────────────────────────

export interface AuthError {
  field: 'email' | 'password' | 'name' | 'general';
  message: string;
}

// ─── Firebase error → human message ──────────────

const parseFirebaseError = (code: string): AuthError => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return { field: 'email', message: 'No account found with this email.' };
    case 'auth/wrong-password':
      return { field: 'password', message: 'Incorrect password.' };
    case 'auth/email-already-in-use':
      return { field: 'email', message: 'This email is already registered.' };
    case 'auth/invalid-email':
      return { field: 'email', message: 'Please enter a valid email address.' };
    case 'auth/weak-password':
      return { field: 'password', message: 'Password must be at least 6 characters.' };
    case 'auth/too-many-requests':
      return { field: 'general', message: 'Too many attempts. Try again later.' };
    case 'auth/network-request-failed':
      return { field: 'general', message: 'No internet connection.' };
    default:
      return { field: 'general', message: 'Something went wrong.' };
  }
};

// ─── Validation ───────────────────────────────────

export const validateSignup = (
  name: string,
  email: string,
  password: string
): AuthError | null => {
  if (!name.trim() || name.trim().length < 2)
    return { field: 'name', message: 'Please enter your full name.' };

  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { field: 'email', message: 'Please enter a valid email address.' };

  if (!password || password.length < 6)
    return { field: 'password', message: 'Password must be at least 6 characters.' };

  return null;
};

export const validateLogin = (
  email: string,
  password: string
): AuthError | null => {
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { field: 'email', message: 'Please enter a valid email address.' };

  if (!password)
    return { field: 'password', message: 'Please enter your password.' };

  return null;
};

// ─── Hook ─────────────────────────────────────────

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Restore session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Sign Up ─────────────────────────────────────

  const signUp = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    const validationError = validateSignup(name, email, password);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(credential.user, {
        displayName: name.trim(),
      });

      // 🔥 THIS WAS YOUR BROKEN PART — NOW FIXED
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        grade: null,
        school: null,
        streakDays: 0,
        totalPoints: 0,
      });

      setUser(credential.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Login ───────────────────────────────────────

  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setUser(credential.user);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(parseFirebaseError(err.code));
      setLoading(false);
      return false;
    }
  };

  // ── Logout ──────────────────────────────────────

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const clearError = () => {
  setError(null);
};

  return {
    user,
    loading,
    authLoading,
    error,
    signUp,
    login,
    logout,
    setError,
    clearError
  };
};