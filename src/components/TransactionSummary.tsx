import React, { useState } from "react";
import { Zap, Shield, ChevronDown, ChevronUp, Fuel } from "lucide-react";
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
  route?: string;
  slippage: string;
  quote?: any; // Dados da quote da API
  payToken?: Token;
  payAmount?: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  receiveAmount,
  receiveToken,
  route,
  slippage,
  quote,
  payToken,
  payAmount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);



  // Calcular valor estimado com fallback se não houver preço
  const tokenPrice = receiveToken.price || 0;
  const estimatedValue =
    tokenPrice > 0
      ? (parseFloat(receiveAmount) * tokenPrice).toFixed(2)
      : "0.00";

  // Calcular fees da API
  const totalFees = quote?.fees
    ? quote.fees.reduce(
        (sum: number, fee: any) => sum + parseFloat(fee.value),
        0
      )
    : 0;
  const feeInUSD = totalFees.toFixed(4);

  // Calcular exchange rate
  const exchangeRate =
    payToken && payAmount && parseFloat(payAmount) > 0
      ? (parseFloat(receiveAmount) / parseFloat(payAmount)).toFixed(6)
      : "0";

  // Obter nome da rota dos dados da API
  const routeName = quote?.routes?.[0]?.provider || route || "Cross-chain";

  // Calcular price impact
  const priceImpact = quote?.priceImpact || "0";

  return (
    <div className="space-y-4">
      {/* Collapsed Summary */}
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 h-auto justify-between hover:bg-transparent"
      >
        <div className="flex items-center space-x-2 text-xs min-w-0 flex-1">
          <div className="flex items-center space-x-1 min-w-0">
            <Zap className="w-3 h-3 text-orange-500 flex-shrink-0" />
            <span className="text-muted-foreground truncate">{routeName}</span>
          </div>
          {quote && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Shield className="w-3 h-3 text-purple-500" />
              <span className="text-foreground font-medium whitespace-nowrap">
                {Math.abs(parseFloat(priceImpact)).toFixed(2)}%
              </span>
            </div>
          )}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Fuel className="w-3 h-3 text-purple-500" />
            <span className="text-foreground font-medium whitespace-nowrap">
              ${feeInUSD}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
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
          <span className="text-xs font-bold text-foreground whitespace-nowrap">
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
                    Você receberá
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-green-600 border-green-200"
                  >
                    Na rede {receiveToken.network}
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
                <span className="text-sm text-muted-foreground">Rota</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">
                  {routeName}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Melhor Taxa
                </Badge>
              </div>
            </div>

            {/* Exchange Rate */}
            {payToken && exchangeRate !== "0" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Taxa de Câmbio
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  1 {payToken.symbol} = {exchangeRate} {receiveToken.symbol}
                </span>
              </div>
            )}

            {/* Price Impact */}
            {quote && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Impacto no Preço
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    parseFloat(priceImpact) < -5
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {priceImpact}%
                </span>
              </div>
            )}

            {/* Min Received */}
            {quote?.tokenAmountOutMin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">
                    Mín. Recebido
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {parseFloat(quote.tokenAmountOutMin).toFixed(6)}{" "}
                  {receiveToken.symbol}
                </span>
              </div>
            )}

            {/* Slippage */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">
                  Slippage Máx.
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
                    Baixo
                  </Badge>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-3">
              {/* Fee Breakdown */}
              {quote?.fees && quote.fees.length > 0 && (
                <div className="mb-3 space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Detalhamento de Taxas:
                  </span>
                  {quote.fees.map((fee: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground capitalize">
                          Taxa {fee.provider}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        ${parseFloat(fee.value).toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Fee */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fuel className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Taxa Total
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">
                    ${feeInUSD}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {quote?.fees && quote.fees.length > 0
                      ? "Todos Provedores"
                      : "Bridge + Gas"}
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
