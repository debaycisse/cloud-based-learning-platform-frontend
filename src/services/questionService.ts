import { api } from "./apiClient";
import type { Question } from "../types";

export const getQuestions = async (
  limit = 20,
  skip = 0
): Promise<{
  questions: Question[];
  count: number;
  skip: number;
  limit: number;
}> => {
  try {
    const response = await api.get("/questions", {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error("Get questions API error:", error);
    throw error;
  }
};

export const getQuestionById = async (
  questionId: string
): Promise<{
  question: Question;
}> => {
  try {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Get question ${questionId} API error:`, error);
    throw error;
  }
};

export const getQuestionsByIds = async (
  question_ids: string[]
): Promise<{
  question: Question[];
}> => {
  try {
    const response = await api.post(`/questions/bulk`, { question_ids });
    console.log(`/questions/bulk response ${response.data}`)
    return response.data;
  } catch (error) {
    console.error(`Get question ${question_ids} API error:`, error);
    throw error;
  }
};



// Add the getQuestion function that returns a single question
export const getQuestion = async (questionId: string): Promise<Question> => {
  try {
    const response = await api.get(`/questions/${questionId}`)
    return response.data.question
  } catch (error) {
    console.error(`Get question ${questionId} API error:`, error)
    throw error
  }
};

export const createQuestion = async (
  questionData: {
    question_text: string;
    options: string[];
    correct_answer: string;
    tags?: string[];
  }
): Promise<{
    message: string;
    question: Question;
}> => {
  try {
    const response = await api.post("/questions", questionData);
    return response.data;
  } catch (error) {
    console.error("Create question API error:", error);
    throw error;
  }
};

export const createQuestions = async (
    assessmentId: string,
    questions: {
      question_text: string;
      options: string[];
      correct_answer: string;
      tags: string[];
    }[]
  ): Promise<{
    message: string;
    questions: Question[];
  }> => {
    console.log(`questions object to the backend ::: ${JSON.stringify(questions)}`)
    try {
      const response = await api.post(`/questions/bulk/${assessmentId}`, { questions });
      return response.data;
    } catch (error) {
      console.error("Create questions API error:", error);
      throw error;
    }
  };

export const updateQuestion = async (
  questionId: string,
  questionData: Partial<Question>
): Promise<{
    message: string;
    question: Question;
}> => {
  try {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Update question ${questionId} API error:`, error);
    throw error;
  }
};

export const deleteQuestion = async (
  questionId: string
): Promise<{
    message: string;
}> => {
  try {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error(`Delete question ${questionId} API error:`, error);
    throw error;
  }
};

export const getQuestionByAssessmentId = async (
  assessmentId: string,
): Promise<{
  questions: Question[];
  count: number;
  skip: number;
  limit: number;
}> => {
  try {
    const response = await api.get(`questions/assessment/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Get questions for assessment ${assessmentId} API error:`, error);
    throw error;
  }
};

export const getQuestionByTag = async (
  tags: string[],
  limit = 20,
  skip = 0
): Promise<{
  questions: Question[];
  count: number;
  skip: number;
  limit: number;
}> => {
  try {
    const response = await api.get(`/questions/tags`, {
      params: { tags, limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error(`Get questions by tag ${tags} API error:`, error);
    throw error;
  }
};

export const getQuestionByAssessmentIdAndTag = async (
  assessmentId: string,
  tags: string[],
  limit = 20,
  skip = 0
): Promise<{
  questions: Question[];
  count: number;
  skip: number;
  limit: number;
}> => {
  try {
    const response = await api.get(`/questions/assessment/${assessmentId}/tags`, {
      params: { tags, limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error(`Get questions by assessment ${assessmentId} and tag ${tags} API error:`, error);
    throw error;
  }
};

export const addQuestionToAssessment = async (
    questionId: string,
    assessmentId: string
): Promise<{
    message: string;
}> => {
    try {
        const response = await api.post(`/questions/${questionId}/assessments/${assessmentId}`);
        return response.data;
    } catch (error) {
        console.error(`Add question ${questionId} to assessment ${assessmentId} API error:`, error);
        throw error;
    }
};

export const removeQuestionFromAssessment = async (
    questionId: string,
    assessmentId: string
): Promise<{
    message: string;
}> => {
    try {
        const response = await api.delete(`/questions/${questionId}/assessment/${assessmentId}`);
        return response.data;
    } catch (error) {
        console.error(`Remove question ${questionId} from assessment ${assessmentId} API error:`, error);
        throw error;
    }
};
