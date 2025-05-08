import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAssessmentResults, getAssessmentById } from "../../services/assessmentService"
import MainLayout  from "../../layouts/MainLayout"
import { AssessmentResult } from "../../types"
import LoadingSpinner from "../../components/common/LoadingSpinner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { AlertCircle, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Progress } from "../../components/ui/progress"
import { Separator } from "../../components/ui/seperator"
import { Badge } from "../../components/ui/badge"



const AssessmentResultPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<AssessmentResult>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [assessementTitle, setAssessmentTitle] = useState<string | undefined>(undefined);


  useEffect(() => {
    const fetchResult = async () => {
      try {
        if (!assessmentId) {
          setError("Attempt ID is required")
          setLoading(false)
          return
        }

        const data = await getAssessmentResults()

        // Find recent assessment result based on the created_at timestamp
        const recentResult = data.results.reduce((latest, current) => {
          const latestDate = new Date(latest.created_at).getTime();
          const currentDate = new Date(current.created_at).getTime();
          return currentDate > latestDate ? current : latest;
        });

        setResult(recentResult);
        setLoading(false)

        getAssessmentById(assessmentId).then(
          (res) => setAssessmentTitle(res.assessment.title)
        );

      } catch (err) {
        setError("Failed to load assessment result")
        setLoading(false)
      }
    }

    fetchResult()
  }, [assessmentId]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  };


  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  };

  if (error || !result) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Assessment result not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </MainLayout>
    )
  };

  const isPassed = result.passed;
  const scorePercentage = result.score;

  return (
    <MainLayout>
        <h1 className="text-3xl font-bold mb-2">{assessementTitle ? `${assessementTitle} Results` : "Loading Title..."}</h1>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{assessementTitle} Results</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Completed on {new Date(result.completed_at).toLocaleDateString()} • Time spent:{" "}
            {formatTime(result.time_spent)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{result.score}%</div>
              <Progress value={scorePercentage} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Correct Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {result.score}
              </div>
              <Progress value={result.score * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isPassed ? (
                  <>
                    <Award className="h-8 w-8 text-green-500" />
                    <div className="text-2xl font-bold text-green-500">PASSED</div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div className="text-2xl font-bold text-red-500">FAILED</div>
                  </>
                )}
              </div>
              <p className="text-sm mt-2">Passing score: {process.env.PASSING_SCORE}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review your answers and see the correct solutions</CardDescription>
          </CardHeader>
          <CardContent>
            {result.questions.map((question, index) => (
              <div key={question._id} className="mb-6">
                <div className="flex items-start gap-3 mb-2">
                  <div className="mt-0.5">
                    {question.correct_answer.toLocaleLowerCase() === result.answers[index].toLocaleLowerCase() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      Question {index + 1}: {question.question_text}
                    </h3>

                    <div className="mt-2 pl-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={question.correct_answer.toLocaleLowerCase() === result.answers[index].toLocaleLowerCase() ? "default" : "error"}>Your Answer</Badge>
                        <span>{result.answers[index]}</span>
                      </div>

                      {question.correct_answer.toLocaleLowerCase() !== result.answers[index].toLocaleLowerCase() && (
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Correct Answer
                          </Badge>
                          <span>{question.correct_answer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < result.questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button onClick={() => navigate(`/courses`)} className="gap-1">
              Explore More Courses <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
    </MainLayout>
  )
}

export default AssessmentResultPage
