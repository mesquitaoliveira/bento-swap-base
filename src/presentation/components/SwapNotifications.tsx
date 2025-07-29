import React from "react";
import { NotificationCard } from "./NotificationCard";
import { useSwapNotifications } from "@application/hooks/useSwapNotifications";
import { Token } from "@domain/types";

interface SwapNotificationsProps {
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

export const SwapNotifications: React.FC<SwapNotificationsProps> = (props) => {
  const notifications = useSwapNotifications(props);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          type={notification.type}
          title={notification.title}
          description={notification.description}
          actions={notification.actions}
        >
          {notification.children}
        </NotificationCard>
      ))}
    </div>
  );
};
