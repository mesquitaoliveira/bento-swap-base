export interface Token {
  id: string;
  symbol: string;
  name: string;
  network: string;
  balance: number;
  icon: string;
  price: number;
}

export interface SwapRoute {
  name: string;
  estimatedTime: string;
  fee: string;
  rate: number;
}

export interface TransactionSettings {
  slippage: string;
  gasOption: string;
  routePriority: string;
}