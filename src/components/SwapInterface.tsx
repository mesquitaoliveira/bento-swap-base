import React, { useState, useEffect } from "react";
import { Settings, ArrowUpDown, AlertCircle, ExternalLink } from "lucide-react";
import TokenInput from "./TokenInput";
import TransactionSummary from "./TransactionSummary";
import AdvancedSettingsModal, {
  convertSlippageToBasisPoints,
} from "./AdvancedSettingsModal";
// Para conversões futuras: import { routeOptionsMap } from "./AdvancedSettingsModal";
import { Token } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useTokenPrices } from "../hooks/useCoinGeckoPrice";
import { useTokenBalances } from "../hooks/useTokenBalances";
import { useSwap } from "../hooks/useSwap";
import {
  loadTokensWithBalances,
  updateTokensWithPrices,
  getUniqueTokenSymbols,
} from "../utils/tokenHelpers";
import {
  getExplorerLinkByNetwork,
  getExplorerNameByNetwork,
} from "../utils/explorerUtils";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";

// Carrega tokens das redes disponíveis
const defaultTokens = loadTokensWithBalances();

// Função para obter tokens padrão da rede Base
const getDefaultBaseTokens = () => {
  const baseETH = defaultTokens.find(
    (token) => token.symbol === "ETH" && token.network === "Base"
  );

  const baseUSDC = defaultTokens.find(
    (token) => token.symbol === "USDC" && token.network === "Base"
  );

  return {
    payToken: baseETH || defaultTokens[0], // Fallback para o primeiro token se não encontrar
    receiveToken: baseUSDC || defaultTokens[1],
  };
};

const SwapInterface: React.FC = () => {
  const { payToken: defaultPayToken, receiveToken: defaultReceiveToken } =
    getDefaultBaseTokens();

  const [payToken, setPayToken] = useState<Token>(defaultPayToken);
  const [receiveToken, setReceiveToken] = useState<Token>(defaultReceiveToken);
  const [payAmount, setPayAmount] = useState<string>("0.001");
  const [receiveAmount, setReceiveAmount] = useState<string>("0");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [slippage, setSlippage] = useState("1.0");
  const [routePriority, setRoutePriority] = useState("best_return");
  const [isSwapping, setIsSwapping] = useState(false);
  const [tokens] = useState<Token[]>(defaultTokens);

  // Hook para estado da wallet (Wagmi)
  const { isConnected } = useAccount();

  // Hook para buscar saldos reais da wallet
  const { updateTokensWithBalances } = useTokenBalances(tokens);

  // Hook para swap (quote e execução)
  const {
    quote,
    isLoadingQuote,
    quoteError,
    isExecuting,
    isPending,
    isSuccess,
    executionError,
    transactionHash,
    getQuote,
    executeSwap,
    reset: resetSwap,
  } = useSwap();

  // Hook para obter preços das moedas
  const tokenSymbols = getUniqueTokenSymbols(tokens);
  const { prices, convertAmount } = useTokenPrices(tokenSymbols);

  // Calcula tokens com saldos e preços atualizados
  const tokensWithData = React.useMemo(() => {
    const tokensWithBalances = updateTokensWithBalances(tokens);
    if (Object.keys(prices).length > 0) {
      return updateTokensWithPrices(tokensWithBalances, prices);
    }
    return tokensWithBalances;
  }, [tokens, updateTokensWithBalances, prices]);

  // Busca quote da API quando os parâmetros mudam
  useEffect(() => {
    const fetchQuote = async () => {
      if (
        payAmount &&
        parseFloat(payAmount) > 0 &&
        payToken.symbol &&
        receiveToken.symbol &&
        payToken.network &&
        receiveToken.network &&
        isConnected
      ) {
        try {
          await getQuote({
            fromToken: payToken,
            toToken: receiveToken,
            amount: payAmount,
            selectMode: routePriority,
            slippage: convertSlippageToBasisPoints(slippage),
          });
        } catch (error) {
          // Error handling já é feito pelo hook
        }
      }
    };

    // Debounce para evitar muitas requisições
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [
    payAmount,
    payToken.symbol,
    payToken.network,
    receiveToken.symbol,
    receiveToken.network,
    routePriority,
    slippage,
    isConnected,
    getQuote,
    convertSlippageToBasisPoints,
  ]);

  // Atualiza o amount de recebimento quando a quote é recebida
  useEffect(() => {
    if (quote?.tokenAmountOut) {
      setReceiveAmount(parseFloat(quote.tokenAmountOut).toFixed(6));
    }
  }, [quote]);

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
      return;
    }

    if (!isValidSwap || !quote) return;

    try {
      setIsSwapping(true);
      await executeSwap();
    } catch (error) {
      // Error handling já é feito pelo hook
    } finally {
      setIsSwapping(false);
    }
  };

  const getSwapButtonText = () => {
    if (!isConnected) {
      return "Connect Wallet";
    }
    if (isLoadingQuote) {
      return "Getting Quote...";
    }
    if (isExecuting || isPending) {
      return "Processing Swap...";
    }
    if (isSwapping) {
      return "Processing Swap...";
    }
    if (!payAmount || parseFloat(payAmount) === 0) {
      return "Enter amount";
    }
    if (quoteError) {
      return "Quote Error - Try Again";
    }
    if (!quote) {
      return "Get Quote";
    }
    return "Swap";
  };

  const isSwapDisabled = () => {
    if (!isConnected) {
      return false;
    }
    return (
      !payAmount ||
      parseFloat(payAmount) === 0 ||
      isSwapping ||
      isLoadingQuote ||
      isExecuting ||
      isPending ||
      !quote
    );
  };

  // Função para extrair valor mínimo do erro e aplicar automaticamente

  // Função para extrair valor mínimo do erro e aplicar automaticamente
  const extractAndApplyMinAmount = (errorMessage: string) => {
    // Tentar extrair o valor mínimo da mensagem "Min amount: X"
    let minAmountMatch = errorMessage.match(/Min amount: ([\d.]+)/);

    // Se não encontrou, tentar extrair da mensagem de fee
    if (!minAmountMatch) {
      const feeMatch = errorMessage.match(/less than fee ([\d.]+)/);
      if (feeMatch) {
        // Usar o valor da fee * 2 como estimativa segura
        const feeAmount = parseFloat(feeMatch[1]);
        const suggestedAmount = (feeAmount * 2).toString();
        setPayAmount(suggestedAmount);

        setTimeout(() => {
          if (payToken && receiveToken) {
            const params = {
              fromToken: payToken,
              toToken: receiveToken,
              amount: suggestedAmount,
            };
            getQuote(params);
          }
        }, 500);
        return;
      }
    }

    if (minAmountMatch) {
      const minAmount = minAmountMatch[1];
      setPayAmount(minAmount);
      // Limpar o erro após aplicar o valor mínimo
      setTimeout(() => {
        if (payToken && receiveToken) {
          const params = {
            fromToken: payToken,
            toToken: receiveToken,
            amount: minAmount,
            selectMode: routePriority,
            slippage: convertSlippageToBasisPoints(slippage),
          };
          getQuote(params);
        }
      }, 500);
    }
  };

  // Função para validar se o valor pode estar muito baixo
  const isAmountLikelyTooLow = () => {
    if (!payAmount || !payToken) return false;
    const amount = parseFloat(payAmount);

    // Estimativas baseadas no tipo de token
    if (payToken.symbol === "ETH" && amount < 0.0001) return true;
    if (payToken.symbol === "BTC" && amount < 0.00001) return true;
    if (["USDC", "USDT", "DAI"].includes(payToken.symbol) && amount < 0.1)
      return true;

    return false;
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

          {/* Low Amount Warning */}
          {!quoteError && isAmountLikelyTooLow() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">
                  Amount might be too low
                </p>
                <p className="text-yellow-600">
                  This amount might be below the minimum required for swapping.
                  Consider increasing it.
                </p>
              </div>
            </div>
          )}

          {/* Quote Error */}
          {quoteError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-sm flex-1">
                <p className="text-red-800 font-medium">
                  {quoteError.includes("Amount is too low")
                    ? "Amount Too Low"
                    : quoteError.includes("less than fee")
                    ? "Amount Below Fee"
                    : "Quote Error"}
                </p>
                <p className="text-red-600">{quoteError}</p>
                {(quoteError.includes("Min amount") ||
                  quoteError.includes("less than fee")) && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-red-500 text-xs">
                      💡{" "}
                      {quoteError.includes("less than fee")
                        ? "Amount is less than transaction fee"
                        : "Try increasing the amount you want to swap"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => extractAndApplyMinAmount(quoteError)}
                      className="text-xs h-6 px-2 border-red-300 text-red-700 hover:bg-red-100"
                    >
                      {quoteError.includes("less than fee")
                        ? "Use Safe Amount"
                        : "Use Min Amount"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Execution Error */}
          {executionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="text-sm flex-1 min-w-0">
                <p className="text-red-800 font-medium">
                  {executionError.includes("User rejected") || executionError.includes("usuário rejeitou")
                    ? "Transação Cancelada"
                    : "Erro na Transação"}
                </p>
                <p className="text-red-600 break-words">
                  {executionError.includes("User rejected") || executionError.includes("usuário rejeitou")
                    ? "Você cancelou a transação. Nenhum valor foi transferido."
                    : executionError}
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {isSuccess && transactionHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="text-sm">
                  <p className="text-green-800 font-medium">Swap Successful!</p>
                  <p className="text-green-600">
                    {payAmount} {payToken.symbol} → {receiveAmount}{" "}
                    {receiveToken.symbol}
                  </p>
                </div>
              </div>

              <div className="bg-white/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium">
                    Network:
                  </span>
                  <span className="text-xs text-green-600">
                    {payToken.network}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-700 font-medium">
                    Transaction Hash:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-mono">
                      {transactionHash.slice(0, 8)}...
                      {transactionHash.slice(-6)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                      onClick={() =>
                        navigator.clipboard.writeText(transactionHash)
                      }
                      title="Copy transaction hash"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 border-green-300 text-green-700 hover:bg-green-100 font-medium"
                onClick={() =>
                  window.open(
                    getExplorerLinkByNetwork(transactionHash, payToken.network),
                    "_blank"
                  )
                }
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View Transaction on {getExplorerNameByNetwork(payToken.network)}
              </Button>
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
              tokens={tokensWithData}
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
                tokens={tokensWithData}
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
                  slippage={slippage}
                  quote={quote}
                  payToken={payToken}
                  payAmount={payAmount}
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
            <div className="space-y-3">
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

              {/* Reset button for errors or completed transactions */}
              {(quoteError || executionError || isSuccess) && (
                <Button
                  onClick={() => {
                    resetSwap();
                    setPayAmount("0.001");
                    setReceiveAmount("0");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  {isSuccess ? "New Swap" : "Try Again"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AdvancedSettingsModal
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        slippage={slippage}
        onSlippageChange={setSlippage}
        routePriority={routePriority}
        onRoutePriorityChange={setRoutePriority}
      />
    </>
  );
};

export default SwapInterface;
