import { useState, useEffect, useCallback } from "react";

interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (
        event: string,
        callback: (accounts: string[]) => void
      ) => void;
      isMetaMask?: boolean;
    };
  }
}

const STORAGE_KEY = "paralyx_wallet_address";

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // localStorage'dan adresi yükle ve MetaMask durumunu kontrol et
  useEffect(() => {
    const initializeWallet = async () => {
      // MetaMask'ın yüklenmesini bekle
      if (!window.ethereum) {
        // Kısa bir süre bekle ve tekrar kontrol et
        setTimeout(() => {
          if (!window.ethereum) return;
          initializeWallet();
        }, 100);
        return;
      }

      const savedAddress = localStorage.getItem(STORAGE_KEY);
      console.log("💾 Saved address from localStorage:", savedAddress);

      try {
        // MetaMask'tan mevcut hesapları al
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          console.log("🔗 Wallet auto-connected:", currentAccount);
          setWalletState((prev) => ({
            ...prev,
            account: currentAccount,
            isConnected: true,
            error: null,
          }));
          // localStorage'ı güncelle
          localStorage.setItem(STORAGE_KEY, currentAccount);
        } else {
          // MetaMask'ta hesap yok, localStorage'ı temizle
          console.log("❌ No accounts found, clearing localStorage");
          if (savedAddress) {
            localStorage.removeItem(STORAGE_KEY);
          }
          setWalletState((prev) => ({
            ...prev,
            account: null,
            isConnected: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error("Error initializing wallet:", error);
        // Hata durumunda localStorage'ı temizle
        if (savedAddress) {
          localStorage.removeItem(STORAGE_KEY);
        }
        setWalletState((prev) => ({
          ...prev,
          account: null,
          isConnected: false,
          error: null,
        }));
      }
    };

    // Sayfa yüklendiğinde kısa bir gecikme ile başlat
    const timer = setTimeout(initializeWallet, 100);

    return () => clearTimeout(timer);
  }, []);

  // Sayfa görünürlük değişikliklerini dinle (sekme değişimi)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && window.ethereum && walletState.isConnected) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length === 0) {
            // Bağlantı kesilmiş
            setWalletState((prev) => ({
              ...prev,
              account: null,
              isConnected: false,
            }));
            localStorage.removeItem(STORAGE_KEY);
          } else if (accounts[0] !== walletState.account) {
            // Hesap değişmiş
            setWalletState((prev) => ({
              ...prev,
              account: accounts[0],
              isConnected: true,
            }));
            localStorage.setItem(STORAGE_KEY, accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet on visibility change:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [walletState.isConnected, walletState.account]);

  // MetaMask hesap değişikliklerini dinle
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Kullanıcı bağlantıyı kesti
        disconnect();
      } else {
        // Hesap değişti
        const newAccount = accounts[0];
        setWalletState((prev) => ({
          ...prev,
          account: newAccount,
          isConnected: true,
          error: null,
        }));
        localStorage.setItem(STORAGE_KEY, newAccount);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState((prev) => ({
        ...prev,
        error:
          "MetaMask is not installed. Please install MetaMask to continue.",
      }));
      return;
    }

    setWalletState((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setWalletState((prev) => ({
          ...prev,
          account,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        localStorage.setItem(STORAGE_KEY, account);
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      let errorMessage = "Failed to connect wallet";

      if (error.code === 4001) {
        errorMessage = "Connection rejected by user";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      }

      setWalletState((prev) => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletState({
      account: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...walletState,
    connect,
    disconnect,
    formatAddress,
    isMetaMaskInstalled: !!window.ethereum?.isMetaMask,
  };
};
