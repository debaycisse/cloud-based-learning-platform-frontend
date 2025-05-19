import { api } from "./apiClient";
import type { Assessment, AssessmentResult } from "../types";

export const getAssessmentForCourse = async (
  courseId: string
): Promise<{
  assessments: Assessment[]
}> => {
  try {
    const response = await api.get(`/assessments/course/${courseId}`);
    return response.data.assessments;
  } catch (error) {
    console.error(`Get assessment for course ${courseId} API error:`, error);
    throw error;
  }
};

export const getAssessmentById = async (
  assessment_id: string
): Promise<{
  assessment: Assessment
}> => {
  try {
    const response = await api.get(`/assessments/${assessment_id}`);
    return response.data;
  } catch (error) {
    console.error(`Get assessment ${assessment_id} API error:`, error);
    throw error;
  }
};

export const getAssessments = async (
  limit = 20,
  skip = 0
): Promise<{
  assessments: Assessment[];
  count: number;
  skip: number;
  limit: number
}> => {
  try {
    const response = await api.get("/assessments", {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error("Get assessments API error:", error);
    throw error;
  }
};

export const submitAssessment = async (
  assessmentId: string,
  answers: string[],
  started_at: string,
  questions_id: string[]
): Promise<{
  message: string;
  result: {
    score: number;
    passed: boolean;
    knowledge_gaps: string[]
  };
}> => {
  try {
    const response = await api.post(`/assessments/${assessmentId}/submit`, {
      answers,  started_at, questions_id
    });
    return response.data;
  } catch (error) {
    console.error(`Submit assessment ${assessmentId} API error:`, error);
    throw error;
  }
};

export const getAssessmentResults = async (
  limit = 20,
  skip = 0
): Promise<{
  results: AssessmentResult[];
  count: number;
  skip: number;
  limit: number
}> => {
  try {
    const response = await api.get("/assessments/results", {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error("Get assessment results API error:", error);
    throw error;
  }
};

export const getAssessmentResultAverage = async (
  assessmentId: string
): Promise<{
  average_score: number
}> => {
  try {
    const response = await api.get(
      `/assessments/${assessmentId}/average_score`
    );
    return response.data;
  } catch (error) {
    console.error(`Get assessment ${assessmentId} result average API error:`, error);
    throw error;
  }
}

export const createAssessment = async (
  assessmentData: Partial<Assessment>
): Promise<{
  message: string;
  assessment: Assessment
}> => {
  try {
    console.log(`Assessment data ::  ${JSON.stringify(assessmentData)}`)
    const response = await api.post("/assessments", assessmentData);
    return response.data;
  } catch (error) {
    console.error("Create assessment API error:", error);
    throw error;
  }
};

export const updateAssessment = async (
  assessmentId: string,
  assessmentData: Partial<Assessment>
): Promise<{
  message: string;
  assessment: Assessment
}> => {
  try {
    const response = await api.put(
      `/assessments/${assessmentId}`,
      assessmentData
    );
    return response.data;
  } catch (error) {
    console.error(`Update assessment ${assessmentId} API error:`, error);
    throw error;
  }
};

export const deleteAssessment = async (
  assessmentId: string
): Promise<{
  message: string
}> => {
  try {
    const response = await api.delete(`/assessments/${assessmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Delete assessment ${assessmentId} API error:`, error);
    throw error;
  }
}
