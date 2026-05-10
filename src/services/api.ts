import axios from "axios";
import type { Column, Card, PartialCard } from "../types/kanban";
import * as transformator from "../utils/transformers";
import { normalizeAxiosError } from "@/lib/errors";

const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;

const api = axios.create({
    baseURL: VITE_API_URL ?? "",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        throw normalizeAxiosError(error);
    },
);

export const getColumns = async (): Promise<Column[]> => {
    const response = await api.get("/columns/");
    return transformator.transformColumnsToFrontend(response.data);
};

export const createColumn = async (columnData: Partial<Column>): Promise<Column> => {
    const backendColumnData = transformator.transformColumnToBackend(columnData);
    const response = await api.post("/columns/", backendColumnData);
    return transformator.transformColumnToFrontend(response.data);
};

export const updateColumn = async (columnId: string, updates: Partial<Column>): Promise<Column> => {
    const backendUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) {
        backendUpdates.title = updates.title;
    }
    if (updates.order !== undefined) {
        backendUpdates.order = updates.order;
    }
    const response = await api.put(`/columns/${columnId}/`, backendUpdates);
    return transformator.transformColumnToFrontend(response.data);
};

export const deleteColumn = async (columnId: string): Promise<void> => {
    await api.delete(`/columns/${columnId}/`);
};

export const createCard = async (columnId: string, cardData: PartialCard): Promise<Card> => {
    const backendCardData = transformator.transformCardToBackend(cardData, columnId);
    const response = await api.post(`/columns/${backendCardData.column}/cards/`, backendCardData);
    return transformator.transformCardToFrontend(response.data);
};

export const updateCard = async (cardId: string, updates: PartialCard): Promise<Card> => {
    const backendUpdates = transformator.transformCardUpdatesToBackend(updates);
    const response = await api.put(`/cards/${cardId}/`, backendUpdates);
    return transformator.transformCardToFrontend(response.data);
};

export const removeCard = async (cardId: string): Promise<void> => {
    await api.delete(`/cards/${cardId}/`);
};

export default api;
