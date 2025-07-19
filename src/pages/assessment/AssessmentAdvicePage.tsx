import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { AssessmentAdvice } from "../../types";
import { getAssessmentAdvice } from "../../services/assessmentService";


const AssessmentAdvicePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>(); 
  const navigate = useNavigate();
  const [links, setLinks] = useState<AssessmentAdvice>(
    {
      links: [],
    }
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdviceLinks = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAssessmentAdvice(courseId!);

        setLinks(data || { links: [] });
      } catch (err) {
        setError("Unable to load advice links. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdviceLinks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recommended Learning Resources</CardTitle>
          <CardDescription>
            Based on your recent assessment, here are some resources to help you improve your knowledge in the areas you missed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.links.length === 0 ? (
            <p className="text-gray-600">No advice links available.</p>
          ) : (
            <ul className="space-y-4">
              {links.links.map((linkObj, idx) => {
                // const concept = Object.keys(linkObj)[0];
                const concept = linkObj.title
                const url = linkObj.url;
                return (
                  <li key={idx} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">{concept}:</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    </div>
  );
};

export default AssessmentAdvicePage;