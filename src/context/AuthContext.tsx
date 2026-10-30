import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

const ADMIN_BOOTSTRAP_EMAILS = [
  'nagamanaswireddy@gmail.com',
  'admin@civicconnect.telangana.gov.in',
];

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  registerCitizenWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signInAsDemoCitizen: () => void;
  signInAsDemoAdmin: () => void;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  signInWithGoogle: async () => {},
  registerCitizenWithEmail: async () => {},
  loginWithEmail: async () => {},
  signInAsDemoCitizen: () => {},
  signInAsDemoAdmin: () => {},
  signOutUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Check local session for instant demo mode
    const cached = localStorage.getItem('civicconnect_demo_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile when auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          const email = firebaseUser.email?.toLowerCase() || '';
          const isDesignatedAdmin = ADMIN_BOOTSTRAP_EMAILS.includes(email);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const resolvedRole: UserRole = isDesignatedAdmin ? 'admin' : (data.role || 'citizen');
            setUserProfile({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Citizen',
              email: firebaseUser.email || '',
              role: resolvedRole,
              phone: data.phone || '',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          } else {
            // New user registration
            const newRole: UserRole = isDesignatedAdmin ? 'admin' : 'citizen';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Citizen',
              email: firebaseUser.email || '',
              role: newRole,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);

            if (isDesignatedAdmin) {
              await setDoc(doc(db, 'admins', firebaseUser.uid), {
                email: firebaseUser.email,
                role: 'admin',
                addedAt: new Date().toISOString(),
              });
            }

            setUserProfile(newProfile);
          }
        } catch (error) {
          console.warn('Could not read user profile from Firestore, using auth fallback:', error);
          const isDesignatedAdmin = ADMIN_BOOTSTRAP_EMAILS.includes(firebaseUser.email?.toLowerCase() || '');
          setUserProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Citizen',
            email: firebaseUser.email || '',
            role: isDesignatedAdmin ? 'admin' : 'citizen',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // If not logged in via Firebase Auth, check demo profile
        const cached = localStorage.getItem('civicconnect_demo_user');
        if (cached) {
          try {
            setUserProfile(JSON.parse(cached));
          } catch {
            setUserProfile(null);
          }
        } else {
          // Default initial citizen persona for immediate testing
          const defaultCitizen: UserProfile = {
            uid: 'demo-citizen-1',
            name: 'K. Venkatesh',
            email: 'venkatesh.k@example.com',
            role: 'citizen',
            createdAt: '2026-10-20T08:00:00Z',
          };
          setUserProfile(defaultCitizen);
          localStorage.setItem('civicconnect_demo_user', JSON.stringify(defaultCitizen));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      localStorage.removeItem('civicconnect_demo_user');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const registerCitizenWithEmail = async (
    name: string,
    email: string,
    pass: string,
    phone?: string
  ) => {
    localStorage.removeItem('civicconnect_demo_user');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      const emailLower = email.toLowerCase();
      const isDesignatedAdmin = ADMIN_BOOTSTRAP_EMAILS.includes(emailLower);
      const newRole: UserRole = isDesignatedAdmin ? 'admin' : 'citizen';

      const newProfile: UserProfile = {
        uid: res.user.uid,
        name,
        email,
        phone: phone || '',
        role: newRole,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', res.user.uid), newProfile);
      } catch (e) {
        console.warn('Could not save user profile to Firestore:', e);
      }

      setUserProfile(newProfile);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    localStorage.removeItem('civicconnect_demo_user');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signInAsDemoCitizen = () => {
    const citizen: UserProfile = {
      uid: 'demo-citizen-1',
      name: 'K. Venkatesh',
      email: 'venkatesh.k@example.com',
      role: 'citizen',
      createdAt: '2026-10-20T08:00:00Z',
    };
    setUserProfile(citizen);
    localStorage.setItem('civicconnect_demo_user', JSON.stringify(citizen));
  };

  const signInAsDemoAdmin = () => {
    const admin: UserProfile = {
      uid: 'demo-admin-1',
      name: 'N. Reddy (Chief Vigilance Officer)',
      email: 'nagamanaswireddy@gmail.com',
      role: 'admin',
      createdAt: '2026-10-01T08:00:00Z',
    };
    setUserProfile(admin);
    localStorage.setItem('civicconnect_demo_user', JSON.stringify(admin));
  };

  const signOutUser = async () => {
    localStorage.removeItem('civicconnect_demo_user');
    await signOut(auth).catch(() => {});
    setUserProfile(null);
    setCurrentUser(null);
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        registerCitizenWithEmail,
        loginWithEmail,
        signInAsDemoCitizen,
        signInAsDemoAdmin,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
