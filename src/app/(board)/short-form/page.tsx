import type { Metadata } from "next";
import Board from "@/components/ui/board/Board";

export const metadata: Metadata = {
	title: "Short form",
};

const ShortFormPage = () => {
	return <Board format="short" />;
};

export default ShortFormPage;
