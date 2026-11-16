import { create } from "zustand";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as signOutOfFirebase } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

interface AuthUser {
	id: string;
	name: string | null;
	email: string | null;
}

// Closing the Google window is not an error worth showing
const CANCELLED_SIGN_IN_CODES = ["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"];

interface AuthStore {
	// "loading" until Firebase has checked for a saved session
	status: "loading" | "signedOut" | "signedIn";
	user: AuthUser | null;
	signInError: string | null;
	listenToAuth: () => () => void;
	signIn: () => Promise<void>;
	signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
	status: "loading",
	user: null,
	signInError: null,

	// Follows sign-in and sign-out, also from other tabs. Returns a function that stops listening
	listenToAuth: () => {
		return onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
			if (!firebaseUser) {
				set({ status: "signedOut", user: null });
				return;
			}

			set({ status: "signedIn", user: { id: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email }, signInError: null });
		});
	},

	signIn: async () => {
		set({ signInError: null });

		try {
			await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
		} catch (error) {
			const code = (error as { code?: string }).code ?? "";
			if (CANCELLED_SIGN_IN_CODES.includes(code)) return;

			console.error("Error signing in:", error);
			set({ signInError: code === "auth/popup-blocked" ? "The browser blocked the Google window. Allow pop-ups for this site and try again." : "Could not sign in. Try again." });
		}
	},

	signOut: async () => {
		try {
			await signOutOfFirebase(getFirebaseAuth());
		} catch (error) {
			console.error("Error signing out:", error);
		}
	},
}));
