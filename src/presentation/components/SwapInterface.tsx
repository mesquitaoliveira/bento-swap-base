import React, { useState, useEffect } from "react";
import { Settings, ArrowUpDown } from "lucide-react";
import TokenInput from "./TokenInput";
import TransactionSummary from "./TransactionSummary";
import AdvancedSettingsModal, {
  convertSlippageToBasisPoints,
} from "./AdvancedSettingsModal";
import { SwapNotifications } from "./SwapNotifications";
import { Token } from "@domain/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useTokenPrices } from "@application/hooks/useCoinGeckoPrice";
import { useTokenBalances } from "@application/hooks/useTokenBalances";
import { useSwap } from "@application/hooks/useSwap";
import {
  loadTokensWithBalances,
  updateTokensWithPrices,
  getUniqueTokenSymbols,
} from "@shared/utils/tokenHelpers";
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
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [tokens] = useState<Token[]>(defaultTokens);

  // Hook para estado da wallet (Wagmi)
  const { isConnected } = useAccount();
  // Hook para chainId atual
  // @ts-ignore
  const { chainId } = window.ethereum || {};

  // Efeito para resetar isNetworkSwitching quando a rede correta for detectada
  useEffect(() => {
    const networkToChainId: Record<string, number> = {
      Ethereum: 1,
      Base: 8453,
      Arbitrum: 42161,
      Optimism: 10,
      Polygon: 137,
      Avalanche: 43114,
    };
    const requiredChainId = networkToChainId[payToken.network] || 1;
    if (isNetworkSwitching && chainId === requiredChainId) {
      setIsNetworkSwitching(false);
    }
  }, [isNetworkSwitching, payToken.network, chainId]);

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
    if (isNetworkSwitching) {
      return "Trocando Rede...";
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
      return "Quote Error - Tentar novamente";
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
      isNetworkSwitching ||
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

  // TODO: Implementar controle de troca de rede com o novo sistema
  // const handleNetworkSwitched = () => {
  //   // Recarregar cotação após trocar de rede
  //   if (
  //     payAmount &&
  //     parseFloat(payAmount) > 0 &&
  //     payToken.symbol &&
  //     receiveToken.symbol
  //   ) {
  //     setTimeout(() => {
  //       getQuote({
  //         fromToken: payToken,
  //         toToken: receiveToken,
  //         amount: payAmount,
  //         selectMode: routePriority,
  //         slippage: convertSlippageToBasisPoints(slippage),
  //       });
  //     }, 1000); // Delay para garantir que a rede foi trocada
  //   }
  // };

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
              {Object.keys(prices).length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Prices loaded ({Object.keys(prices).length})
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
          {/* Notifications */}
          <SwapNotifications
            isConnected={isConnected}
            payToken={payToken}
            receiveToken={receiveToken}
            payAmount={payAmount}
            receiveAmount={receiveAmount}
            quoteError={quoteError}
            executionError={executionError}
            isSuccess={isSuccess}
            transactionHash={transactionHash}
            isNetworkSwitching={isNetworkSwitching}
            isAmountLikelyTooLow={isAmountLikelyTooLow}
            onFixAmount={extractAndApplyMinAmount}
          />

          {/* You Pay Section */}
          <div className="relative">
            <TokenInput
              token={
                tokensWithData.find(
                  (t) =>
                    t.symbol === payToken.symbol &&
                    t.network === payToken.network
                ) || payToken
              }
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
                token={
                  tokensWithData.find(
                    (t) =>
                      t.symbol === receiveToken.symbol &&
                      t.network === receiveToken.network
                  ) || receiveToken
                }
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
                  receiveToken={
                    tokensWithData.find(
                      (t) =>
                        t.symbol === receiveToken.symbol &&
                        t.network === receiveToken.network
                    ) || receiveToken
                  }
                  slippage={slippage}
                  quote={quote}
                  payToken={
                    tokensWithData.find(
                      (t) =>
                        t.symbol === payToken.symbol &&
                        t.network === payToken.network
                    ) || payToken
                  }
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
                  {isSuccess ? "Novo Swap" : "Tentar Novamente"}
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
