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
        CONTRACT_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      WBTC: {
        DECIMALS: 8,
        SYMBOL: "WBTC",
        NAME: "Wrapped Bitcoin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
        CONTRACT_ADDRESS: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      },
      BRZ: {
        DECIMALS: 18,
        SYMBOL: "BRZ",
        NAME: "Brazilian Digital Token",
        ICON: "https://assets.coingecko.com/coins/images/8472/standard/MicrosoftTeams-image_%286%29.png?1696508657",
        CONTRACT_ADDRESS: "0x01d33fd36ec67c6ada32cf36b31e88ee190b1839",
      },
    },
  },
  BASE: {
    chain: {
      CHAIN_ID: 8453,
      DECIMALS: 18,
      SYMBOL: "ETH",
      NAME: "Base",
      ICON: "https://raw.githubusercontent.com/mesquitaoliveira/bento-swap-base/master/src/assets/base-logo.png",
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
      BRZ: {
        DECIMALS: 18,
        SYMBOL: "BRZ",
        NAME: "Brazilian Digital Token",
        ICON: "https://assets.coingecko.com/coins/images/8472/standard/MicrosoftTeams-image_%286%29.png?1696508657",
        CONTRACT_ADDRESS: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4",
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
  POLYGON: {
    chain: {
      CHAIN_ID: 137,
      DECIMALS: 18,
      SYMBOL: "MATIC",
      NAME: "Polygon",
      ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
    },
    tokens: {
      MATIC: {
        DECIMALS: 18,
        SYMBOL: "MATIC",
        NAME: "Polygon",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      },
      BRZ: {
        DECIMALS: 18,
        SYMBOL: "BRZ",
        NAME: "Brazilian Digital Token",
        ICON: "https://assets.coingecko.com/coins/images/8472/standard/MicrosoftTeams-image_%286%29.png?1696508657",
        CONTRACT_ADDRESS: "0x4eD141110F6EeeAbA9A1df36d8c26f684d2475Dc",
      },
    },
  },
  OPTIMISM: {
    chain: {
      CHAIN_ID: 10,
      DECIMALS: 18,
      SYMBOL: "ETH",
      NAME: "Optimism",
      ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
    },
    tokens: {
      ETH: {
        DECIMALS: 18,
        SYMBOL: "ETH",
        NAME: "Ethereum",
        ICON: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      },
      OP: {
        DECIMALS: 18,
        SYMBOL: "OP",
        NAME: "Optimism",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/11840.png",
        CONTRACT_ADDRESS: "0x4200000000000000000000000000000000000042",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      },
      BRZ: {
        DECIMALS: 18,
        SYMBOL: "BRZ",
        NAME: "Brazilian Digital Token",
        ICON: "https://assets.coingecko.com/coins/images/8472/standard/MicrosoftTeams-image_%286%29.png?1696508657",
        CONTRACT_ADDRESS: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4",
      },
    },
  },
  AVALANCHE: {
    chain: {
      CHAIN_ID: 43114,
      DECIMALS: 18,
      SYMBOL: "AVAX",
      NAME: "Avalanche",
      ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
    },
    tokens: {
      AVAX: {
        DECIMALS: 18,
        SYMBOL: "AVAX",
        NAME: "Avalanche",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
      },
      USDC: {
        DECIMALS: 6,
        SYMBOL: "USDC",
        NAME: "USD Coin",
        ICON: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        CONTRACT_ADDRESS: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
      BRZ: {
        DECIMALS: 18,
        SYMBOL: "BRZ",
        NAME: "Brazilian Digital Token",
        ICON: "https://assets.coingecko.com/coins/images/8472/standard/MicrosoftTeams-image_%286%29.png?1696508657",
        CONTRACT_ADDRESS: "0x05539F021b66Fd01d1FB1ff8E167CdD09bf7c2D0",
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

/**
 * Gera uma lista de tokens no formato Token[] para uso nos componentes
 * @returns Array de tokens formatados
 */
export const generateTokensList = (): Array<{
  id: string;
  symbol: string;
  name: string;
  network: string;
  balance: number;
  icon: string;
  price: number;
}> => {
  const tokensList: Array<{
    id: string;
    symbol: string;
    name: string;
    network: string;
    balance: number;
    icon: string;
    price: number;
  }> = [];

  // Preços padrão (serão atualizados pelo hook de preços)
  const defaultPrices: Record<string, number> = {
    ETH: 0,
    USDC: 0,
    WBTC: 0,
    BRZ: 0,
    MATIC: 0,
    AVAX: 0,
    OP: 0,
  };

  Object.entries(TOKENS_INFO).forEach(([networkKey, networkData]) => {
    Object.entries(networkData.tokens).forEach(([tokenKey, tokenInfo]) => {
      const tokenId = `${networkKey.toLowerCase()}-${tokenKey.toLowerCase()}`;

      tokensList.push({
        id: tokenId,
        symbol: tokenInfo.SYMBOL,
        name: tokenInfo.NAME,
        network: networkData.chain.NAME,
        balance: 0, // Balance sempre 0 - será atualizado quando wallet conectar
        icon: tokenInfo.ICON,
        price: defaultPrices[tokenInfo.SYMBOL] || 0,
      });
    });
  });

  return tokensList;
};
