"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { ensureUserDocument, ensureEmailUserDocument, getUserDocument } from "@/lib/firebase/users";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  // 이메일/비밀번호로 새 셀러 계정을 만들고, 상점아이디(storeId)를 함께 등록합니다.
  signUpWithEmail: (email: string, password: string, storeId: string, shopName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await ensureUserDocument(firebaseUser);
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const appUser = await ensureUserDocument(result.user);
    setUser(appUser);
  }

  async function signUpWithEmail(email: string, password: string, storeId: string, shopName: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const appUser = await ensureEmailUserDocument(result.user, storeId, shopName);
    setUser(appUser);
  }

  async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const appUser = (await getUserDocument(result.user.uid)) ?? (await ensureUserDocument(result.user));
    setUser(appUser);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
