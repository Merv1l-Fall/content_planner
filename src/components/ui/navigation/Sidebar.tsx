"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/navigation/ThemeToggle";
import { APP_NAME, FORMATS } from "@/lib/constants";

const Sidebar = () => {
	const pathname = usePathname();

	return (
		<aside className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3 md:w-56 md:flex-col md:flex-nowrap md:items-stretch md:gap-8 md:border-b-0 md:border-r md:px-5 md:py-6">
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
			</nav>

			<ThemeToggle />
		</aside>
	);
};

export default Sidebar;
