import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Token } from "@domain/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAccount } from "wagmi";
import { useTokenBalances } from "@application/hooks/useTokenBalances";
import {
  getTokenInfo,
  getChainInfo,
  DEFAULT_TOKEN_LOGO,
  generateTokensList,
} from "@shared/utils/tokensInfo";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: Token[];
  selectedToken: Token;
  onSelectToken: (token: Token) => void;
}

const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  tokens,
  selectedToken,
  onSelectToken,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("All");
  const [showNetworkDropdown, setShowNetworkDropdown] =
    useState<boolean>(false);

  // Hook para verificar se a wallet está conectada
  const { isConnected } = useAccount();

  // Combina tokens passados como props com tokens das redes configuradas
  const baseTokens = React.useMemo(() => {
    const configuredTokens = generateTokensList();
    const tokenMap = new Map();

    // Adiciona tokens das configurações
    configuredTokens.forEach((token) => {
      const key = `${token.network}-${token.symbol}`;
      tokenMap.set(key, token);
    });

    // Sobrescreve/adiciona tokens passados como props (podem ter configurações específicas)
    tokens.forEach((token) => {
      const key = `${token.network}-${token.symbol}`;
      tokenMap.set(key, token);
    });

    return Array.from(tokenMap.values());
  }, [tokens]);

  // Hook para buscar saldos reais da wallet
  const { updateTokensWithBalances } = useTokenBalances(baseTokens);

  // Tokens com saldos atualizados
  const allAvailableTokens = React.useMemo(() => {
    return updateTokensWithBalances(baseTokens);
  }, [baseTokens, updateTokensWithBalances]);

  // Get unique networks from all available tokens
  const networks = [
    "All",
    ...Array.from(new Set(allAvailableTokens.map((token) => token.network))),
  ];

  const filteredTokens = allAvailableTokens.filter((token) => {
    const matchesSearch =
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.network.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNetwork =
      selectedNetwork === "All" || token.network === selectedNetwork;

    return matchesSearch && matchesNetwork;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Select Token
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-32 py-4 text-lg font-medium"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full flex items-center space-x-1">
              {selectedNetwork !== "All" ? (
                <img
                  src={(() => {
                    const chainInfo = getChainInfo(selectedNetwork);
                    return chainInfo?.ICON || DEFAULT_TOKEN_LOGO;
                  })()}
                  alt={selectedNetwork}
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                      e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                    }
                  }}
                />
              ) : (
                <span>{selectedNetwork}</span>
              )}
            </div>
            <button
              onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
              className="p-1 hover:bg-primary/10 rounded transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                  showNetworkDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Network Dropdown */}
        {showNetworkDropdown && (
          <div className="mb-4 p-4 border border-border rounded-lg bg-background/50">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Filter by Network:
            </div>
            <div className="flex flex-wrap gap-2">
              {networks.map((network) => (
                <Button
                  key={network}
                  variant={selectedNetwork === network ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedNetwork(network);
                    setShowNetworkDropdown(false);
                  }}
                  className={`text-xs px-3 py-1 transition-all duration-200 flex items-center space-x-2 ${
                    selectedNetwork === network
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  {network !== "All" && (
                    <img
                      src={(() => {
                        const chainInfo = getChainInfo(network);
                        return chainInfo?.ICON || DEFAULT_TOKEN_LOGO;
                      })()}
                      alt={network}
                      className="w-4 h-4 rounded-full object-cover"
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                          e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                        }
                      }}
                    />
                  )}
                  <span>{network}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Column Headers */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Token
          </div>
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Balance
          </div>
        </div>

        {/* Token List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 pt-2">
          {filteredTokens.map((token) => (
            <Button
              key={token.id}
              variant="ghost"
              onClick={() => onSelectToken(token)}
              className={`w-full p-3 h-auto text-left transition-all duration-200 hover:shadow-md justify-start ${
                token.id === selectedToken.id
                  ? "bg-primary/5 border-2 border-primary/20 shadow-md"
                  : "hover:bg-muted/50 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3 w-full overflow-hidden">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center shadow-md flex-shrink-0">
                  <img
                    src={(() => {
                      const tokenInfo = getTokenInfo(
                        token.network,
                        token.symbol
                      );
                      return tokenInfo?.ICON || DEFAULT_TOKEN_LOGO;
                    })()}
                    alt={token.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      // Se a logo específica falhar, usa a logo padrão
                      if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                        e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                      }
                    }}
                  />
                  {/* Logo da rede sobreposta */}
                  <img
                    src={(() => {
                      const chainInfo = getChainInfo(token.network);
                      return chainInfo?.ICON || DEFAULT_TOKEN_LOGO;
                    })()}
                    alt={token.network}
                    className="absolute top-0 right-0 w-4 h-4 rounded-full object-cover border-2 border-white bg-white z-10 shadow-sm"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_TOKEN_LOGO) {
                        e.currentTarget.src = DEFAULT_TOKEN_LOGO;
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="font-bold text-foreground text-base text-left truncate">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium text-left truncate">
                        {token.name}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[80px]">
                      <div className="text-sm font-bold text-foreground truncate">
                        {isConnected ? token.balance.toFixed(4) : "0.000"}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium truncate">
                        $
                        {isConnected
                          ? (token.balance * token.price).toFixed(2)
                          : "0.00"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelectModal;
