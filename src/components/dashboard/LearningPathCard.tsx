import React from "react";
import { Progress } from "../ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface LearningPathCardProps {
  path: {
    _id: string;
    title: string;
    description: string;
    progress: number; // Progress percentage (0-100)
    courses: string[]; // List of course IDs
  };
}

const LearningPathCard: React.FC<LearningPathCardProps> = ({ path }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/learning-path/${path._id}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{path.title}</CardTitle>
        <CardDescription>{path.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Courses in this path: {path.courses.length}
          </p>
          <Progress value={path.progress} max={100} showValue />
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearningPathCard;
