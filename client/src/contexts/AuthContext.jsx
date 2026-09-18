import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch extra profile data (role, names) from Firestore
  const fetchProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, "profiles", uid));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUserProfile(profile);

        // Redirect after sign-in if on public routes
        const publicRoutes = ["/", "/login", "/signup"];
        if (publicRoutes.includes(location.pathname)) {
          const role = profile?.role || "patient";
          navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
        }
      } else {
        setUserProfile(null);
      }

      setInitialized(true);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email, password, metadata) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name on Firebase Auth user
      await updateProfile(newUser, {
        displayName: `${metadata.first_name} ${metadata.last_name}`,
      });

      // Save extra profile info to Firestore
      const profile = {
        uid: newUser.uid,
        email: newUser.email,
        first_name: metadata.first_name,
        last_name: metadata.last_name,
        role: metadata.role,
        created_at: serverTimestamp(),
      };
      await setDoc(doc(db, "profiles", newUser.uid), profile);
      setUserProfile(profile);

      toast({
        title: "Account created!",
        description: "Welcome to Chikitsak AI.",
      });

      navigate(metadata.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (error) {
      const msg = error.message || "Signup failed";
      console.error("Signup error:", error);
      toast({ title: "Error signing up", description: msg, variant: "destructive" });
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user: signedInUser } = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchProfile(signedInUser.uid);
      setUserProfile(profile);

      toast({
        title: "Welcome back!",
        description: `Signed in as ${signedInUser.email}`,
      });

      const role = profile?.role || "patient";
      navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (error) {
      const msg = error.message || "Sign in failed";
      console.error("Sign in error:", error);
      toast({ title: "Error signing in", description: msg, variant: "destructive" });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      toast({ title: "Signed out", description: "You have been signed out." });
      navigate("/");
    } catch (error) {
      const msg = error.message || "Sign out failed";
      console.error("Sign out error:", error);
      toast({ title: "Error signing out", description: msg, variant: "destructive" });
      throw error;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
