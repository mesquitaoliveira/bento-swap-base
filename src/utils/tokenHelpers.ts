import { Token } from "../types";
import { getAllTokens, TokenInfo, generateTokensList } from "./tokensInfo";

// Converte tokens do tokensInfo para o formato usado no componente
export const convertToComponentToken = (
  tokenInfo: TokenInfo & { network: string },
  balance: number = 0
): Token => ({
  id: `${tokenInfo.SYMBOL.toLowerCase()}-${tokenInfo.network
    .toLowerCase()
    .replace(/\s+/g, "-")}`,
  symbol: tokenInfo.SYMBOL,
  name: tokenInfo.NAME,
  network: tokenInfo.network,
  balance: balance,
  icon: tokenInfo.ICON,
  price: 0, // Será atualizado pelo hook de preços
});

// Configuração de balances padrão para demonstração (todos zerados)
export const DEFAULT_BALANCES: Array<{
  symbol: string;
  network: string;
  balance: number;
}> = [
  { symbol: "ETH", network: "Base", balance: 0.0 },
  { symbol: "ETH", network: "Ethereum", balance: 0.0 },
  { symbol: "USDC", network: "Base", balance: 0.0 },
  { symbol: "WBTC", network: "Ethereum", balance: 0.0 },
  { symbol: "USDC", network: "Ethereum", balance: 0.0 },
  { symbol: "USDC", network: "Arbitrum", balance: 0.0 },
  { symbol: "ETH", network: "Arbitrum", balance: 0.0 },
];

// Carrega tokens das redes disponíveis com balances configurados
export const loadTokensWithBalances = (
  customBalances?: Array<{
    symbol: string;
    network: string;
    balance: number;
  }>
): Token[] => {
  // Usa a nova função que carrega todos os tokens das redes configuradas
  const tokensFromConfig = generateTokensList();

  // Se não há balances customizados, usa os tokens da configuração
  if (!customBalances) {
    return tokensFromConfig;
  }

  // Aplica balances customizados se fornecidos
  const allTokensInfo = getAllTokens();

  return customBalances
    .map((tokenBalance) => {
      const tokenInfo = allTokensInfo.find(
        (t) =>
          t.SYMBOL === tokenBalance.symbol && t.network === tokenBalance.network
      );
      return tokenInfo
        ? convertToComponentToken(tokenInfo, tokenBalance.balance)
        : null;
    })
    .filter(Boolean) as Token[];
}; // Obtém todos os tokens disponíveis sem balance específico
export const getAllAvailableTokens = (): Token[] => {
  return generateTokensList();
};

// Atualiza preços dos tokens com dados do CoinGecko
export const updateTokensWithPrices = (
  tokens: Token[],
  prices: { [symbol: string]: number }
): Token[] => {
  return tokens.map((token) => ({
    ...token,
    price: prices[token.symbol] || token.price,
  }));
};

// Obtém símbolos únicos dos tokens para buscar preços
export const getUniqueTokenSymbols = (tokens: Token[]): string[] => {
  const symbols = tokens.map((token) => token.symbol);
  return [...new Set(symbols)];
};
