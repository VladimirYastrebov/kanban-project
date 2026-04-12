import { formatDateForFrontend } from "./transformers";

export const getTodayFormatted = (): string => {
    return formatDateForFrontend(new Date().toISOString());
};
