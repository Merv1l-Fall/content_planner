"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/navigation/ThemeToggle";
import BottomSheet from "@/components/ui/overlay/BottomSheet";
import { FORMATS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/authStore";
import type { Format } from "@/lib/types";

const formatIcons: Record<Format, ReactNode> = {
	long: <rect x="2" y="6" width="20" height="12" rx="2" />,
	short: <rect x="7" y="2" width="10" height="20" rx="2" />,
};

const tabClass = "flex flex-col items-center justify-center gap-1 text-xs";
const sheetRowClass = "flex min-h-14 w-full items-center gap-3 px-1 text-base font-medium text-foreground";

// The phone's navigation, a tab bar along the bottom in place of the sidebar
const MobileNav = () => {
	const pathname = usePathname();
	const { user, signOut } = useAuthStore();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<>
			<nav aria-label="Format" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
				{FORMATS.map((format) => {
					const isActive = pathname === format.href;

					return (
						<Link key={format.id} href={format.href} aria-current={isActive ? "page" : undefined} className={`${tabClass} h-16 ${isActive ? "font-semibold text-accent" : "font-medium text-muted"}`}>
							<span className={`flex h-7 w-14 items-center justify-center rounded-full ${isActive ? "bg-accent-soft" : ""}`}>
								<svg className="size-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
									{formatIcons[format.id]}
								</svg>
							</span>
							{format.label}
						</Link>
					);
				})}

				<button type="button" onClick={() => setIsMenuOpen(true)} aria-haspopup="dialog" className={`${tabClass} h-16 font-medium text-muted`}>
					<span className="flex h-7 w-14 items-center justify-center">
						<svg className="size-5.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<circle cx="5" cy="12" r="1.75" />
							<circle cx="12" cy="12" r="1.75" />
							<circle cx="19" cy="12" r="1.75" />
						</svg>
					</span>
					More
				</button>
			</nav>

			<BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} label="More">
				{user?.email && (
					<div className="flex items-center gap-3 border-b border-border px-1 pb-4">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
							<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<circle cx="12" cy="8" r="4" />
								<path d="M4 21a8 8 0 0 1 16 0" />
							</svg>
						</span>
						<div className="flex min-w-0 flex-col">
							<span className="text-sm text-muted">Signed in as</span>
							<span className="truncate text-base font-medium">{user.email}</span>
						</div>
					</div>
				)}

				<div className="flex flex-col pt-2">
					<ThemeToggle className={sheetRowClass} />
					<button type="button" onClick={signOut} className={`${sheetRowClass} border-t border-border`}>
						<svg className="size-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
						</svg>
						Sign out
					</button>
				</div>
			</BottomSheet>
		</>
	);
};

export default MobileNav;
