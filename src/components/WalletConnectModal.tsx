import React from "react";
import { X, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useConnect } from "wagmi";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MetaMaskIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M30.1 1.5L18.2 10.3L20.5 4.8L30.1 1.5Z" fill="#E17726" />
    <path d="M1.9 1.5L13.6 10.4L11.5 4.8L1.9 1.5Z" fill="#E27625" />
    <path
      d="M25.7 23.3L22.7 27.9L29.4 29.8L31.4 23.5L25.7 23.3Z"
      fill="#E27625"
    />
    <path d="M0.7 23.5L2.7 29.8L9.4 27.9L6.4 23.3L0.7 23.5Z" fill="#E27625" />
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path
      d="M9.5 12.8C13.8 8.5 20.8 8.5 25.1 12.8L25.8 13.5C26 13.7 26 14 25.8 14.2L24 16C23.9 16.1 23.7 16.1 23.6 16L22.7 15.1C19.9 12.3 15.3 12.3 12.5 15.1L11.5 16.1C11.4 16.2 11.2 16.2 11.1 16L9.3 14.2C9.1 14 9.1 13.7 9.3 13.5L9.5 12.8Z"
      fill="#3B99FC"
    />
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="16" fill="#0052FF" />
    <path
      d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C21.5 26 26 21.5 26 16C26 10.5 21.5 6 16 6ZM20 17H17V20C17 20.6 16.6 21 16 21C15.4 21 15 20.6 15 20V17H12C11.4 17 11 16.6 11 16C11 15.4 11.4 15 12 15H15V12C15 11.4 15.4 11 16 11C16.6 11 17 11.4 17 12V15H20C20.6 15 21 15.4 21 16C21 16.6 20.6 17 20 17Z"
      fill="white"
    />
  </svg>
);

const BrowserWalletIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="16" fill="#8B5CF6" />
    <path
      d="M16 8C11.6 8 8 11.6 8 16C8 20.4 11.6 24 16 24C20.4 24 24 20.4 24 16C24 11.6 20.4 8 16 8ZM16 22C12.7 22 10 19.3 10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16C22 19.3 19.3 22 16 22Z"
      fill="white"
    />
    <circle cx="16" cy="13" r="1.5" fill="white" />
    <circle cx="13" cy="16" r="1.5" fill="white" />
    <circle cx="19" cy="16" r="1.5" fill="white" />
    <circle cx="16" cy="19" r="1.5" fill="white" />
  </svg>
);

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connectors, connect, isPending } = useConnect();

  const walletInfo = {
    metaMask: {
      name: "MetaMask",
      description: "Connect using MetaMask wallet",
      icon: <MetaMaskIcon />,
      color: "bg-orange-50 border-orange-200",
    },
    walletConnect: {
      name: "WalletConnect",
      description: "Connect using WalletConnect protocol",
      icon: <WalletConnectIcon />,
      color: "bg-blue-50 border-blue-200",
    },
    coinbaseWallet: {
      name: "Coinbase Wallet",
      description: "Connect using Coinbase Wallet",
      icon: <CoinbaseIcon />,
      color: "bg-blue-50 border-blue-200",
    },
    injected: {
      name: "Browser Wallet",
      description: "Connect using installed browser wallet",
      icon: <BrowserWalletIcon />,
      color: "bg-purple-50 border-purple-200",
    },
  };

  const getWalletInfo = (connectorId: string) => {
    if (connectorId.toLowerCase().includes("metamask")) {
      return walletInfo.metaMask;
    }
    if (connectorId.toLowerCase().includes("walletconnect")) {
      return walletInfo.walletConnect;
    }
    if (connectorId.toLowerCase().includes("coinbase")) {
      return walletInfo.coinbaseWallet;
    }
    return walletInfo.injected;
  };

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      console.error("Erro ao conectar:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Connect Wallet
              </h2>
              <p className="text-sm text-gray-500">
                Choose your preferred wallet
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-3">
            {connectors
              .filter(
                (connector) => connector.id !== "injected" || window?.ethereum
              )
              .map((connector) => {
                const info = getWalletInfo(connector.id);
                return (
                  <Button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending}
                    variant="outline"
                    className="w-full flex items-center justify-between p-4 h-auto border-2 border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center border-2`}
                      >
                        {info.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          {info.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {info.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isPending && (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      )}
                      <span className="text-gray-400">→</span>
                    </div>
                  </Button>
                );
              })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              New to Ethereum?{" "}
              <a
                href="https://ethereum.org/en/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more about wallets
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnectModal;
