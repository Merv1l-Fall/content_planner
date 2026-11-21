import type { Metadata } from "next";
import ArchiveList from "@/components/ui/archive/ArchiveList";

export const metadata: Metadata = {
	title: "Archive",
};

const ArchivePage = () => {
	return <ArchiveList />;
};

export default ArchivePage;
