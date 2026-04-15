"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface LocalUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: string;
}

interface AuthContextType {
    user: LocalUser | null;
    firebaseUser: User | null;
    loading: boolean;
    loginWithGoogle: (requestedRole?: string) => Promise<void>;
    loginWithEmail: (email: string, password: string, requestedRole?: string) => Promise<void>;
    signupWithEmail: (email: string, password: string, name: string, requestedRole?: string) => Promise<void>;
    logout: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    loading: true,
    loginWithGoogle: async (requestedRole?: string) => { },
    loginWithEmail: async (email: string, password: string, requestedRole?: string) => { },
    signupWithEmail: async (email: string, password: string, name: string, requestedRole?: string) => { },
    logout: async () => { },
    getIdToken: async () => null,
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function syncUserToBackend(firebaseUser: User, requestedRole?: string): Promise<LocalUser | null> {
    try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch(`${API_URL}/api/auth/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestedRole ? { role: requestedRole } : {}),
        });
        if (res.ok) {
            const data = await res.json();
            const localUser: LocalUser = {
                id: data.id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                role: data.role,
            };
            if (typeof window !== 'undefined') {
                localStorage.setItem('localgift_user', JSON.stringify(localUser));
            }
            return localUser;
        }
    } catch (err) {
        console.error('Failed to sync user to backend:', err);
    }
    // Fallback: build user from Firebase data
    const fallback: LocalUser = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firebaseUser.email || firebaseUser.uid)}`,
    };
    if (typeof window !== 'undefined') {
        localStorage.setItem('localgift_user', JSON.stringify(fallback));
    }
    return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LocalUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                const localUser = await syncUserToBackend(fbUser);
                setUser(localUser);
            } else {
                setUser(null);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('localgift_user');
                }
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const loginWithGoogle = async (requestedRole?: string) => {
        const result = await signInWithPopup(auth, googleProvider);
        await syncUserToBackend(result.user, requestedRole);
    };

    const loginWithEmail = async (email: string, password: string, requestedRole?: string) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToBackend(result.user, requestedRole);
    };

    const signupWithEmail = async (email: string, password: string, name: string, requestedRole?: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await syncUserToBackend(result.user, requestedRole);
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('localgift_user');
        }
    };

    const getIdToken = async (): Promise<string | null> => {
        if (!firebaseUser) return null;
        return await firebaseUser.getIdToken();
    };

    const refreshUser = async () => {
        if (firebaseUser) {
            const localUser = await syncUserToBackend(firebaseUser);
            setUser(localUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, loginWithGoogle, loginWithEmail, signupWithEmail, logout, getIdToken, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
