import type { Metadata } from "next";
import Board from "@/components/ui/board/Board";

export const metadata: Metadata = {
	title: "Long form",
};

const LongFormPage = () => {
	return <Board format="long" />;
};

export default LongFormPage;
