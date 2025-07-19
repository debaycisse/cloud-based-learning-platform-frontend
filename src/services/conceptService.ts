import { api } from "./apiClient";
import type { Concept } from "../types";

export const getConcepts = async (
  limit:number, skip:number
): Promise<{ concepts: Concept[], count: number }> => {
  try {
    const response = await api.get(`/concepts?limit=${limit}&skip=${skip}`);
    return response.data;
  } catch (error) {
    console.error("Get concepts API error:", error);
    throw error;
  }
};

export const getConcept = async (conceptId: string): Promise<Concept> => {
  try {
    const response = await api.get(`/concepts/${conceptId}`);
    return response.data.concept;
  } catch (error) {
    console.error(`Get concept ${conceptId} API error:`, error);
    throw error;
  }
};

export const createConcept = async (conceptData: {
  concepts: string[];
  links: string[];
  description: string;
}): Promise<{ message: string; concept: Concept }> => {
  try {
    const response = await api.post("/concepts", conceptData);
    return response.data;
  } catch (error) {
    console.error("Create concept API error:", error);
    throw error;
  }
};

export const updateConcept = async (
  conceptId: string,
  concept: Partial<Concept>
): Promise<{ message: string; concept: Concept }> => {
  try {
    const response = await api.put(`/concepts/${conceptId}`, { ...concept });
    return response.data;
  } catch (error) {
    console.error(`Update concept ${conceptId} API error:`, error);
    throw error;
  }
};

export const deleteConcept = async (
  conceptId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/concepts/${conceptId}`);
    return response.data;
  } catch (error) {
    console.error(`Delete concept ${conceptId} API error:`, error);
    throw error;
  }
};