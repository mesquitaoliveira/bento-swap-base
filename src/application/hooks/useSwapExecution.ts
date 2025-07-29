import { useState, useCallback } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";

interface ExecuteSwapParams {
  to: string;
  data: string;
  value: string;
  chainId: number;
}

interface UseSwapExecutionResult {
  isExecuting: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash: string | null;
  executeSwap: (params: ExecuteSwapParams) => Promise<void>;
  reset: () => void;
}

export const useSwapExecution = (): UseSwapExecutionResult => {
  const { address } = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const {
    sendTransaction,
    isPending: isSendPending,
    error: sendError,
    data: hash,
  } = useSendTransaction();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
  });

  const executeSwap = useCallback(
    async (params: ExecuteSwapParams) => {
      if (!address) {
        setError("Wallet not connected");
        return;
      }

      setError(null);
      setTransactionHash(null);

      try {
        // Executa a transação usando os dados exatos da quote
        await sendTransaction({
          to: params.to as `0x${string}`,
          data: params.data as `0x${string}`,
          value: BigInt(params.value),
          chainId: params.chainId,
        });

        if (hash) {
          setTransactionHash(hash);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to execute swap";
        setError(errorMessage);
      }
    },
    [address, sendTransaction, hash]
  );

  const reset = useCallback(() => {
    setError(null);
    setTransactionHash(null);
  }, []);

  // Combina erros de send e receipt
  const combinedError =
    error || sendError?.message || receiptError?.message || null;

  return {
    isExecuting: isSendPending,
    isPending: isConfirming,
    isSuccess,
    error: combinedError,
    transactionHash: transactionHash || hash || null,
    executeSwap,
    reset,
  };
};
