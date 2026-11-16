"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import SignInScreen from "@/components/ui/auth/SignInScreen";
import { useAuthStore } from "@/lib/store/authStore";
import { useBoardStore } from "@/lib/store/boardStore";

interface AuthGateProps {
	children: ReactNode;
}

// Shows the app only when signed in, and keeps the signed-in user's board open
const AuthGate = ({ children }: AuthGateProps) => {
	const { status, user, listenToAuth } = useAuthStore();
	const { syncError, connectBoard } = useBoardStore();
	const userId = user?.id;

	useEffect(() => {
		return listenToAuth();
	}, [listenToAuth]);

	useEffect(() => {
		if (!userId) return;

		return connectBoard(userId);
	}, [userId, connectBoard]);

	if (status === "loading") {
		return <p className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</p>;
	}

	if (status === "signedOut") return <SignInScreen />;

	return (
		<>
			{syncError && (
				<p role="alert" className="border-b border-border bg-surface px-4 py-2 text-center text-sm text-red-600 dark:text-red-400">
					{syncError}
				</p>
			)}
			{children}
		</>
	);
};

export default AuthGate;
