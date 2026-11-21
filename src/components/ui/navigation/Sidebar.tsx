"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/navigation/ThemeToggle";
import { APP_NAME, ARCHIVE_HREF, FORMATS } from "@/lib/constants";
import { useAuthStore } from "@/lib/store/authStore";

const Sidebar = () => {
	const pathname = usePathname();
	const { user, signOut } = useAuthStore();

	return (
		<aside className="hidden shrink-0 border-r border-border md:flex md:w-56 md:flex-col md:items-stretch md:gap-8 md:px-5 md:py-6">
			<p className="text-base font-semibold">{APP_NAME}</p>

			<nav aria-label="Format" className="flex flex-1 items-center gap-1 md:flex-col md:items-stretch">
				<p className="mb-2 hidden px-3 text-sm text-muted md:block">Format</p>
				{FORMATS.map((format) => {
					const isActive = pathname === format.href;

					return (
						<Link
							key={format.id}
							href={format.href}
							aria-current={isActive ? "page" : undefined}
							className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-foreground"}`}
						>
							{format.label}
						</Link>
					);
				})}

				<Link
					href={ARCHIVE_HREF}
					aria-current={pathname === ARCHIVE_HREF ? "page" : undefined}
					className={`mt-4 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === ARCHIVE_HREF ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface hover:text-foreground"}`}
				>
					Archive
				</Link>
			</nav>

			<div className="flex items-center gap-1 md:mt-auto md:flex-col md:items-stretch">
				<ThemeToggle />
				<button
					type="button"
					onClick={signOut}
					title={user?.email ?? undefined}
					className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
				>
					<svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
					</svg>
					Sign out
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
