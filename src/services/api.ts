import axios from "axios";
import type { Column, Card } from "../types/kanban";
import * as transformator from "../utils/transformers.ts";
const VITE_API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getColumns = async (): Promise<Column[]> => {
    const response = await api.get("/columns/");

    console.log("Raw API response:", response.data);

    //TODO: отсюда начать разбирать что не так
    // const transformedData = transformator.transformColumnsToFrontend(response.data);
    // console.log("Transformed data:", transformedData);
    // return transformedData;

    const transformedColumns = response.data.map((column: Column) => {
        console.log("Processing column:", column);

        return {
            id: column.id,
            title:
                column.title === "toDo"
                    ? "Todo"
                    : column.title === "inProgress"
                      ? "In Progress"
                      : column.title === "done"
                        ? "Completed"
                        : column.title,
            order: column.order,
            cards: (column.cards || []).map((card: Card) => {
                console.log("Processing card:", card);

                return {
                    id: card.id,
                    title: card.title,
                    description: card.description || "",
                    priority: card.priority,
                    tags: card.tags ? card.tags.split(",").filter((t: string) => t.trim()) : [],
                    date: card.date,
                    assignees: card.assignees
                        ? card.assignees.split(",").map((name: string, idx: number) => ({
                              id: `a-${idx}`,
                              name: name.trim(),
                              tone: ["slate", "emerald", "violet", "amber", "rose"][idx % 5],
                          }))
                        : [],
                    column: card.column,
                    order: card.order,
                };
            }),
        };
    });

    console.log("Transformed columns:", transformedColumns);
    return transformedColumns;
};

export const createCard = async (columnId: string, cardData: any): Promise<Card> => {
    const backendCardData = transformator.transformCardToBackend(cardData, columnId);
    const response = await api.post(`/columns/${columnId}/cards/`, backendCardData);

    return transformator.transformCardToFrontend(response.data);
};

export const updateCard = async (cardId: string, updates: any): Promise<Card> => {
    const backendUpdates = transformator.transformCardUpdatesToBackend(updates);
    const response = await api.put(`/cards/${cardId}/`, backendUpdates);
    return transformator.transformCardToFrontend(response.data);
};

export default api;
