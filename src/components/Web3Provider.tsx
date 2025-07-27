import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  base,
  arbitrum,
  polygon,
  avalanche,
  optimism,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// Configuração das chains que queremos suportar
const chains = [base, mainnet, arbitrum, polygon, avalanche, optimism] as const;

// Criar configuração do Wagmi com ConnectKit
const config = createConfig(
  getDefaultConfig({
    // Chains suportadas
    chains,

    // Transports (RPC endpoints)
    transports: {
      [mainnet.id]: http(
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? `https://eth-mainnet.g.alchemy.com/v2/${
              import.meta.env.VITE_ALCHEMY_API_KEY
            }`
          : "https://ethereum-rpc.publicnode.com"
      ),
      [base.id]: http(
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? `https://base-mainnet.g.alchemy.com/v2/${
              import.meta.env.VITE_ALCHEMY_API_KEY
            }`
          : "https://base-rpc.publicnode.com"
      ),
      [arbitrum.id]: http(
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? `https://arb-mainnet.g.alchemy.com/v2/${
              import.meta.env.VITE_ALCHEMY_API_KEY
            }`
          : "https://arbitrum-one-rpc.publicnode.com"
      ),
      [polygon.id]: http(
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? `https://polygon-mainnet.g.alchemy.com/v2/${
              import.meta.env.VITE_ALCHEMY_API_KEY
            }`
          : "https://polygon-bor-rpc.publicnode.com"
      ),
      // Avalanche sempre usa RPC público (Alchemy requer habilitação especial)
      [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
      [optimism.id]: http(
        import.meta.env.VITE_ALCHEMY_API_KEY
          ? `https://opt-mainnet.g.alchemy.com/v2/${
              import.meta.env.VITE_ALCHEMY_API_KEY
            }`
          : "https://optimism-rpc.publicnode.com"
      ),
    },

    // WalletConnect Project ID (obrigatório)
    walletConnectProjectId:
      import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo_project_id",

    // Informações da App
    appName: "Base Swap",
    appDescription:
      "A decentralized exchange for swapping tokens across multiple networks",
    appUrl: "https://base-swap.com",
    appIcon: "https://base-swap.com/logo.png",
  })
);

// Cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          mode="auto"
          customTheme={{
            "--ck-accent-color": "#0052ff",
            "--ck-accent-text-color": "#ffffff",
            "--ck-border-radius": "16px",
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
