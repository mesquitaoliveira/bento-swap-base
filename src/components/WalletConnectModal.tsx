import React from "react";
import { X, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useConnect } from "wagmi";
import braveLogo from "../assets/wallets-icons/brave-logo.png";
import metamask from "../assets/wallets-icons/metamask.svg";
import coibaseLogo from "../assets/wallets-icons/coinbase.svg";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connectors, connect, isPending } = useConnect();

  const walletInfo = {
    metaMask: {
      name: "MetaMask",
      description: "Conectar usando MetaMask wallet",
      icon: metamask,
      color: "bg-orange-50 border-orange-200",
      isImage: true,
    },
    coinbaseWallet: {
      name: "Coinbase Wallet",
      description: "Conectar usando Coinbase Wallet",
      icon: coibaseLogo,
      color: "bg-blue-50 border-blue-200",
      isImage: true,
    },
    injected: {
      name: "Browser Wallet",
      description: "Conectar usando o wallet do navegador instalado",
      icon: braveLogo,
      color: "bg-purple-50 border-purple-200",
      isImage: true,
    },
  };

  const getWalletInfo = (connectorId: string) => {
    if (connectorId.toLowerCase().includes("metamask")) {
      return walletInfo.metaMask;
    }
    if (connectorId.toLowerCase().includes("coinbase")) {
      return walletInfo.coinbaseWallet;
    }
    return walletInfo.injected;
  };

  // Filtrar apenas os conectores que queremos mostrar
  const getFilteredConnectors = () => {
    const filtered = [];

    // Procurar MetaMask
    const metamaskConnector = connectors.find((c) =>
      c.id.toLowerCase().includes("metamask")
    );
    if (metamaskConnector) {
      filtered.push(metamaskConnector);
    }

    // Procurar Coinbase
    const coinbaseConnector = connectors.find((c) =>
      c.id.toLowerCase().includes("coinbase")
    );
    if (coinbaseConnector) {
      filtered.push(coinbaseConnector);
    }

    // Adicionar um conector genérico (injected) se existir ethereum no window
    const injectedConnector = connectors.find(
      (c) => c.id === "injected" && window?.ethereum
    );
    if (injectedConnector) {
      filtered.push(injectedConnector);
    }

    return filtered;
  };

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      onClose();
    } catch (error) {
      // Error handling silencioso
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
                Conectar Wallet
              </h2>
              <p className="text-sm text-gray-500">Escolha sua carteira</p>
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
            {getFilteredConnectors().map((connector) => {
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
                      {info.isImage ? (
                        <img
                          src={info.icon as string}
                          alt={info.name}
                          className="w-8 h-8 object-contain rounded-lg"
                        />
                      ) : (
                        info.icon
                      )}
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
              Novo em web3?{" "}
              <a
                href="https://ethereum.org/en/wallets/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ler mais sobre carteiras
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletConnectModal;
