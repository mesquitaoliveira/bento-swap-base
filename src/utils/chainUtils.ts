import {
  mainnet,
  base,
  arbitrum,
  polygon,
  avalanche,
  optimism,
} from "wagmi/chains";

// Mapeamento de redes para símbolos de tokens nativos
export const NATIVE_TOKEN_SYMBOLS = {
  [mainnet.id]: "ETH",
  [base.id]: "ETH",
  [arbitrum.id]: "ETH",
  [polygon.id]: "MATIC",
  [avalanche.id]: "AVAX",
  [optimism.id]: "ETH",
} as const;

/**
 * Obtém o símbolo do token nativo baseado no ID da rede
 * @param chainId - ID da rede
 * @returns Símbolo do token nativo
 */
export const getNativeTokenSymbol = (chainId?: number): string => {
  return chainId
    ? NATIVE_TOKEN_SYMBOLS[chainId as keyof typeof NATIVE_TOKEN_SYMBOLS] ||
        "ETH"
    : "ETH";
};

// Mapeamento de nomes de rede para IDs de rede (usado no SwapInterface)
export const NETWORK_TO_CHAIN_ID = {
  Base: base.id,
  Ethereum: mainnet.id,
  Arbitrum: arbitrum.id,
  Polygon: polygon.id,
  Avalanche: avalanche.id,
  Optimism: optimism.id,
} as const;
