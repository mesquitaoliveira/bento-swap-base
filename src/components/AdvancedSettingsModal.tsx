import React, { useState } from "react";
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
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  slippage,
  onSlippageChange,
}) => {
  const [gasOption, setGasOption] = useState("Auto");
  const [routePriority, setRoutePriority] = useState("Recommended");

  const slippagePresets = ["0.5", "1.00", "5.00"];
  const gasOptions = ["Auto", "None", "Medium", "Max"];
  const routeOptions = ["Fastest", "Cheapest", "Recommended"];

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
              Advanced Settings
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          {/* Gas on Destination */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-base font-semibold text-foreground">
                Gas on destination
              </label>
              <div className="group relative">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-md">
                  Gas fee for destination chain
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Badge
                variant="secondary"
                className="text-lg font-bold text-green-600 bg-green-50 hover:bg-green-50 px-4 py-2"
              >
                $0.00
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {gasOptions.map((option) => (
                <Button
                  key={option}
                  variant={gasOption === option ? "default" : "outline"}
                  onClick={() => setGasOption(option)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    gasOption === option ? "shadow-lg" : "hover:shadow-md"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Slippage Tolerance */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-base font-semibold text-foreground">
                Slippage tolerance
              </label>
              <div className="group relative">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-md">
                  Maximum price movement tolerance
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mb-4">
              <Input
                type="text"
                value={slippage}
                onChange={(e) => onSlippageChange(e.target.value)}
                className="flex-1 font-semibold text-lg"
                placeholder="0.5"
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
                Route Priority
              </label>
              <div className="group relative">
                <Info className="w-5 h-5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border shadow-md">
                  Choose routing optimization
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {routeOptions.map((option) => (
                <Button
                  key={option}
                  variant={routePriority === option ? "default" : "outline"}
                  onClick={() => setRoutePriority(option)}
                  className={`transition-all duration-200 hover:scale-105 ${
                    routePriority === option
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

export default AdvancedSettingsModal;
