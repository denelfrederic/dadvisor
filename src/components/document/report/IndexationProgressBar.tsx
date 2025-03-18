
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface IndexationProgressBarProps {
  percentage: number;
}

const IndexationProgressBar = ({ percentage }: IndexationProgressBarProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-medium">Progression d'indexation</span>
          <span className="font-bold">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
      </div>
    </Card>
  );
};

export default IndexationProgressBar;
