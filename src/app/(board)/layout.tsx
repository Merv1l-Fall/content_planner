import CardEditor from "@/components/ui/board/CardEditor";
import Sidebar from "@/components/ui/navigation/Sidebar";

const BoardLayout = ({ children }: LayoutProps<"/">) => {
	return (
		<div className="flex min-h-screen flex-col md:flex-row">
			<Sidebar />
			<main className="flex min-w-0 flex-1 flex-col">{children}</main>
			<CardEditor />
		</div>
	);
};

export default BoardLayout;
