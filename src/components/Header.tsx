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

// Importar ícones das redes
import baseLogo from "../assets/base-logo.png";
import ethereumLogo from "../assets/ethereum-logo.png";
import polygonLogo from "../assets/polygon-logo.png";
import avalancheLogo from "../assets/avalanche-logo.png";
import arbitrumLogo from "../assets/arbitrum-logo.png";
import optimismLogo from "../assets/optimism-logo.png";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Hooks do Wagmi
  const { address, chain } = useAccount();
  console.log("Current address:", address);
  console.log("Current chainId:", chain?.id);
  const { disconnect } = useDisconnect();

  // Saldo nativo (ETH, MATIC, AVAX, etc.)
  const {
    data: balance,
    isLoading,
    error,
  } = useBalance({
    address,
    chainId: chain?.id,
  });

  // Saldo do token OP na rede Optimism
  const {
    data: opBalance,
    isLoading: isOpLoading,
    error: opError,
  } = useBalance({
    address,
    token:
      chain?.id === optimism.id
        ? "0x4200000000000000000000000000000000000042"
        : undefined,
    chainId: chain?.id,
    query: {
      enabled: chain?.id === optimism.id && !!address,
    },
  });

  // Log apenas se não for erro de RPC conhecido
  console.log("Current balance:", balance);
  console.log("Balance loading:", isLoading);
  if (error && !error.message?.includes("AVAX_MAINNET is not enabled")) {
    console.log("Balance error:", error);
  }
  console.log("OP Balance:", opBalance);
  console.log("OP Balance loading:", isOpLoading);
  if (opError && !opError.message?.includes("AVAX_MAINNET is not enabled")) {
    console.log("OP Balance error:", opError);
  }
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Redes suportadas
  const supportedChains = [
    { ...base, icon: baseLogo },
    { ...mainnet, icon: ethereumLogo },
    { ...arbitrum, icon: arbitrumLogo },
    { ...polygon, icon: polygonLogo },
    { ...avalanche, icon: avalancheLogo },
    { ...optimism, icon: optimismLogo },
  ];

  // Função para obter o símbolo do token nativo de cada rede
  const getNativeTokenSymbol = (chainId: number | undefined) => {
    switch (chainId) {
      case mainnet.id: // Ethereum
        return "ETH";
      case base.id: // Base
        return "ETH";
      case arbitrum.id: // Arbitrum
        return "ETH";
      case polygon.id: // Polygon
        return "MATIC";
      case avalanche.id: // Avalanche
        return "AVAX";
      case optimism.id: // Optimism
        return "ETH";
      default:
        return "ETH";
    }
  };

  // Effect para monitorar mudanças no saldo
  useEffect(() => {
    if (address && chain) {
      console.log(
        `🔍 Fetching balance for address ${address} on chain ${chain.name} (${chain.id})`
      );
    }
  }, [address, chain?.id]);

  useEffect(() => {
    if (balance) {
      console.log(`💰 Native Balance updated:`, {
        formatted: balance.formatted,
        symbol: balance.symbol,
        decimals: balance.decimals,
        value: balance.value?.toString(),
        chainId: chain?.id,
        chainName: chain?.name,
      });
    }
  }, [balance, chain]);

  useEffect(() => {
    if (opBalance) {
      console.log(`🔶 OP Token Balance updated:`, {
        formatted: opBalance.formatted,
        symbol: opBalance.symbol,
        decimals: opBalance.decimals,
        value: opBalance.value?.toString(),
        chainId: chain?.id,
        chainName: chain?.name,
      });
    }
  }, [opBalance, chain]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Não fechar se clicar dentro dos dropdowns ou nos botões
      if (
        target.closest('[data-dropdown="wallet"]') ||
        target.closest('[data-dropdown="network"]') ||
        target.closest('[data-dropdown-trigger="wallet"]') ||
        target.closest('[data-dropdown-trigger="network"]')
      ) {
        return;
      }

      setIsDropdownOpen(false);
      setIsNetworkDropdownOpen(false);
    };

    if (isDropdownOpen || isNetworkDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen, isNetworkDropdownOpen]);

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      // Aqui você poderia adicionar uma notificação de sucesso
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Função para obter o saldo correto baseado na rede
  const getDisplayBalance = () => {
    if (chain?.id === optimism.id) {
      // Na rede Optimism, priorizar o saldo de OP se existir, senão mostrar ETH
      if (opBalance && parseFloat(opBalance.formatted) > 0) {
        return {
          balance: opBalance,
          isLoading: isOpLoading,
          error: opError,
        };
      }
    }

    // Para todas as outras redes ou se não há saldo de OP, mostrar saldo nativo
    return {
      balance,
      isLoading,
      error,
    };
  };

  const formatBalance = (
    balanceData: any,
    chainId?: number,
    loading?: boolean,
    error?: any
  ) => {
    if (loading) return `Loading...`;
    if (error) {
      // Mensagem específica para erro de RPC
      if (
        error.message?.includes("AVAX_MAINNET is not enabled") ||
        error.message?.includes("HTTP request failed")
      ) {
        return `RPC Error`;
      }
      return `Error loading balance`;
    }
    if (!balanceData || !balanceData.formatted)
      return `0.0000 ${getNativeTokenSymbol(chainId)}`;

    const symbol = balanceData.symbol || getNativeTokenSymbol(chainId);
    const amount = parseFloat(balanceData.formatted);

    // Se o valor for muito pequeno, mostrar mais casas decimais
    if (amount > 0 && amount < 0.0001) {
      return `${amount.toFixed(8)} ${symbol}`;
    }

    return `${amount.toFixed(4)} ${symbol}`;
  };

  return (
    <header className={`w-full bg-white border-b border-gray-200 ${className}`}>
      {/* Debug Panel - Remover em produção */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-4">
            <span>Debug:</span>
            <span>
              Address:{" "}
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "None"}
            </span>
            <span>
              Chain: {chain?.name || "None"} ({chain?.id || "N/A"})
            </span>
            <span>
              Native Balance:{" "}
              {balance ? `${balance.formatted} ${balance.symbol}` : "None"}
            </span>
            {chain?.id === optimism.id && (
              <span>
                OP Balance:{" "}
                {opBalance
                  ? `${opBalance.formatted} ${opBalance.symbol}`
                  : "None"}
              </span>
            )}
            <span>Loading: {isLoading || isOpLoading ? "Yes" : "No"}</span>
            <span>Error: {error || opError ? "Yes" : "No"}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Base Swap</h1>
            </div>
          </div>

          {/* Navegação central (opcional) */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a
              href="#"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Swap
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Pool
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Bridge
            </a>

            {/* Network Selector */}
            {chain && (
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
                          Switch Network
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
          </nav>

          {/* Connect Wallet Button */}
          <div className="relative">
            {!address ? (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Connect Wallet</span>
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
                        {address ? formatAddress(address) : "No address"}
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
                                Connected Wallet
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {address
                                  ? formatAddress(address)
                                  : "No address"}
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
                                    `https://etherscan.io/address/${address}`,
                                    "_blank"
                                  )
                                }
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
                              Balance:
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
                              Network:
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {chain?.name || "Unknown"}
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
                            <span>Disconnect</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Modal de Conexão de Carteira */}
            <WalletConnectModal
              isOpen={isWalletModalOpen}
              onClose={() => setIsWalletModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
