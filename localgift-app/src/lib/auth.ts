import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface LocalUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role?: string;
}

export function mapFirebaseUser(user: User | null): LocalUser | null {
    if (!user) return null;
    return {
        id: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.uid)}`
    };
}

export function getCurrentUser(): LocalUser | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("localgift_user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as LocalUser;
    } catch (e) {
        return null;
    }
}

export function persistUser(user: LocalUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem("localgift_user", JSON.stringify(user));
}

export function clearUser() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("localgift_user");
}

export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (e) {
        console.error("Firebase sign out error:", e);
    }
    clearUser();
}

export function updateUser(updates: Partial<LocalUser>) {
    if (typeof window === 'undefined') return null;
    const current = getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem('localgift_user', JSON.stringify(updated));
    return updated;
}

export async function getIdToken(): Promise<string | null> {
    try {
        const token = await auth.currentUser?.getIdToken();
        return token || null;
    } catch {
        return null;
    }
}
