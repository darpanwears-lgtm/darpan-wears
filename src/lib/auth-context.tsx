'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, Auth } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';


interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  isAuthLoading: boolean;
  user: any;
}

const AuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@darpan.wears';
const ADMIN_PASSWORD = 'darpan2025';

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
      if (!isFirebaseUserLoading) {
        if (user && user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setIsAuthLoading(false);
      }
    };
    checkAdmin();
  }, [user, isFirebaseUserLoading]);

  const login = (password: string): boolean => {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }
    
    setIsAuthLoading(true);
    signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
      .then(async (userCredential) => {
        // This will trigger the useEffect to set isAdmin
        if (firestore) {
           const adminRoleRef = doc(firestore, 'roles_admin', userCredential.user.uid);
           await setDoc(adminRoleRef, { isAdmin: true });
        }
        router.push('/admin');
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          // Create the admin user if it doesn't exist
          createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
            .then(async (userCredential) => {
               if (firestore) {
                const adminRoleRef = doc(firestore, 'roles_admin', userCredential.user.uid);
                await setDoc(adminRoleRef, { isAdmin: true });
              }
              router.push('/admin');
            })
            .catch((creationError) => {
              console.error("Admin user creation failed:", creationError);
              setIsAuthLoading(false);
            });
        } else {
          console.error("Admin login failed:", error);
          setIsAuthLoading(false);
        }
      });

    return true; // Indicate that the password was correct and login process started
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
