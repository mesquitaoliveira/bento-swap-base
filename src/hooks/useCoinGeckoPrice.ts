import { useState, useEffect, useCallback, useRef } from "react";

export interface CoinGeckoPriceData {
  [coinId: string]: {
    usd: number;
  };
}

export interface UseCoinGeckoPriceReturn {
  prices: { [coinId: string]: number };
  loading: boolean;
  error: string | null;
  fetchPrices: (coinIds: string[]) => Promise<void>;
  convertAmount: (
    fromCoinId: string,
    toCoinId: string,
    amount: number
  ) => number;
}

// Cache global para preços com timestamp
interface CacheEntry {
  data: { [coinId: string]: number };
  timestamp: number;
}

const priceCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
const REQUEST_DELAY = 1200; // 1.2 segundos entre requests (50 calls/min max)
const MAX_COINS_PER_REQUEST = 50; // Limite de coins por request

// Queue para controlar requests
let lastRequestTime = 0;
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

// Mapeamento de símbolos para IDs do CoinGecko
const COIN_ID_MAP: { [symbol: string]: string } = {
  ETH: "ethereum",
  BTC: "bitcoin",
  WBTC: "wrapped-bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  BNB: "binancecoin",
  ADA: "cardano",
  DOT: "polkadot",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  COMP: "compound-governance-token",
  MKR: "maker",
  SNX: "havven",
  YFI: "yearn-finance",
  SUSHI: "sushi",
  // Adiciona alguns aliases comuns
  WETH: "ethereum", // Wrapped ETH tem o mesmo preço que ETH
  ETHEREUM: "ethereum",
  BITCOIN: "bitcoin",
};

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Função para processar queue de requests com rate limiting
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < REQUEST_DELAY) {
      await new Promise((resolve) =>
        setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest)
      );
    }

    const request = requestQueue.shift();
    if (request) {
      lastRequestTime = Date.now();
      await request();
    }
  }

  isProcessingQueue = false;
};

// Função para verificar cache
const getCachedPrices = (
  coinIds: string[]
): { [key: string]: number } | null => {
  const cacheKey = coinIds.sort().join(",");
  const cached = priceCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  return null;
};

// Função para salvar no cache
const setCachedPrices = (
  coinIds: string[],
  prices: { [key: string]: number }
) => {
  const cacheKey = coinIds.sort().join(",");
  priceCache.set(cacheKey, {
    data: prices,
    timestamp: Date.now(),
  });
};

// Função para dividir array em chunks
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const useCoinGeckoPrice = (): UseCoinGeckoPriceReturn => {
  const [prices, setPrices] = useState<{ [coinId: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (coinIds: string[]) => {
    if (coinIds.length === 0) return;

    // Primeiro verifica o cache
    const cachedPrices = getCachedPrices(coinIds);
    if (cachedPrices) {
      setPrices((prevPrices) => ({
        ...prevPrices,
        ...cachedPrices,
      }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Converte símbolos para IDs do CoinGecko se necessário
      const geckoIds = coinIds.map((id) => {
        if (id.includes("-") || Object.values(COIN_ID_MAP).includes(id)) {
          return id;
        }
        return COIN_ID_MAP[id.toUpperCase()] || id.toLowerCase();
      });

      const uniqueIds = [...new Set(geckoIds)].filter(Boolean);

      if (uniqueIds.length === 0) {
        throw new Error("No valid coin IDs found");
      }

      // Divide em chunks para não exceder o limite por request
      const chunks = chunkArray(uniqueIds, MAX_COINS_PER_REQUEST);
      const allPrices: { [key: string]: number } = {};

      // Processa cada chunk com rate limiting
      for (const chunk of chunks) {
        await new Promise<void>((resolve, reject) => {
          const requestFunction = async () => {
            try {
              const idsParam = chunk.join(",");
              const url = `${COINGECKO_API_BASE}/simple/price?ids=${idsParam}&vs_currencies=usd`;

              const response = await fetch(url);

              if (!response.ok) {
                if (response.status === 429) {
                  throw new Error(
                    "Rate limit exceeded. Please wait before making more requests."
                  );
                }
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data: CoinGeckoPriceData = await response.json();

              // Mapeia os preços de volta para os IDs originais
              coinIds.forEach((originalId, index) => {
                const geckoId = geckoIds[index];
                if (data[geckoId]?.usd) {
                  allPrices[originalId] = data[geckoId].usd;
                }
              });

              resolve();
            } catch (err) {
              reject(err);
            }
          };

          requestQueue.push(requestFunction);
          processRequestQueue();
        });
      }

      // Cache os resultados
      setCachedPrices(coinIds, allPrices);

      setPrices((prevPrices) => ({
        ...prevPrices,
        ...allPrices,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch prices";
      setError(errorMessage);

      // Em caso de rate limit, aguarda antes de permitir nova tentativa
      if (errorMessage.includes("Rate limit")) {
        setTimeout(() => setError(null), 60000); // Remove erro após 1 minuto
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const convertAmount = useCallback(
    (fromCoinId: string, toCoinId: string, amount: number): number => {
      const fromPrice = prices[fromCoinId];
      const toPrice = prices[toCoinId];

      if (!fromPrice || !toPrice || amount <= 0) {
        return 0;
      }

      // Converte para USD primeiro, depois para a moeda de destino
      const usdValue = amount * fromPrice;
      const convertedAmount = usdValue / toPrice;

      return convertedAmount;
    },
    [prices]
  );

  return {
    prices,
    loading,
    error,
    fetchPrices,
    convertAmount,
  };
};

// Hook auxiliar para buscar preços automaticamente baseado em tokens
export const useTokenPrices = (tokenSymbols: string[]) => {
  const { prices, loading, error, fetchPrices, convertAmount } =
    useCoinGeckoPrice();
  const lastFetchRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  const smartFetchPrices = useCallback(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    // Só faz fetch se passou tempo suficiente (mínimo 2 minutos)
    if (timeSinceLastFetch >= CACHE_DURATION) {
      lastFetchRef.current = now;
      fetchPrices(tokenSymbols);
    }
  }, [tokenSymbols, fetchPrices]);

  useEffect(() => {
    if (tokenSymbols.length > 0) {
      smartFetchPrices();
    }
  }, [tokenSymbols, smartFetchPrices]);

  // Atualiza preços a cada 5 minutos (reduzido de 30 segundos)
  useEffect(() => {
    if (tokenSymbols.length === 0) return;

    // Limpa interval anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      smartFetchPrices();
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tokenSymbols, smartFetchPrices]);

  return {
    prices,
    loading,
    error,
    convertAmount,
    refetchPrices: () => {
      lastFetchRef.current = 0; // Reset para forçar novo fetch
      smartFetchPrices();
    },
  };
};

export default useCoinGeckoPrice;
