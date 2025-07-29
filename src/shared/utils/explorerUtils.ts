import {
  mainnet,
  base,
  arbitrum,
  polygon,
  avalanche,
  optimism,
} from "wagmi/chains";

// Mapeamento de redes para URLs dos explorers
export const EXPLORER_URLS = {
  [mainnet.id]: "https://etherscan.io",
  [base.id]: "https://basescan.org",
  [arbitrum.id]: "https://arbiscan.io",
  [polygon.id]: "https://polygonscan.com",
  [avalanche.id]: "https://snowtrace.io",
  [optimism.id]: "https://optimistic.etherscan.io",
} as const;

// Mapeamento de redes para nomes dos explorers
export const EXPLORER_NAMES = {
  [mainnet.id]: "Etherscan",
  [base.id]: "Basescan",
  [arbitrum.id]: "Arbiscan",
  [polygon.id]: "Polygonscan",
  [avalanche.id]: "Snowtrace",
  [optimism.id]: "Optimistic Etherscan",
} as const;

/**
 * Obtém o link do explorer para um endereço baseado na rede
 * @param address - Endereço da wallet ou contrato
 * @param chainId - ID da rede
 * @returns URL completa para o endereço no explorer
 */
export const getExplorerAddressLink = (
  address: string,
  chainId?: number
): string => {
  const baseUrl = chainId
    ? EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS]
    : EXPLORER_URLS[mainnet.id];
  return `${baseUrl}/address/${address}`;
};

/**
 * Obtém o link do explorer para uma transação baseado na rede
 * @param hash - Hash da transação
 * @param chainId - ID da rede
 * @returns URL completa para a transação no explorer
 */
export const getExplorerTransactionLink = (
  hash: string,
  chainId?: number
): string => {
  const baseUrl = chainId
    ? EXPLORER_URLS[chainId as keyof typeof EXPLORER_URLS]
    : EXPLORER_URLS[mainnet.id];
  return `${baseUrl}/tx/${hash}`;
};

/**
 * Obtém o nome do explorer baseado na rede
 * @param chainId - ID da rede
 * @returns Nome do explorer
 */
export const getExplorerName = (chainId?: number): string => {
  return chainId
    ? EXPLORER_NAMES[chainId as keyof typeof EXPLORER_NAMES] || "Explorer"
    : "Etherscan";
};

/**
 * Obtém o link do explorer baseado na rede para uma função genérica
 * @param network - Nome da rede (usado no SwapInterface)
 * @returns URL do explorer
 */
export const getExplorerLinkByNetwork = (
  hash: string,
  network: string
): string => {
  const networkToChainId: Record<string, number> = {
    Ethereum: mainnet.id,
    Base: base.id,
    Arbitrum: arbitrum.id,
    Polygon: polygon.id,
    Avalanche: avalanche.id,
    Optimism: optimism.id,
  };

  const chainId = networkToChainId[network];
  return getExplorerTransactionLink(hash, chainId);
};

/**
 * Obtém o nome do explorer baseado no nome da rede
 * @param network - Nome da rede (usado no SwapInterface)
 * @returns Nome do explorer
 */
export const getExplorerNameByNetwork = (network: string): string => {
  const networkToChainId: Record<string, number> = {
    Ethereum: mainnet.id,
    Base: base.id,
    Arbitrum: arbitrum.id,
    Polygon: polygon.id,
    Avalanche: avalanche.id,
    Optimism: optimism.id,
  };

  const chainId = networkToChainId[network];
  return getExplorerName(chainId);
};
