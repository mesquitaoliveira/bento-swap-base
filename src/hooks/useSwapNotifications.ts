import { useMemo, useEffect } from "react";
import { useChainId, useSwitchChain } from "wagmi";
import { NotificationType } from "../components/NotificationCard";
import { Token } from "../types";

interface UseSwapNotificationsProps {
  // Estados da wallet e conexão
  isConnected: boolean;

  // Estados do swap
  payToken: Token;
  receiveToken: Token;
  payAmount: string;
  receiveAmount: string;

  // Estados de erro e sucesso
  quoteError: string | null;
  executionError: string | null;
  isSuccess: boolean;
  transactionHash: string | null;

  // Estados de loading
  isNetworkSwitching: boolean;

  // Funções
  isAmountLikelyTooLow: () => boolean;
  onFixAmount: (error: string) => void;
}

interface SwapNotification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
    disabled?: boolean;
  }>;
  children?: React.ReactNode;
  priority: number; // Para ordenação
}

export const useSwapNotifications = ({
  isConnected,
  payToken,
  receiveToken,
  payAmount,
  receiveAmount,
  quoteError,
  executionError,
  isSuccess,
  transactionHash,
  isNetworkSwitching,
  isAmountLikelyTooLow,
  onFixAmount,
}: UseSwapNotificationsProps): SwapNotification[] => {
  const currentChainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  // Mapeamento de redes para Chain IDs
  const networkToChainId: Record<string, number> = {
    Ethereum: 1,
    Base: 8453,
    Arbitrum: 42161,
    Optimism: 10,
    Polygon: 137,
    Avalanche: 43114,
  };

  const getChainIdFromNetwork = (network: string): number => {
    return networkToChainId[network] || 1;
  };

  const getNetworkName = (chainId: number): string => {
    const chainInfo: Record<number, string> = {
      1: "Ethereum",
      8453: "Base",
      42161: "Arbitrum",
      10: "Optimism",
      137: "Polygon",
      43114: "Avalanche",
    };
    return chainInfo[chainId] || "Unknown";
  };

  // Troca automática de rede quando necessário
  useEffect(() => {
    if (isConnected && !isNetworkSwitching && !isSwitchingChain) {
      const requiredChainId = getChainIdFromNetwork(payToken.network);
      const needsNetworkSwitch = currentChainId !== requiredChainId;

      if (needsNetworkSwitch && switchChain) {
        // Trocar rede automaticamente após um delay
        const timeoutId = setTimeout(() => {
          switchChain({ chainId: requiredChainId });
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [
    currentChainId,
    payToken.network,
    isConnected,
    isNetworkSwitching,
    isSwitchingChain,
    switchChain,
  ]);

  return useMemo(() => {
    const notifications: SwapNotification[] = [];

    // 1. Wallet não conectada (prioridade mais alta)
    if (!isConnected) {
      notifications.push({
        id: "wallet-not-connected",
        type: "info",
        title: "Wallet not connected",
        description: "Connect your wallet to start swapping tokens",
        priority: 1,
      });
    }

    // 2. Troca de rede (segunda prioridade) - inclui o estado do switchChain
    if (isConnected && (isNetworkSwitching || isSwitchingChain)) {
      const currentNetworkName = getNetworkName(currentChainId);
      const requiredNetworkName = payToken.network;

      notifications.push({
        id: "network-switching",
        type: "loading",
        title: `Switching Network from ${currentNetworkName} to ${requiredNetworkName}...`,
        description: "Por favor, aprove a troca de rede na sua wallet.",
        priority: 2,
      });
    }

    // 3. Aviso de valor muito baixo
    if (isConnected && !quoteError && isAmountLikelyTooLow()) {
      notifications.push({
        id: "low-amount-warning",
        type: "warning",
        title: "Valor pode estar muito baixo",
        description:
          "Este valor pode estar abaixo do mínimo necessário para o swap. Considere aumentar.",
        priority: 3,
      });
    }

    // 4. Erro de cotação
    if (quoteError) {
      const getErrorTitle = (error: string) => {
        if (error.includes("Amount is too low")) return "Valor Muito Baixo";
        if (error.includes("less than fee")) return "Valor Abaixo da Taxa";
        return "Erro de Cotação";
      };

      const showFixButton =
        quoteError.includes("Min amount") ||
        quoteError.includes("less than fee");

      notifications.push({
        id: "quote-error",
        type: "error",
        title: getErrorTitle(quoteError),
        description: quoteError,
        actions: showFixButton
          ? [
              {
                label: quoteError.includes("less than fee")
                  ? "Usar Valor Seguro"
                  : "Usar Valor Mínimo",
                onClick: () => onFixAmount(quoteError),
                variant: "outline" as const,
              },
            ]
          : undefined,
        priority: 4,
      });
    }

    // 5. Erro de execução
    if (executionError) {
      const isUserRejection =
        executionError.includes("User rejected") ||
        executionError.includes("usuário rejeitou");
      const isChainMismatch = executionError.includes(
        "does not match the target chain"
      );

      // Se for erro de rede, mostrar mensagem mais amigável
      if (isChainMismatch) {
        notifications.push({
          id: "execution-error-network",
          type: "warning",
          title: "Incompatibilidade de Rede",
          description:
            "Sua wallet está conectada à rede errada. A troca de rede será feita automaticamente.",
          priority: 5,
        });
      } else {
        notifications.push({
          id: "execution-error",
          type: "error",
          title: isUserRejection ? "Transação Cancelada" : "Erro na Transação",
          description: isUserRejection
            ? "Você cancelou a transação. Nenhum valor foi transferido."
            : executionError,
          priority: 5,
        });
      }
    }

    // 6. Sucesso (menor prioridade)
    if (isSuccess && transactionHash) {
      notifications.push({
        id: "swap-success",
        type: "success",
        title: "Swap Realizado com Sucesso!",
        description: `${payAmount} ${payToken.symbol} → ${receiveAmount} ${receiveToken.symbol}`,
        priority: 6,
      });
    }

    // Ordenar por prioridade
    return notifications.sort((a, b) => a.priority - b.priority);
  }, [
    isConnected,
    currentChainId,
    payToken,
    receiveToken,
    payAmount,
    receiveAmount,
    quoteError,
    executionError,
    isSuccess,
    transactionHash,
    isNetworkSwitching,
    isSwitchingChain,
    isAmountLikelyTooLow,
    onFixAmount,
  ]);
};
