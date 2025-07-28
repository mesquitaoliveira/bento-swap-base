import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import TokenSelectModal from "./TokenSelectModal";
import { Token } from "../types";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useAccount } from "wagmi";
import {
  getTokenInfo,
  getChainInfo,
  DEFAULT_TOKEN_LOGO,
} from "../utils/tokensInfo";
import { validateNumericInput } from "../utils/inputValidation";

interface TokenInputProps {
  token: Token;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect: (token: Token) => void;
  onMaxClick?: () => void;
  showMax?: boolean;
  tokens: Token[];
  readOnly?: boolean;
  borderRadius?: "top" | "bottom" | "all";
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  onMaxClick,
  showMax = false,
  tokens,
  readOnly = false,
  borderRadius = "all",
}) => {
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Hook para verificar se a wallet está conectada
  const { isConnected } = useAccount();

  // Calcular valor estimado com fallback se não houver preço
  const tokenPrice = token.price || 0;
  const estimatedValue =
    tokenPrice > 0 && parseFloat(amount) > 0
      ? (parseFloat(amount) * tokenPrice).toFixed(2)
      : "0.00";



  const handleAmountChange = (value: string) => {
    if (readOnly) return;

    const validatedValue = validateNumericInput(value);
    onAmountChange(validatedValue);
  };
  const getBorderRadiusClass = () => {
    switch (borderRadius) {
      case "top":
        return "rounded-t-2xl rounded-b-none border-b-0";
      case "bottom":
        return "rounded-b-2xl rounded-t-none";
      default:
        return "rounded-2xl";
    }
  };

  return (
    <>
      <Card
        className={`border-2 transition-all duration-200 hover:shadow-md ${getBorderRadiusClass()}`}
      >
        <CardContent className="p-0">
          {/* Token Selector - Full Width */}
          <div className="mb-3">
            <Button
              variant="ghost"
              onClick={() => setShowTokenModal(true)}
              className="w-full flex items-center justify-between hover:bg-primary/5 p-5 transition-all duration-200 h-auto"
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center shadow-md">
                  <img
                    src={(() => {
                      const tokenInfo = getTokenInfo(
                        token.network,
                        token.symbol
                      );
                      return tokenInfo?.ICON || DEFAULT_TOKEN_LOGO;
                    })()}
                    alt={token.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                        e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                      }
                    }}
                  />
                  {/* Logo da rede sobreposta */}
                  <img
                    src={(() => {
                      const chainInfo = getChainInfo(token.network);
                      return chainInfo?.ICON || DEFAULT_TOKEN_LOGO;
                    })()}
                    alt={token.network}
                    className="absolute top-0 right-0 w-4 h-4 rounded-full object-cover border-2 border-white bg-white z-10 shadow-sm"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                        e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <div className="font-bold text-foreground text-lg">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {token.network}
                  </div>
                </div>
              </div>
              <div className="border border-primary rounded-full p-2">
                <ChevronDown className="w-4 h-4 text-primary hover:text-black transition-colors" />
              </div>
            </Button>
          </div>

          {/* Amount Input Row */}
          <div className="flex items-center justify-between mb-4 px-5">
            <Input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              readOnly={readOnly}
              className={`text-2xl font-bold text-left bg-transparent border-none outline-none shadow-none flex-1 ${
                readOnly
                  ? "text-muted-foreground cursor-default"
                  : "text-foreground"
              }`}
            />
            {showMax && onMaxClick && (
              <Button
                onClick={onMaxClick}
                variant="outline"
                size="sm"
                className="border-primary rounded-full text-primary hover:text-black hover:border-black transition-all duration-200 shadow-sm text-xs px-3 py-1 h-7 flex-shrink-0 ml-3"
              >
                Max
              </Button>
            )}
          </div>

          {/* Balance and Value */}
          <div className="flex justify-between items-center text-sm px-5 pb-5">
            {tokenPrice > 0 && parseFloat(amount) > 0 ? (
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 hover:bg-green-50"
              >
                ${estimatedValue}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-50 text-gray-500 hover:bg-gray-50"
              >
                $0.00
              </Badge>
            )}
            <div className="text-muted-foreground font-medium">
              <Badge variant="secondary" className="text-xs">
                Saldo: {isConnected ? token.balance.toFixed(4) : "0.000"}{" "}
                {token.symbol}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <TokenSelectModal
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        tokens={tokens}
        selectedToken={token}
        onSelectToken={(selectedToken) => {
          onTokenSelect(selectedToken);
          setShowTokenModal(false);
        }}
      />
    </>
  );
};

export default TokenInput;
