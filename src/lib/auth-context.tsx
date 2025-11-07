'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth as useFirebaseAuth, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
} from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from './types';


interface AdminAuthContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  emailLogin: (email: string, pass: string) => Promise<boolean>;
  emailSignUp: (email: string, pass: string, name: string, phone: string) => Promise<boolean>;
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
  
  const emailLogin = async (email: string, pass: string): Promise<boolean> => {
    if (!auth) return false;
    setIsAuthLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        setIsAuthLoading(false);
        return true;
    } catch (error) {
        console.error("Email login failed:", error);
        setIsAuthLoading(false);
        return false;
    }
  };
  
  const emailSignUp = async (email: string, pass: string, name: string, phone: string): Promise<boolean> => {
    if (!auth || !firestore) return false;
    setIsAuthLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        const profileData: UserProfile = {
            uid: newUser.uid,
            name: name,
            email: newUser.email || '',
            phone: phone,
        };
        
        const userProfileRef = doc(firestore, 'users', newUser.uid);

        setDoc(userProfileRef, profileData).catch(
            (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userProfileRef.path,
                    operation: 'create',
                    requestResourceData: profileData,
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );
        
        setIsAuthLoading(false);
        return true;

    } catch (error) {
        console.error('Email sign-up failed:', error);
        setIsAuthLoading(false);
        return false;
    }
  }


  const logout = () => {
    signOut(auth).then(() => {
        setIsAdmin(false);
        if (pathname.startsWith('/admin')) {
            router.push('/');
        }
    });
  };

  const value = { isAdmin, login, logout, isAuthLoading, emailLogin, emailSignUp };

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
