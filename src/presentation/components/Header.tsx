import React, { useState, useEffect } from "react";
import { ChevronDown, Copy, ExternalLink, LogOut, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useAccount, useDisconnect, useBalance, useSwitchChain } from "wagmi";
import {
  mainnet,
  base,
  arbitrum,
  polygon,
  avalanche,
  optimism,
} from "wagmi/chains";
import WalletConnectModal from "./WalletConnectModal";
import {
  getExplorerAddressLink,
  getExplorerName,
} from "@shared/utils/explorerUtils";
import { getNativeTokenSymbol } from "@shared/utils/chainUtils";

import baseLogo from "@assets/base-logo.png";
import ethereumLogo from "@assets/ethereum-logo.png";
import polygonLogo from "@assets/polygon-logo.png";
import avalancheLogo from "@assets/avalanche-logo.png";
import arbitrumLogo from "@assets/arbitrum-logo.png";
import optimismLogo from "@assets/optimism-logo.png";
import bentoLogo from "@assets/bento-logo.svg";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Native token balance
  const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
    address: address,
    chainId: chain?.id,
  });

  const supportedChains = [
    { ...mainnet, icon: ethereumLogo },
    { ...base, icon: baseLogo },
    { ...arbitrum, icon: arbitrumLogo },
    { ...polygon, icon: polygonLogo },
    { ...avalanche, icon: avalancheLogo },
    { ...optimism, icon: optimismLogo },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('[data-dropdown="wallet"]') &&
        !target.closest('[data-dropdown-trigger="wallet"]')
      ) {
        setIsDropdownOpen(false);
      }
      if (
        !target.closest('[data-dropdown="network"]') &&
        !target.closest('[data-dropdown-trigger="network"]')
      ) {
        setIsNetworkDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const getDisplayBalance = () => {
    if (!chain) return { balance: 0, isLoading: false, error: false };

    return {
      balance: nativeBalance ? parseFloat(nativeBalance.formatted) : 0,
      isLoading: isNativeLoading,
      error: false,
    };
  };

  const formatBalance = (
    amount: number,
    chainId?: number,
    isLoading?: boolean,
    error?: boolean
  ) => {
    if (isLoading) return "Carregando...";
    if (error) return "Erro";
    if (!chainId) return "0.0000";

    const symbol = getNativeTokenSymbol(chainId);
    return `${amount.toFixed(4)} ${symbol}`;
  };

  return (
    <header className={`w-full bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={bentoLogo} alt="Bento Swap Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900">Bento Swap</h1>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8 items-center">
            {/* Links removidos */}
          </nav>

          {/* Connect Wallet Button / Wallet Info + Network Selector */}
          <div className="flex items-center space-x-3">
            {address && chain && (
              <div className="relative">
                <Button
                  onClick={() =>
                    setIsNetworkDropdownOpen(!isNetworkDropdownOpen)
                  }
                  variant="outline"
                  data-dropdown-trigger="network"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-primary/40 bg-white hover:bg-primary/5 transition-all duration-200"
                >
                  <img
                    src={
                      supportedChains.find((c) => c.id === chain.id)?.icon ||
                      ethereumLogo
                    }
                    alt={chain.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {chain.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isNetworkDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Network Dropdown */}
                {isNetworkDropdownOpen && (
                  <Card
                    className="absolute top-full left-0 mt-2 w-56 shadow-xl border-2 border-gray-100 z-50"
                    data-dropdown="network"
                  >
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 px-3 py-2 font-medium">
                          Trocar Rede
                        </p>
                        {supportedChains.map((networkChain) => (
                          <Button
                            key={networkChain.id}
                            onClick={() => {
                              if (networkChain.id !== chain.id) {
                                switchChain({ chainId: networkChain.id });
                              }
                              setIsNetworkDropdownOpen(false);
                            }}
                            variant="ghost"
                            disabled={isSwitchingChain}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                              networkChain.id === chain.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={networkChain.icon}
                                alt={networkChain.name}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="font-medium">
                                {networkChain.name}
                              </span>
                            </div>
                            {networkChain.id === chain.id && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Connect Wallet Button / Wallet Info */}
            <div className="relative">
              {!address ? (
                <Button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Conectar Carteira</span>
                </Button>
              ) : (
                <div className="relative">
                  <Button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    variant="outline"
                    data-dropdown-trigger="wallet"
                    className="flex items-center space-x-3 px-4 py-2 rounded-full border-2 border-primary/20 hover:border-primary/40 bg-white hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {address ? formatAddress(address) : "Nenhum endereço"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const displayBalance = getDisplayBalance();
                            return formatBalance(
                              displayBalance.balance,
                              chain?.id,
                              displayBalance.isLoading,
                              displayBalance.error
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <Card
                      className="absolute right-0 mt-2 w-64 shadow-xl border-2 border-gray-100 z-50"
                      data-dropdown="wallet"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Wallet Info */}
                          <div className="border-b border-gray-100 pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Carteira Conectada
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {address
                                    ? formatAddress(address)
                                    : "Nenhum endereço"}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={copyAddress}
                                  className="p-2 hover:bg-gray-100"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-2 hover:bg-gray-100"
                                  onClick={() =>
                                    window.open(
                                      getExplorerAddressLink(
                                        address!,
                                        chain?.id
                                      ),
                                      "_blank"
                                    )
                                  }
                                  title={`Ver endereço no ${getExplorerName(
                                    chain?.id
                                  )}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Balance */}
                          <div className="py-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Saldo:
                              </span>
                              <span className="text-sm font-medium">
                                {(() => {
                                  const displayBalance = getDisplayBalance();
                                  return formatBalance(
                                    displayBalance.balance,
                                    chain?.id,
                                    displayBalance.isLoading,
                                    displayBalance.error
                                  );
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-sm text-gray-600">
                                Rede:
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {chain?.name || "Desconhecida"}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="border-t border-gray-100 pt-3">
                            <Button
                              onClick={handleDisconnect}
                              variant="ghost"
                              className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Desconectar</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Conexão de Carteira */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </header>
  );
};

export default Header;
