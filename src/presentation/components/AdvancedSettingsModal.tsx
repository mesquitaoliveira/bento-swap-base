import React from "react";
import { Settings, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  slippage: string;
  onSlippageChange: (slippage: string) => void;
  routePriority?: string;
  onRoutePriorityChange?: (priority: string) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
  routePriority = "best_return",
  onRoutePriorityChange,
}) => {
  const slippagePresets = ["1.0", "1.5", "2.0"];

  // Mapeamento das opções em português para os valores da API
  const routeOptionsMap = {
    "Melhor Retorno": "best_return",
    "Melhor Preço": "best_price",
    "Mais Rápido": "fastest",
    "Mais Barato": "cheapest",
  };

  const routeOptions = Object.keys(routeOptionsMap);

  // Função para obter o rótulo português da prioridade da API
  const getRoutePriorityLabel = (apiValue: string): string => {
    const entry = Object.entries(routeOptionsMap).find(
      ([, value]) => value === apiValue
    );
    return entry ? entry[0] : "Melhor Retorno";
  };

  // Função para lidar com mudança de prioridade de rota
  const handleRoutePriorityChange = (label: string) => {
    const apiValue = routeOptionsMap[label as keyof typeof routeOptionsMap];
    if (onRoutePriorityChange) {
      onRoutePriorityChange(apiValue);
    }
  };

  const currentRoutePriorityLabel = getRoutePriorityLabel(routePriority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-4">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Configurações Avançadas
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Slippage Tolerance */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-base font-semibold text-foreground">
                Tolerância ao Slippage
              </label>
              <div className="group relative">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-md">
                  Tolerância máxima de movimento de preço
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <Input
                type="text"
                value={slippage}
                onChange={(e) => onSlippageChange(e.target.value)}
                className="flex-1 font-semibold text-lg"
                placeholder="1.0"
              />
              <Badge
                variant="secondary"
                className="text-lg font-semibold px-3 py-3"
              >
                %
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {slippagePresets.map((preset) => (
                <Button
                  key={preset}
                  variant={slippage === preset ? "default" : "outline"}
                  onClick={() => onSlippageChange(preset)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    slippage === preset
                      ? "bg-green-600 hover:bg-green-700 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  {preset}%
                </Button>
              ))}
            </div>
          </div>

          {/* Route Priority */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-base font-semibold text-foreground">
                Prioridade da Rota
              </label>
              <div className="group relative">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-md">
                  Escolha a otimização de roteamento
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {routeOptions.map((option) => (
                <Button
                  key={option}
                  variant={
                    currentRoutePriorityLabel === option ? "default" : "outline"
                  }
                  onClick={() => handleRoutePriorityChange(option)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    currentRoutePriorityLabel === option
                      ? "bg-green-600 hover:bg-green-700 shadow-lg"
                      : "hover:shadow-md"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Funções utilitárias para conversão - podem ser exportadas para uso em outros componentes
export const convertSlippageToBasisPoints = (percentage: string): number => {
  const num = parseFloat(percentage);
  return Math.round(num * 100); // 2.0% → 200 basis points
};

export const convertBasisPointsToPercentage = (basisPoints: number): string => {
  return (basisPoints / 100).toFixed(1);
};

export const routeOptionsMap = {
  "Melhor Retorno": "best_return",
  "Melhor Preço": "best_price",
  "Mais Rápido": "fastest",
  "Mais Barato": "cheapest",
};

export default AdvancedSettingsModal;
