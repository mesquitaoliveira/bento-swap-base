// Default fallback logo
export const DEFAULT_TOKEN_LOGO =
  "https://app.symbiosis.finance/41705b8e3d5d3113c45d.png";

export interface ChainInfo {
  CHAIN_ID: number;
  DECIMALS: number;
  SYMBOL: string;
  NAME: string;
  ICON: string;
}

export interface TokenInfo {
  DECIMALS: number;
  SYMBOL: string;
  NAME: string;
  ICON: string;
  CONTRACT_ADDRESS?: string;
}

export interface NetworkTokens {
  chain: ChainInfo;
  tokens: Record<string, TokenInfo>;
}

export const TOKENS_INFO: Record<string, NetworkTokens> = {
  ETHEREUM: {
    chain: {
      CHAIN_ID: 1,
      DECIMALS: 18,
      SYMBOL: "ETH",
      NAME: "Ethereum",
      ICON: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
    },
    tokens: {
      ETH: {
        DECIMALS: 18,
        SYMBOL: "ETH",
        NAME: "Ethereum",
        ICON: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0xA0b86a33E6417c5B0E9aE8a60b1F5c9e0a5F9d0e",
      },
      WBTC: {
        DECIMALS: 8,
        SYMBOL: "WBTC",
        NAME: "Wrapped Bitcoin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
        CONTRACT_ADDRESS: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      },
    },
  },
  BASE: {
    chain: {
      CHAIN_ID: 8453,
      DECIMALS: 18,
      SYMBOL: "ETH",
      NAME: "Base",
      ICON: "https://raw.githubusercontent.com/allush/assets/main/images/blockchains/base/logo.png",
    },
    tokens: {
      ETH: {
        DECIMALS: 18,
        SYMBOL: "ETH",
        NAME: "Ethereum",
        ICON: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      },
    },
  },
  ARBITRUM: {
    chain: {
      CHAIN_ID: 42161,
      DECIMALS: 18,
      SYMBOL: "ETH",
      NAME: "Arbitrum",
      ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
    },
    tokens: {
      ETH: {
        DECIMALS: 18,
        SYMBOL: "ETH",
        NAME: "Ethereum",
        ICON: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      },
    },
  },
};

// Utility functions
export const getChainInfo = (networkName: string): ChainInfo | null => {
  return TOKENS_INFO[networkName.toUpperCase()]?.chain || null;
};

export const getTokenInfo = (
  networkName: string,
  tokenSymbol: string
): TokenInfo | null => {
  return (
    TOKENS_INFO[networkName.toUpperCase()]?.tokens[tokenSymbol.toUpperCase()] ||
    null
  );
};

export const getAllNetworks = (): string[] => {
  return Object.keys(TOKENS_INFO);
};

export const getTokensForNetwork = (
  networkName: string
): Record<string, TokenInfo> => {
  return TOKENS_INFO[networkName.toUpperCase()]?.tokens || {};
};

export const getAllTokens = (): Array<TokenInfo & { network: string }> => {
  const allTokens: Array<TokenInfo & { network: string }> = [];

  Object.values(TOKENS_INFO).forEach((networkData) => {
    Object.values(networkData.tokens).forEach((token) => {
      allTokens.push({
        ...token,
        network: networkData.chain.NAME,
      });
    });
  });

  return allTokens;
};
