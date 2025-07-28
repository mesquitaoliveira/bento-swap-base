import { useState, useCallback } from "react";
import { useAccount } from "wagmi";

// Tipos para a requisição
interface SwapQuoteRequest {
  fromChainId: number;
  toChainId: number;
  amount: string;
  from: string;
  to: string;
  // Configurações do usuário
  selectMode?: string; // "fastest", "cheapest", "best_return", "best_price"
  slippage?: number; // Em basis points (ex: 200 = 2.0%)
  // Para tokens nativos de entrada
  useNativeTokenIn?: boolean;
  tokenIn?: string;
  customTokenIn?: {
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
  };
  // Para tokens nativos de saída
  useNativeTokenOut?: boolean;
  customTokenOut?: {
    address: string;
    symbol: string;
    decimals: number;
    chainId: number;
  };
}

// Tipos para a resposta
interface TokenInfo {
  address: string;
  symbol: string;
  chainId: number;
  decimals: number;
}

interface Route {
  provider: string;
  tokens: TokenInfo[];
}

interface Fee {
  provider: string;
  value: string;
}

interface TransactionRequest {
  chainId: number;
  to: string;
  data: string;
  value: string;
}

interface SwapQuoteResponse {
  selectMode: string;
  transactionType: string;
  tokenAmountOut: string;
  tokenAmountOutMin: string;
  priceImpact: string;
  approveTo: string;
  routes: Route[];
  fees: Fee[];
  transactionRequest: TransactionRequest;
}

interface UseSwapQuoteResult {
  quote: SwapQuoteResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchQuote: (params: Omit<SwapQuoteRequest, "from" | "to">) => Promise<void>;
  clearQuote: () => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://bento-swap-api.vercel.app";

export const useSwapQuote = (): UseSwapQuoteResult => {
  const { address } = useAccount();
  const [quote, setQuote] = useState<SwapQuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(
    async (params: Omit<SwapQuoteRequest, "from" | "to">) => {
      if (!address) {
        setError("Wallet not connected");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const requestData: SwapQuoteRequest = {
          ...params,
          from: address,
          to: address,
        };

        // Incluir selectMode e slippage apenas se fornecidos
        if (params.selectMode) {
          requestData.selectMode = params.selectMode;
        }

        if (params.slippage !== undefined) {
          requestData.slippage = params.slippage;
        }
        console.log("Fetching quote with params:", requestData);

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Adicionar API key se disponível
        if (import.meta.env.VITE_BENTO_API_KEY) {
          headers["Authorization"] = `Bearer ${
            import.meta.env.VITE_BENTO_API_KEY
          }`;
        }

        const response = await fetch(`${API_BASE_URL}/api/quote`, {
          method: "POST",
          headers,
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Tratar erros específicos
          if (response.status === 401) {
            throw new Error("API authentication failed. Check your API key.");
          }

          if (response.status === 404) {
            throw new Error("API endpoint not found. Check the API URL.");
          }

          // Tratar mensagens específicas da API
          if (errorData.error) {
            throw new Error(errorData.error);
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const quoteData: SwapQuoteResponse = await response.json();
        setQuote(quoteData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch quote";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  const clearQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
    clearQuote,
  };
};
