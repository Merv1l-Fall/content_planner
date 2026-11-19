import AuthGate from "@/components/ui/auth/AuthGate";
import CardEditor from "@/components/ui/board/CardEditor";
import MobileNav from "@/components/ui/navigation/MobileNav";
import Sidebar from "@/components/ui/navigation/Sidebar";

const BoardLayout = ({ children }: LayoutProps<"/">) => {
	return (
		<AuthGate>
			<div className="flex min-h-screen flex-col md:flex-row">
				<Sidebar />
				{/* On a phone the bottom leaves room for the tab bar and the New idea button */}
				<main className="flex min-w-0 flex-1 flex-col pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
				<CardEditor />
				<MobileNav />
			</div>
		</AuthGate>
	);
};

export default BoardLayout;
