import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useSwapQuote } from "./useSwapQuote";
import { useSwapExecution } from "./useSwapExecution";
import { Token } from "@domain/types";
import { getTokenInfo, getChainInfo } from "@shared/utils/tokensInfo";
import { NETWORK_TO_CHAIN_ID } from "@shared/utils/chainUtils";

interface SwapParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  selectMode?: string; // "fastest", "cheapest", "best_return", "best_price"
  slippage?: number; // Em basis points (ex: 200 = 2.0%)
}

interface UseSwapResult {
  // Quote data
  quote: any;
  isLoadingQuote: boolean;
  quoteError: string | null;

  // Execution data
  isExecuting: boolean;
  isPending: boolean;
  isSuccess: boolean;
  executionError: string | null;
  transactionHash: string | null;

  // Functions
  getQuote: (params: SwapParams) => Promise<void>;
  executeSwap: () => Promise<void>;
  reset: () => void;
}

// Função para verificar se um token é nativo da rede
const isNativeToken = (token: Token): boolean => {
  const chainInfo = getChainInfo(token.network);
  return chainInfo ? token.symbol === chainInfo.SYMBOL : false;
};

export const useSwap = (): UseSwapResult => {
  const { address: walletAddress } = useAccount();

  const {
    quote,
    isLoading: isLoadingQuote,
    error: quoteError,
    fetchQuote,
    clearQuote,
  } = useSwapQuote();

  const {
    isExecuting,
    isPending,
    isSuccess,
    error: executionError,
    transactionHash,
    executeSwap: executeTransaction,
    reset: resetExecution,
  } = useSwapExecution();

  const getQuote = useCallback(
    async (params: SwapParams) => {
      const { fromToken, toToken, amount, selectMode, slippage } = params;

      // Converte nomes de rede para chain IDs
      const fromChainId =
        NETWORK_TO_CHAIN_ID[
          fromToken.network as keyof typeof NETWORK_TO_CHAIN_ID
        ];
      const toChainId =
        NETWORK_TO_CHAIN_ID[
          toToken.network as keyof typeof NETWORK_TO_CHAIN_ID
        ];

      if (!fromChainId || !toChainId) {
        throw new Error("Unsupported network");
      }

      // Verifica se os tokens são nativos
      const isFromNative = isNativeToken(fromToken);
      const isToNative = isNativeToken(toToken);

      // Monta a requisição baseada no tipo de tokens
      const requestData: any = {
        fromChainId,
        toChainId,
        amount,
        from: walletAddress || "",
        to: walletAddress || "", 
      };

      // Adicionar selectMode e slippage se fornecidos
      if (selectMode) {
        requestData.selectMode = selectMode;
      }

      if (slippage !== undefined) {
        requestData.slippage = slippage;
      }

      if (isFromNative) {
        // Token de entrada é nativo
        requestData.useNativeTokenIn = true;

        if (!isToNative) {
          // Token de saída não é nativo
          const toTokenInfo = getTokenInfo(toToken.network, toToken.symbol);
          if (!toTokenInfo) {
            throw new Error(
              `Token info not found for ${toToken.symbol} on ${toToken.network}`
            );
          }
          requestData.customTokenOut = {
            address: toTokenInfo.CONTRACT_ADDRESS,
            symbol: toTokenInfo.SYMBOL,
            decimals: toTokenInfo.DECIMALS,
            chainId: toChainId,
          };
        } else {
          // Token de saída também é nativo
          requestData.useNativeTokenOut = true;
        }
      } else {
        // Token de entrada não é nativo
        const fromTokenInfo = getTokenInfo(fromToken.network, fromToken.symbol);
        if (!fromTokenInfo) {
          throw new Error(
            `Token info not found for ${fromToken.symbol} on ${fromToken.network}`
          );
        }

        if (isToNative) {
          // Token de saída é nativo
          requestData.useNativeTokenOut = true;
          requestData.customTokenIn = {
            address: fromTokenInfo.CONTRACT_ADDRESS,
            symbol: fromTokenInfo.SYMBOL,
            decimals: fromTokenInfo.DECIMALS,
            chainId: fromChainId,
          };
        } else {
          // Ambos tokens não são nativos (modo antigo)
          const toTokenInfo = getTokenInfo(toToken.network, toToken.symbol);
          if (!toTokenInfo) {
            throw new Error(
              `Token info not found for ${toToken.symbol} on ${toToken.network}`
            );
          }
          requestData.tokenIn = fromToken.symbol;
          requestData.customTokenOut = {
            address: toTokenInfo.CONTRACT_ADDRESS,
            symbol: toTokenInfo.SYMBOL,
            decimals: toTokenInfo.DECIMALS,
            chainId: toChainId,
          };
        }
      }

      await fetchQuote(requestData);
    },
    [fetchQuote]
  );

  const executeSwap = useCallback(async () => {
    if (!quote?.transactionRequest) {
      throw new Error("No quote available");
    }

    await executeTransaction({
      to: quote.transactionRequest.to,
      data: quote.transactionRequest.data,
      value: quote.transactionRequest.value,
      chainId: quote.transactionRequest.chainId,
    });
  }, [quote, executeTransaction]);

  const reset = useCallback(() => {
    clearQuote();
    resetExecution();
  }, [clearQuote, resetExecution]);

  return {
    // Quote data
    quote,
    isLoadingQuote,
    quoteError,

    // Execution data
    isExecuting,
    isPending,
    isSuccess,
    executionError,
    transactionHash,

    // Functions
    getQuote,
    executeSwap,
    reset,
  };
};
