"use client";
import { useLayoutEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";

const getSavedTheme = () => {
	try {
		return localStorage.getItem(THEME_STORAGE_KEY);
	} catch (error) {
		console.error("Error reading saved theme:", error);
		return null;
	}
};

const ThemeToggle = () => {
	// React resets the attribute on the dev remount, so apply the saved theme again
	useLayoutEffect(() => {
		const savedTheme = getSavedTheme();
		if (savedTheme !== "light" && savedTheme !== "dark") return;

		document.documentElement.setAttribute("data-theme", savedTheme);
	}, []);

	const handleToggle = () => {
		const root = document.documentElement;
		const deviceTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		const currentTheme = root.getAttribute("data-theme") ?? deviceTheme;
		const nextTheme = currentTheme === "dark" ? "light" : "dark";

		root.setAttribute("data-theme", nextTheme);

		try {
			localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
		} catch (error) {
			console.error("Error saving theme:", error);
		}
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground md:mt-auto"
		>
			<svg className="size-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
			</svg>
			<svg className="hidden size-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
			</svg>
			<span className="dark:hidden">Dark mode</span>
			<span className="hidden dark:inline">Light mode</span>
		</button>
	);
};

export default ThemeToggle;
