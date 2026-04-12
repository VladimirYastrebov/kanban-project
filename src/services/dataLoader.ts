import { getColumns } from "./api";
import { BOARD } from "@/data/boardData";
import type { Column } from "@/types/kanban";

let cachedData: Column[] | null = null;
let loadingPromise: Promise<Column[]> | null = null;

export const loadBoardData = async (): Promise<Column[]> => {
    if (cachedData) {
        console.log("Returning cached data");
        return cachedData;
    }

    if (loadingPromise) {
        console.log("Waiting for existing load...");
        return loadingPromise;
    }

    console.log("Loading data...");
    loadingPromise = (async () => {
        try {
            const apiData = await getColumns();

            if (apiData && apiData.length > 0) {
                console.log("Using API data");
                cachedData = apiData;
            } else {
                console.log("No API data, using mock data");
                cachedData = BOARD;
            }
        } catch (error) {
            console.error("Failed to load from API, using mock data:", error);
            cachedData = BOARD;
        } finally {
            loadingPromise = null;
        }
        return cachedData!;
    })();

    return loadingPromise;
};

export const refreshBoardData = async (): Promise<Column[]> => {
    console.log("Refreshing data...");
    cachedData = null;
    return loadBoardData();
};

export const getCachedData = (): Column[] | null => {
    return cachedData;
};
