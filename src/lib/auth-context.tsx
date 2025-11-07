'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth as useFirebaseAuth, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup
} from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from './types';


interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: () => Promise<boolean>;
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
        if (error.code === 'auth/user-not-found') {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, password);
                const newUser = userCredential.user;
                if (newUser && firestore) {
                    const adminRoleRef = doc(firestore, 'roles_admin', newUser.uid);
                    await setDoc(adminRoleRef, { isAdmin: true });
                }
            } catch (creationError) {
                console.error("Failed to create admin user:", creationError);
                setIsAuthLoading(false);
                return false;
            }
        } else {
            console.error("Admin login failed:", error);
            setIsAuthLoading(false);
            return false;
        }
    }

    const currentUser = auth.currentUser;
    if (currentUser && firestore) {
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

  const signInWithGoogle = async (): Promise<boolean> => {
    if (!auth || !firestore) return false;
    setIsAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const gUser = result.user;
        const userProfileRef = doc(firestore, 'users', gUser.uid);

        // Check if the user document already exists
        const docSnap = await getDoc(userProfileRef);

        let profileData: UserProfile;

        if (docSnap.exists()) {
            // User exists, merge new data with existing data
            const existingData = docSnap.data() as UserProfile;
            profileData = {
                ...existingData,
                name: gUser.displayName || existingData.name || 'New User',
                email: gUser.email || existingData.email,
                photoURL: gUser.photoURL || existingData.photoURL || '',
                uid: gUser.uid,
            };
        } else {
            // New user, create a new profile
            profileData = {
                uid: gUser.uid,
                name: gUser.displayName || 'New User',
                email: gUser.email || '',
                photoURL: gUser.photoURL || '',
            };
        }

        // Use a non-blocking write with proper error handling
        setDoc(userProfileRef, profileData, { merge: true }).catch(
            (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userProfileRef.path,
                    operation: 'write',
                    requestResourceData: profileData,
                });
                // This will emit the error to be caught by the listener
                // without blocking the sign-in flow.
                errorEmitter.emit('permission-error', permissionError);
                // Even if the write fails, we can consider login successful
                // as auth itself succeeded. The listener will handle the error.
            }
        );

        setIsAuthLoading(false);
        return true; // Return true because authentication was successful

    } catch (error) {
        console.error('Google sign-in failed:', error);
        setIsAuthLoading(false);
        return false;
    }
  };


  const logout = () => {
    signOut(auth).then(() => {
        setIsAdmin(false);
        if (pathname.startsWith('/admin')) {
            router.push('/');
        }
    });
  };

  const value = { isAdmin, login, logout, isAuthLoading, signInWithGoogle };

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
