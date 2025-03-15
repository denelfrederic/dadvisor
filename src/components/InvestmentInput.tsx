
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface InvestmentInputProps {
  portfolioName: string;
  expectedReturn: string;
  minInvestment: number;
  onInvest: (amount: number) => void;
}

const InvestmentInput = ({ 
  portfolioName, 
  expectedReturn,
  minInvestment = 100,
  onInvest 
}: InvestmentInputProps) => {
  const [amount, setAmount] = useState<number>(minInvestment);
  const [isValidAmount, setIsValidAmount] = useState<boolean>(true);
  const [projections, setProjections] = useState<{ year: number; amount: number }[]>([]);
  
  useEffect(() => {
    if (amount >= minInvestment) {
      setIsValidAmount(true);
      
      // Calculate projections based on expected return
      // For demonstration, using a fixed annual return rate
      const returnRate = parseFloat(expectedReturn.replace(/[^0-9.-]+/g, "")) / 100;
      
      const newProjections = [];
      for (let year = 1; year <= 5; year++) {
        const projectedAmount = amount * Math.pow(1 + returnRate, year);
        newProjections.push({
          year,
          amount: projectedAmount
        });
      }
      
      setProjections(newProjections);
    } else {
      setIsValidAmount(false);
    }
  }, [amount, expectedReturn, minInvestment]);
  
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setAmount(numericValue ? parseFloat(numericValue) : 0);
  };
  
  const handleSliderChange = (value: number[]) => {
    setAmount(value[0]);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Définir votre investissement</CardTitle>
          <CardDescription>
            Choisissez le montant que vous souhaitez investir dans le portefeuille {portfolioName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="amount">Montant (€)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                value={amount.toLocaleString("fr-FR")}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8 text-lg font-medium"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            </div>
            
            <div className="pt-4 pb-2">
              <Slider
                defaultValue={[minInvestment]}
                min={0}
                max={10000}
                step={100}
                value={[amount]}
                onValueChange={handleSliderChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>0 €</span>
                <span>10 000 €</span>
              </div>
            </div>
            
            {!isValidAmount && (
              <p className="text-destructive text-sm">
                Le montant minimum d'investissement est de {minInvestment} €.
              </p>
            )}
          </div>
          
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Projections de rendement</h4>
            <div className="space-y-3">
              {projections.map((projection) => (
                <div key={projection.year} className="flex justify-between items-center">
                  <span className="text-sm">Année {projection.year}</span>
                  <span className="font-medium">
                    {projection.amount.toLocaleString("fr-FR", { 
                      style: "currency", 
                      currency: "EUR",
                      maximumFractionDigits: 0
                    })}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Ces projections sont basées sur un rendement annuel de {expectedReturn} et sont fournies à titre indicatif uniquement.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            disabled={!isValidAmount || amount === 0} 
            onClick={() => onInvest(amount)}
          >
            Investir maintenant
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InvestmentInput;
