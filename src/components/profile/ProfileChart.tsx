
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileChartProps {
  allocation: {
    label: string;
    value: number;
  }[];
}

/**
 * Composant qui affiche l'allocation recommandée sous forme de tableau
 * Adapté pour fonctionner sur petits et grands écrans
 */
const ProfileChart = ({ allocation }: ProfileChartProps) => {
  const isMobile = useIsMobile();
  
  // Couleurs pour les indicateurs visuels
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Tri de l'allocation par valeur décroissante pour mettre en évidence les actifs principaux
  const sortedAllocation = [...allocation].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-full flex flex-col bg-card rounded-lg p-4 shadow-sm">
      <h4 className="font-medium mb-4 text-center">Allocation recommandée</h4>
      <div className="overflow-x-auto flex-grow">
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-4 bg-gray-100 rounded-sm overflow-hidden">
                      <div 
                        className="h-full rounded-sm" 
                        style={{ 
                          width: `${item.value}%`, 
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span>{item.value}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProfileChart;
