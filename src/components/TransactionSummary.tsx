import React, { useState } from "react";
import { Clock, Zap, Shield, ChevronDown, ChevronUp, Fuel } from "lucide-react";
import { Token } from "../types";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  getTokenInfo,
  getChainInfo,
  DEFAULT_TOKEN_LOGO,
} from "../utils/tokensInfo";

interface TransactionSummaryProps {
  receiveAmount: string;
  receiveToken: Token;
  route: string;
  estimatedTime: string;
  slippage: string;
  totalFee: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  receiveAmount,
  receiveToken,
  route,
  estimatedTime,
  slippage,
  totalFee,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const estimatedValue = (
    parseFloat(receiveAmount) * receiveToken.price
  ).toFixed(2);
  const feeInUSD = parseFloat(totalFee).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Collapsed Summary */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 h-auto justify-between hover:bg-transparent"
      >
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="text-muted-foreground truncate">{route}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-foreground font-medium">{estimatedTime}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="w-3 h-3 text-purple-500" />
            <span className="text-foreground font-medium">${feeInUSD}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="relative w-5 h-5 rounded-full flex items-center justify-center">
            <img
              src={(() => {
                const tokenInfo = getTokenInfo(
                  receiveToken.network,
                  receiveToken.symbol
                );
                return tokenInfo?.ICON || DEFAULT_TOKEN_LOGO;
              })()}
              alt={receiveToken.name}
              className="w-5 h-5 rounded-full object-cover border-2 border-primary bg-primary"
              onError={(e) => {
                if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                  e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                }
              }}
            />
          </div>
          <span className="text-xs font-bold text-foreground truncate">
            {parseFloat(receiveAmount).toFixed(4)} {receiveToken.symbol}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </Button>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Receive Amount Display */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                    <img
                      src={(() => {
                        const tokenInfo = getTokenInfo(
                          receiveToken.network,
                          receiveToken.symbol
                        );
                        return tokenInfo?.ICON || DEFAULT_TOKEN_LOGO;
                      })()}
                      alt={receiveToken.name}
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
                        const chainInfo = getChainInfo(receiveToken.network);
                        return chainInfo?.ICON || DEFAULT_TOKEN_LOGO;
                      })()}
                      alt={receiveToken.network}
                      className="absolute top-0 right-0 w-4 h-4 rounded-full object-cover border-2 border-white bg-white z-10 shadow-sm"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                          e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">
                      {parseFloat(receiveAmount).toFixed(6)}{" "}
                      {receiveToken.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${estimatedValue} USD
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    You'll receive
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-200"
                  >
                    On {receiveToken.network}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <div className="space-y-3">
            {/* Route */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">Route</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {route}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Best Rate
                </Badge>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Estimated Time
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {estimatedTime}
              </span>
            </div>

            {/* Slippage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">
                  Max Slippage
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {slippage}%
                </span>
                {parseFloat(slippage) < 1.0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100"
                  >
                    Low
                  </Badge>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-3">
              {/* Total Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Total Fee
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">
                    ${feeInUSD}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bridge + Gas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionSummary;
