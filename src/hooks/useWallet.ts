import { useState, useEffect, useCallback } from "react";

interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSigned: boolean;
  isSigning: boolean;
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
    isSigned: false,
    isSigning: false,
    error: null,
  });

  // Otomatik cüzdan bağlama özelliği devre dışı bırakıldı
  // Kullanıcılar sadece Connect butonuna tıklayarak bağlantı kurabilir
  useEffect(() => {
    // Sadece localStorage'daki eski verileri temizle
    const cleanupOldData = () => {
      const savedAddress = localStorage.getItem(STORAGE_KEY);
      if (savedAddress) {
        console.log("🧹 Cleaning up old wallet data from localStorage");
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    cleanupOldData();
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

  const signMessage = useCallback(async (account: string) => {
    if (!window.ethereum) return false;

    setWalletState((prev) => ({
      ...prev,
      isSigning: true,
      error: null,
    }));

    try {
      const message = `Welcome to Paralyx Protocol!\n\nPlease sign this message to verify your wallet ownership.\n\nWallet: ${account}\nTime: ${new Date().toISOString()}`;
      
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });

      if (signature) {
        setWalletState((prev) => ({
          ...prev,
          isSigned: true,
          isSigning: false,
          error: null,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error signing message:", error);
      let errorMessage = "Failed to sign message";

      if (error.code === 4001) {
        errorMessage = "Signature rejected by user";
      }

      setWalletState((prev) => ({
        ...prev,
        isSigning: false,
        error: errorMessage,
      }));
      return false;
    }
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
        
        // İlk önce cüzdan bağlantısını kaydet
        setWalletState((prev) => ({
          ...prev,
          account,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        
        // Sonra sign işlemini iste
        const signed = await signMessage(account);
        
        if (signed) {
          localStorage.setItem(STORAGE_KEY, account);
        } else {
          // Sign edilmezse bağlantıyı kes
          setWalletState((prev) => ({
            ...prev,
            account: null,
            isConnected: false,
            isSigned: false,
            error: "Signature required for security",
          }));
        }
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
  }, [signMessage]);

  const disconnect = useCallback(() => {
    setWalletState({
      account: null,
      isConnected: false,
      isConnecting: false,
      isSigned: false,
      isSigning: false,
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
    signMessage,
    formatAddress,
    isMetaMaskInstalled: !!window.ethereum?.isMetaMask,
  };
};
