
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface IndexationProgressBarProps {
  percentage: number;
}

const IndexationProgressBar = ({ percentage }: IndexationProgressBarProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progression d'indexation</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </Card>
  );
};

export default IndexationProgressBar;
