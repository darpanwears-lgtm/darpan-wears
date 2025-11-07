'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isAuthLoading: boolean;
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
    const checkAdminStatus = async () => {
      if (isFirebaseUserLoading) {
        setIsAuthLoading(true);
        return;
      }
      
      if (user && user.email === ADMIN_EMAIL && firestore) {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        try {
          const docSnap = await getDoc(adminRoleRef);
          setIsAdmin(docSnap.exists());
        } catch (e) {
          console.error("Error checking admin status:", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    };

    checkAdminStatus();
  }, [user, isFirebaseUserLoading, firestore]);

  const login = async (password: string): Promise<boolean> => {
     if (password !== ADMIN_PASSWORD) {
        return false;
    }
    setIsAuthLoading(true);
    
    try {
        await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                // User doesn't exist or password was wrong, try creating the user.
                // This handles the first-time login or a password reset scenario.
                const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, password);
                const newUser = userCredential.user;
                if (newUser && firestore) {
                    const adminRoleRef = doc(firestore, 'roles_admin', newUser.uid);
                    await setDoc(adminRoleRef, { isAdmin: true });
                }
            } catch (creationError: any) {
                 if (creationError.code !== 'auth/email-already-in-use') {
                    console.error("Failed to create admin user:", creationError);
                    setIsAuthLoading(false);
                    return false;
                }
                // If it already exists, it means the password on Firebase is different.
                // Since we couldn't sign in, the provided password is wrong.
                // This path is now effectively an "incorrect password" path after attempting creation.
                setIsAuthLoading(false);
                return false;
            }
        } else {
            console.error("Admin login failed with unexpected error:", error);
            setIsAuthLoading(false);
            return false;
        }
    }

    // This part runs after a successful sign-in or creation.
    const currentUser = auth.currentUser;
    if (currentUser && firestore) {
        // Ensure the admin role exists on every successful login.
        const adminRoleRef = doc(firestore, 'roles_admin', currentUser.uid);
        await setDoc(adminRoleRef, { isAdmin: true }, { merge: true });
        setIsAdmin(true);
        router.push('/admin');
    } else {
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
            router.push('/');
        }
    });
  };

  const value = { isAdmin, login, logout, isAuthLoading };

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
