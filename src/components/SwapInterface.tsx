import React, { useState, useEffect } from "react";
import { Settings, ArrowUpDown, AlertCircle } from "lucide-react";
import TokenInput from "./TokenInput";
import TransactionSummary from "./TransactionSummary";
import AdvancedSettingsModal from "./AdvancedSettingsModal";
import { Token } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useTokenPrices } from "../hooks/useCoinGeckoPrice";
import {
  loadTokensWithBalances,
  updateTokensWithPrices,
  getUniqueTokenSymbols,
} from "../utils/tokenHelpers";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

// Carrega tokens das redes disponíveis com alguns balances de exemplo
const defaultTokens = loadTokensWithBalances();

const SwapInterface: React.FC = () => {
  const [payToken, setPayToken] = useState<Token>(defaultTokens[0]);
  const [receiveToken, setReceiveToken] = useState<Token>(defaultTokens[1]);
  const [payAmount, setPayAmount] = useState<string>("0.0001");
  const [receiveAmount, setReceiveAmount] = useState<string>("0.000099");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [slippage, setSlippage] = useState("0.50");
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokens, setTokens] = useState<Token[]>(defaultTokens);

  // Hook para estado da wallet (Wagmi)
  const { isConnected } = useAccount();

  // Hook para obter preços das moedas
  const tokenSymbols = getUniqueTokenSymbols(tokens);
  const { prices, convertAmount } = useTokenPrices(tokenSymbols);

  // Atualiza os preços dos tokens quando os preços são carregados
  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      const updatedTokens = updateTokensWithPrices(tokens, prices);
      setTokens(updatedTokens);

      // Atualiza os tokens selecionados com os novos preços
      setPayToken((prevToken) => ({
        ...prevToken,
        price: prices[prevToken.symbol] || prevToken.price,
      }));

      setReceiveToken((prevToken) => ({
        ...prevToken,
        price: prices[prevToken.symbol] || prevToken.price,
      }));
    }
  }, [prices]);

  // Recalcula a quantidade de recebimento quando os preços ou quantidade de pagamento mudam
  useEffect(() => {
    if (
      payAmount &&
      payToken.symbol &&
      receiveToken.symbol &&
      Object.keys(prices).length > 0
    ) {
      const convertedAmount = convertAmount(
        payToken.symbol,
        receiveToken.symbol,
        parseFloat(payAmount)
      );
      if (convertedAmount > 0) {
        // Aplica uma pequena taxa de conversão simulada (0.3% de fee)
        const amountWithFee = convertedAmount * 0.997;
        setReceiveAmount(amountWithFee.toFixed(6));
      }
    }
  }, [payAmount, payToken.symbol, receiveToken.symbol, convertAmount, prices]);

  const handleSwapTokens = () => {
    const tempToken = payToken;
    const tempAmount = payAmount;

    setPayToken(receiveToken);
    setReceiveToken(tempToken);
    setPayAmount(receiveAmount);
    setReceiveAmount(tempAmount);
  };

  const handleMaxClick = () => {
    setPayAmount(payToken.balance.toString());

    // Usa a conversão real de preços se disponível
    if (Object.keys(prices).length > 0) {
      const convertedAmount = convertAmount(
        payToken.symbol,
        receiveToken.symbol,
        payToken.balance
      );
      if (convertedAmount > 0) {
        // Aplica taxa de conversão
        const amountWithFee = convertedAmount * 0.997;
        setReceiveAmount(amountWithFee.toFixed(6));
      }
    } else {
      // Fallback para cálculo simples se os preços não estão disponíveis
      const rate = 0.99;
      setReceiveAmount((payToken.balance * rate).toFixed(6));
    }
  };

  const isValidSwap =
    payAmount &&
    parseFloat(payAmount) > 0 &&
    parseFloat(payAmount) <= payToken.balance;

  const handleSwap = async () => {
    if (!isConnected) {
      // O ConnectKit será aberto automaticamente
      return;
    }

    if (!isValidSwap) return;
    setIsSwapping(true);
    // Simulate swap process
    setTimeout(() => setIsSwapping(false), 2000);
  };

  const getSwapButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (isSwapping) {
      return "Processing Swap...";
    }
    if (!payAmount || parseFloat(payAmount) === 0) {
      return "Enter amount";
    }
    return "Swap";
  };

  const isSwapDisabled = () => {
    if (!isConnected) {
      return false; // Allow clicking to connect wallet
    }
    return !payAmount || parseFloat(payAmount) === 0 || isSwapping;
  };
  return (
    <>
      <Card className="shadow-xl border-border max-w-md mx-auto">
        <CardHeader>
          {/* Header */}
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              Swap Tokens
              {Object.keys(prices).length === 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Loading prices...
                </span>
              )}
              {isConnected && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAdvancedSettings(true)}
              className="hover:bg-primary/10 rounded-xl transition-all duration-200 hover:scale-105"
              aria-label="Advanced Settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Wallet Connection Warning */}
          {!isConnected && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-blue-800 font-medium">
                  Wallet not connected
                </p>
                <p className="text-blue-600">
                  Connect your wallet to start swapping tokens
                </p>
              </div>
            </div>
          )}

          {/* You Pay Section */}
          <div className="relative">
            <TokenInput
              token={payToken}
              amount={payAmount}
              onAmountChange={setPayAmount}
              onTokenSelect={setPayToken}
              onMaxClick={handleMaxClick}
              showMax={true}
              tokens={tokens}
              borderRadius="top"
            />
            {/* Swap Direction Button - Sobreposto */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapTokens}
                className="p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg border-2 border-gray-200 hover:border-primary/30"
                aria-label="Swap token positions"
              >
                <ArrowUpDown className="w-5 h-5 text-primary" />
              </Button>
            </div>
            {/* You Receive Section */}
            <div className="">
              <TokenInput
                token={receiveToken}
                amount={receiveAmount}
                onAmountChange={setReceiveAmount}
                onTokenSelect={setReceiveToken}
                showMax={false}
                tokens={tokens}
                readOnly={true}
                borderRadius="bottom"
              />
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <TransactionSummary
                  receiveAmount={receiveAmount}
                  receiveToken={receiveToken}
                  route="Stargate V2 Fast"
                  estimatedTime="20s"
                  slippage={slippage}
                  totalFee="0.77"
                />
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          {!isConnected ? (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <Button
                  onClick={show}
                  className="w-full py-7 px-6 rounded-full font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                >
                  Connect Wallet
                </Button>
              )}
            </ConnectKitButton.Custom>
          ) : (
            <Button
              onClick={handleSwap}
              disabled={isSwapDisabled()}
              className={`w-full py-7 px-6 rounded-full font-bold text-lg ${
                !payAmount || parseFloat(payAmount) === 0
                  ? ""
                  : isSwapping
                  ? "bg-primary text-primary-foreground cursor-wait"
                  : "bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl"
              }`}
            >
              {getSwapButtonText()}
            </Button>
          )}
        </CardContent>
      </Card>

      <AdvancedSettingsModal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
      />
    </>
  );
};

export default SwapInterface;
