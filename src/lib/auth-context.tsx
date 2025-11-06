'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { setDoc, doc, getDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isAuthLoading: boolean;
  user: any;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@darpan.wears';
const ADMIN_PASSWORD = 'darpan2011';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading: isFirebaseUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      setIsAuthLoading(isFirebaseUserLoading);
      if (isFirebaseUserLoading) {
        return;
      }
      
      if (user && user.email === ADMIN_EMAIL && firestore) {
          const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
          const docSnap = await getDoc(adminRoleRef);
          setIsAdmin(docSnap.exists());
      } else {
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    };
    checkAdmin();
  }, [user, isFirebaseUserLoading, firestore]);

  const login = async (password: string): Promise<boolean> => {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    setIsAuthLoading(true);
    try {
      // Try to sign in with the correct credentials
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    } catch (error: any) {
      // If login fails (e.g., user not found or wrong password from a previous setup)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          // Try to create the user. If it already exists, this will fail.
          await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        } catch (creationError: any) {
          if (creationError.code !== 'auth/email-already-in-use') {
            // If it's any error other than 'email-already-in-use', something is wrong.
            console.error("Admin user creation failed:", creationError);
            setIsAuthLoading(false);
            return false;
          }
          // If email is in use, it implies we just need to sign in, which we already tried.
          // This can happen if the password on the backend is different.
          // For this app's logic, we assume the provided ADMIN_PASSWORD is the source of truth.
          // A more robust solution for a real app would be to update the password, but creating a fresh user is simpler.
           console.error("Admin login failed, password might be out of sync:", error);
           setIsAuthLoading(false);
           return false;
        }
      } else {
         console.error("An unexpected error occurred during login:", error);
         setIsAuthLoading(false);
         return false;
      }
    }

    // After successful sign-in or creation, get the current user
    const currentUser = auth.currentUser;
    if (currentUser && firestore) {
        const adminRoleRef = doc(firestore, 'roles_admin', currentUser.uid);
        // Ensure the admin role document exists
        await setDoc(adminRoleRef, { isAdmin: true });
        setIsAdmin(true);
        router.push('/admin');
    } else {
        // This case should ideally not be reached
        setIsAuthLoading(false);
        return false;
    }
    
    setIsAuthLoading(false);
    return true;
  };


  const logout = () => {
    signOut(auth).then(() => {
        setIsAdmin(false);
        if (pathname.startsWith('/admin')) {
            router.push('/login');
        }
    });
  };

  const value = { isAdmin, login, logout, isAuthLoading, user };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
