import { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { getBalance } from "@wagmi/core";
import { config } from "../components/Web3Provider";
import { Token } from "../types";
import { getTokenInfo, getChainInfo } from "../utils/tokensInfo";

interface TokenBalance {
  tokenId: string;
  balance: number;
  isLoading: boolean;
  error?: string;
}

interface UseTokenBalancesResult {
  balances: Record<string, TokenBalance>;
  isLoading: boolean;
  updateTokensWithBalances: (tokens: Token[]) => Token[];
}

// Mapeia nomes de rede para chain IDs
const NETWORK_TO_CHAIN_ID = {
  Base: 8453,
  Ethereum: 1,
  Arbitrum: 42161,
  Polygon: 137,
  Avalanche: 43114,
  Optimism: 10,
} as const;

// Endereços especiais para tokens nativos que têm representação ERC-20
const NATIVE_TOKEN_ADDRESSES = {
  // Optimism - OP token nativo
  [10]: {
    OP: "0x4200000000000000000000000000000000000042",
  },
  // Polygon - MATIC token nativo
  [137]: {
    MATIC: "0x0000000000000000000000000000000000001010",
  },
} as const;

export const useTokenBalances = (tokens: Token[]): UseTokenBalancesResult => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [balances, setBalances] = useState<Record<string, TokenBalance>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar saldo de um token específico
  const fetchTokenBalance = async (
    token: Token,
    walletAddress: string
  ): Promise<{ balance: number; error?: string }> => {
    try {
      const chainInfo = getChainInfo(token.network);
      const tokenInfo = getTokenInfo(token.network, token.symbol);

      if (!chainInfo || !tokenInfo) {
        return { balance: 0, error: "Token or chain info not found" };
      }

      const targetChainId =
        NETWORK_TO_CHAIN_ID[token.network as keyof typeof NETWORK_TO_CHAIN_ID];
      if (!targetChainId) {
        return { balance: 0, error: "Unsupported network" };
      }

      // Para tokens nativos, verificar se há endereço especial
      const isNativeToken = token.symbol === chainInfo.SYMBOL;
      let tokenAddress: string | undefined;

      if (isNativeToken) {
        // Verificar se há endereço especial para o token nativo desta rede
        const nativeAddresses =
          NATIVE_TOKEN_ADDRESSES[
            targetChainId as keyof typeof NATIVE_TOKEN_ADDRESSES
          ];
        if (nativeAddresses && token.symbol in nativeAddresses) {
          tokenAddress =
            nativeAddresses[token.symbol as keyof typeof nativeAddresses];
        }
        // Se não há endereço especial, deixa undefined (usa saldo nativo)
      } else {
        // Para tokens ERC-20, usa o endereço do contrato
        tokenAddress = tokenInfo.CONTRACT_ADDRESS;
      }

      const balanceResult = await getBalance(config, {
        address: walletAddress as `0x${string}`,
        chainId: targetChainId,
        token: tokenAddress as `0x${string}` | undefined,
      });

      // Converte de Wei para unidades decimais
      const balance = Number(balanceResult.formatted);
      return { balance };
    } catch (error) {
      return { balance: 0, error: "Failed to fetch balance" };
    }
  };

  // Função para buscar todos os saldos
  const fetchAllBalances = async () => {
    if (!address || !isConnected || tokens.length === 0) {
      return;
    }

    setIsLoading(true);
    const newBalances: Record<string, TokenBalance> = {};

    // Busca saldos em paralelo
    const balancePromises = tokens.map(async (token) => {
      const result = await fetchTokenBalance(token, address);
      return {
        tokenId: token.id,
        balance: result.balance,
        error: result.error,
      };
    });

    try {
      const results = await Promise.all(balancePromises);

      results.forEach(({ tokenId, balance, error }) => {
        newBalances[tokenId] = {
          tokenId,
          balance,
          isLoading: false,
          error,
        };
      });

      setBalances(newBalances);
    } catch (error) {
      // Error handling silencioso
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para buscar saldos quando conectar wallet ou tokens mudarem
  useEffect(() => {
    if (isConnected && address && tokens.length > 0) {
      fetchAllBalances();
    } else {
      // Limpa saldos quando desconectar
      setBalances({});
    }
  }, [address, isConnected, tokens.length, chainId]);

  // Função para atualizar tokens com saldos reais
  const updateTokensWithBalances = (tokensToUpdate: Token[]): Token[] => {
    if (!isConnected) {
      // Se não conectado, retorna tokens com saldo 0
      return tokensToUpdate.map((token) => ({ ...token, balance: 0 }));
    }

    return tokensToUpdate.map((token) => {
      const tokenBalance = balances[token.id];
      return {
        ...token,
        balance: tokenBalance?.balance ?? 0,
      };
    });
  };

  return {
    balances,
    isLoading,
    updateTokensWithBalances,
  };
};
