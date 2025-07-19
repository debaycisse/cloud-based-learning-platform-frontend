import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssessmentById,
  submitAssessment,
} from "../../services/assessmentService";
import { getQuestionsByIds } from "../../services/questionService"; // Updated to fetch questions by IDs
import { Assessment, Question } from "../../types";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

const AssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch assessment and questions
  useEffect(() => {
    const fetchAssessmentAndQuestions = async () => {
      try {
        if (!id) {
          setError("Assessment ID is required");
          setLoading(false);
          return;
        }
        // Fetch assessment details
        const assessmentData = await getAssessmentById(id)
        setAssessment(assessmentData);
        setTimeRemaining(assessmentData.time_limit * 60); // Convert minutes to seconds

        // Fetch questions for the assessment using question IDs
        const questionsData = await getQuestionsByIds(assessmentData.questions);
        setQuestions(questionsData.questions || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to load assessment or questions");
        setLoading(false);
      }
    };

    fetchAssessmentAndQuestions();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (!assessment || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, timeRemaining]);

  const handleAnswerChange = (questionId: string, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    setIsSubmitting(true);
    try {
      // Check if all questions are answered
      const unansweredQuestions = questions.filter((q) => !answers[q._id]);

      if (unansweredQuestions.length > 0 && timeRemaining > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`
        );
        if (!confirmSubmit) {
          setIsSubmitting(false);
          return;
        }
      }

      // Calculate the user's score
      let correctAnswersCount = 0;
      questions.forEach((question) => {
        if (
          answers[question._id]?.toLocaleLowerCase() ===
          question.correct_answer.toLocaleLowerCase()
        ) {
          correctAnswersCount++;
        }
      });

      const answersValues = Object.values(answers);

      // Calculate the time started by obtaining it from the timeRemaining
      const timeStarted = new Date(Date.now() - timeRemaining * 1000).toISOString();

      const questions_id = questions.map((question) => question._id);

      // Submit the assessment along with the user's answers and score
      const {result} = await submitAssessment(id!, answersValues, timeStarted, questions_id);

      if (result && result.score < 50) navigate(`/assessment/${result._id}/advise`)

      navigate(`/assessment/${assessment._id}/result`);
    } catch (err) {
      setError("Failed to submit assessment");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Assessment not found"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">{assessment.title}</h1>
          <div className="flex items-center gap-2 text-orange-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription>{currentQuestion.question_text}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion._id] || ""}
            onValueChange={(value) =>
              handleAnswerChange(currentQuestion._id, value)
            }
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-4">
                <RadioGroupItem
                  value={option}
                  id={`${currentQuestion._id}-${index}`}
                />
                <Label
                  htmlFor={`${currentQuestion._id}-${index}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <div className="mt-6 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={answers[questions[index]._id] ? "default" : "outline"}
            className={`h-10 w-10 p-0 ${
              currentQuestionIndex === index
                ? "ring-2 ring-offset-2 ring-primary"
                : ""
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AssessmentPage;
