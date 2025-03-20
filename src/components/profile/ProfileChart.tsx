
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProfileChartProps {
  allocation: {
    label: string;
    value: number;
  }[];
}

/**
 * Composant qui affiche l'allocation recommandée sous forme de tableau
 * Remplace le graphique en camembert par un tableau plus lisible
 */
const ProfileChart = ({ allocation }: ProfileChartProps) => {
  // Couleurs pour les indicateurs visuels
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Tri de l'allocation par valeur décroissante pour mettre en évidence les actifs principaux
  const sortedAllocation = [...allocation].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      <h4 className="font-medium mb-4 text-center">Allocation recommandée</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Classe d'actifs</TableHead>
            <TableHead className="text-right">Allocation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAllocation.map((item, index) => (
            <TableRow key={`row-${index}`}>
              <TableCell>
                <div 
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
              </TableCell>
              <TableCell className="font-medium">{item.label}</TableCell>
              <TableCell className="text-right">{item.value}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProfileChart;
