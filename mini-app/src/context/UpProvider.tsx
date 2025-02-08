/**
 * @component UpProvider
 * @description Context provider that manages Universal Profile (UP) wallet connections and state
 * for LUKSO blockchain interactions on Grid. It handles wallet connection status, account management, and chain
 * information while providing real-time updates through event listeners.
 *
 * @provides {UpProviderContext} Context containing:
 * - provider: UP-specific wallet provider instance
 * - client: Viem wallet client for blockchain interactions
 * - chainId: Current blockchain network ID
 * - accounts: Array of connected wallet addresses
 * - contextAccounts: Array of Universal Profile accounts
 * - walletConnected: Boolean indicating active wallet connection
 */
"use client";

import { createClientUPProvider } from "@lukso/up-provider";
import { createWalletClient, custom } from "viem";
import { lukso } from "viem/chains";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface UpProviderContext {
  provider: any;
  client: any;
  chainId: number;
  accounts: Array<`0x${string}`>;
  contextAccounts: Array<`0x${string}`>;
  walletConnected: boolean;
  isConnectedToContextAccount: boolean;
  isWaitingForTx: boolean;
  setIsWaitingForTx: (boolean) => void;
}

const UpContext = createContext<UpProviderContext | undefined>(undefined);

export function useUpProvider() {
  const context = useContext(UpContext);
  if (!context) {
    throw new Error("useUpProvider must be used within a UpProvider");
  }
  return context;
}

interface UpProviderProps {
  children: ReactNode;
}

export function UpProvider({ children }: UpProviderProps) {
  const [provider] = useState(() =>
    typeof window !== "undefined" ? createClientUPProvider() : null
  );
  const [client] = useState(() =>
    typeof window !== "undefined" && provider
      ? createWalletClient({
          chain: lukso,
          transport: custom(provider),
        })
      : null
  );
  const [isWaitingForTx, setIsWaitingForTx] = useState<boolean>(false);

  const [chainId, setChainId] = useState<number>(0);
  const [accounts, setAccounts] = useState<Array<`0x${string}`>>([]);
  const [contextAccounts, setContextAccounts] = useState<Array<`0x${string}`>>(
    []
  );
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        if (!client || !provider) return;

        const _chainId = (await client.getChainId()) as number;
        if (!mounted) return;
        setChainId(_chainId);

        const _accounts = (await client.getAddresses()) as Array<`0x${string}`>;
        if (!mounted) return;
        setAccounts(_accounts);

        const _contextAccounts = provider.contextAccounts;
        if (!mounted) return;
        setContextAccounts(_contextAccounts);
        setWalletConnected(_accounts.length > 0 && _contextAccounts.length > 0);
      } catch (error) {
        console.error(error);
      }
    }

    init();

    if (provider) {
      const accountsChanged = (_accounts: Array<`0x${string}`>) => {
        setAccounts(_accounts);
        setWalletConnected(_accounts.length > 0 && contextAccounts.length > 0);
      };

      const contextAccountsChanged = (_accounts: Array<`0x${string}`>) => {
        setContextAccounts(_accounts);
        setWalletConnected(accounts.length > 0 && _accounts.length > 0);
      };

      const chainChanged = (_chainId: number) => {
        setChainId(_chainId);
      };

      provider.on("accountsChanged", accountsChanged);
      provider.on("chainChanged", chainChanged);
      provider.on("contextAccountsChanged", contextAccountsChanged);

      return () => {
        mounted = false;
        provider.removeListener("accountsChanged", accountsChanged);
        provider.removeListener(
          "contextAccountsChanged",
          contextAccountsChanged
        );
        provider.removeListener("chainChanged", chainChanged);
      };
    }
  }, [client, provider, accounts.length, contextAccounts.length]);

  return (
    <UpContext.Provider
      value={{
        provider,
        client,
        chainId,
        accounts,
        contextAccounts,
        walletConnected,
        isConnectedToContextAccount:
          walletConnected &&
          contextAccounts[0].toUpperCase() === accounts[0].toUpperCase(),
        isWaitingForTx,
        setIsWaitingForTx,
      }}
    >
      <div className="min-h-screen flex flex-col items-center justify-start bg-gray-200">
        {children}
      </div>
    </UpContext.Provider>
  );
}
