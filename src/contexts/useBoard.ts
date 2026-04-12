import { useContext } from "react";
import { BoardContext } from "./BoardContext.tsx";
import type { BoardContextType } from "./BoardContext.tsx";

export const useBoard = (): BoardContextType => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useBoard must be used within BoardProvider");
    }
    return context;
};