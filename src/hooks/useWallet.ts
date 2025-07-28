import { useState, useEffect, createContext, useContext } from "react";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  network: string;
  chainId: number | null;
}

export interface WalletContextType {
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  balance: "0",
  network: "Base",
  chainId: null,
};

// Simulação de redes suportadas
const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum", symbol: "ETH" },
  8453: { name: "Base", symbol: "ETH" },
  42161: { name: "Arbitrum", symbol: "ETH" },
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const useWalletState = () => {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simula detecção do MetaMask
  const isMetaMaskInstalled = () => {
    return (
      typeof window !== "undefined" && typeof window.ethereum !== "undefined"
    );
  };

  const connectWallet = async (): Promise<void> => {
    if (!isMetaMaskInstalled()) {
      setError(
        "MetaMask is not installed. Please install MetaMask to continue."
      );
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Simulação da conexão (em produção, usar ethereum.request)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula delay

      // Simulação de dados da wallet conectada
      const mockWalletData: WalletState = {
        isConnected: true,
        address: "0x1234567890abcdef1234567890abcdef12345678",
        balance: "0.0003",
        network: "Base",
        chainId: 8453,
      };

      setWallet(mockWalletData);

      // Em produção, você faria algo como:
      /*
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest']
      });
      */
    } catch (err) {
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = (): void => {
    setWallet(initialWalletState);
    setError(null);
  };

  const switchNetwork = async (chainId: number): Promise<void> => {
    if (!wallet.isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    try {
      setError(null);

      // Simulação de mudança de rede
      const networkInfo =
        SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
      if (!networkInfo) {
        throw new Error("Unsupported network");
      }

      await new Promise((resolve) => setTimeout(resolve, 500)); // Simula delay

      setWallet((prev) => ({
        ...prev,
        chainId,
        network: networkInfo.name,
      }));

      // Em produção:
      /*
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      */
    } catch (err) {
      setError(
        `Failed to switch to ${
          SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
            ?.name || "network"
        }`
      );
    }
  };

  // Monitora mudanças na conta/rede (em produção)
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    // Em produção, você adicionaria listeners:
    /*
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      const networkInfo = SUPPORTED_NETWORKS[numericChainId];
      if (networkInfo) {
        setWallet(prev => ({ 
          ...prev, 
          chainId: numericChainId,
          network: networkInfo.name 
        }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
    */
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isConnecting,
    error,
  };
};

export { WalletContext, SUPPORTED_NETWORKS };
