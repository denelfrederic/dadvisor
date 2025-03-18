
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CombinedReport } from "../../types";
import HistoricalReportItem from "./HistoricalReportItem";

interface HistoricalReportsListProps {
  previousReports: {date: string, report: CombinedReport}[];
}

const HistoricalReportsList = ({ previousReports }: HistoricalReportsListProps) => {
  return (
    <ScrollArea className="h-[400px] border rounded-md p-4">
      <div className="space-y-4">
        {previousReports.map((item, index) => (
          <HistoricalReportItem 
            key={index}
            date={item.date}
            report={item.report}
            index={index}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default HistoricalReportsList;
