
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface ProfileChartProps {
  allocation: {
    label: string;
    value: number;
  }[];
}

const ProfileChart = ({ allocation }: ProfileChartProps) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="w-full md:w-64 h-64">
      <h4 className="font-medium mb-2 text-center">Allocation recommandée</h4>
      <ChartContainer config={{}} className="h-56">
        <PieChart>
          <Pie
            data={allocation}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {allocation.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export default ProfileChart;
