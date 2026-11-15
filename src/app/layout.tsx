import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { APP_NAME, THEME_STORAGE_KEY } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: APP_NAME,
		template: `%s · ${APP_NAME}`,
	},
	description: "Plan long form and short form content from idea to finished piece.",
};

// Runs before first paint so a saved theme never flashes the wrong colours
const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

const RootLayout = ({ children }: LayoutProps<"/">) => {
	return (
		<html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="min-h-full bg-background font-sans text-foreground">{children}</body>
		</html>
	);
};

export default RootLayout;
