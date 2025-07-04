import React from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useWallet } from "../../hooks/useWallet";

export const Paralyx = (): JSX.Element => {
  // Wallet hook
  const {
    account,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    formatAddress,
    isMetaMaskInstalled,
  } = useWallet();

  // Navigation menu items data
  const navItems = [
    { label: "Home", isActive: true },
    { label: "About", isActive: false },
    { label: "Technical", isActive: false },
    { label: "Services", isActive: false },
  ];

  return (
    <div className="bg-[#fcf5ff] flex flex-row justify-center w-full">
      <div className="bg-[#fcf5ff] w-[1440px] h-[5371px]">
        {/* Error Notification */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-sm">{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
            {!isMetaMaskInstalled && (
              <div className="mt-2 pt-2 border-t border-red-300">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Install MetaMask
                </a>
              </div>
            )}
          </div>
        )}

        <div className="relative w-[1384px] h-[1098px] left-[33px] bg-[url(/mask.png)] bg-[100%_100%]">
          {/* Navigation Bar */}
          <Card className="absolute w-[499px] h-[68px] top-4 left-[438px] bg-[#eeccf0] rounded border border-solid border-black shadow-none">
            <div className="flex h-full items-center px-[55px]">
              {navItems.map((item, index) => (
                <div
                  key={`nav-${index}`}
                  className={`${index === 0 ? "" : "ml-[60px]"} ${
                    item.isActive
                      ? "[font-family:'Aeonik_TRIAL-Bold',Helvetica] font-bold text-[#252432]"
                      : "[font-family:'Aeonik_TRIAL-Regular',Helvetica] font-normal text-black"
                  } text-base tracking-[0] leading-6 whitespace-nowrap cursor-pointer`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </Card>

          {/* Waitlist Button */}
          <Button
            className="absolute w-[211px] h-[60px] top-[540px] left-[582px] bg-[#eeccf1] rounded border border-solid border-black hover:bg-[#e5b9e8] [font-family:'Aeonik_TRIAL-Bold',Helvetica] font-bold text-black text-base text-center tracking-[0] leading-6 whitespace-nowrap"
            variant="outline"
          >
            Waitlist for Token Bridge
          </Button>

          {/* Wallet Button */}
          <Button
            className="absolute w-[180px] h-12 top-[26px] left-[1115px] bg-[#eeccf0] rounded border border-solid border-black hover:bg-[#e5b9e8] flex items-center justify-center gap-2 px-3"
            variant="outline"
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
          >
            <img className="w-6 h-6" alt="Meta mask" src="/metamask-logo.png" />
            <span className="text-sm font-medium text-black">
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? formatAddress(account!)
                : "Connect"}
            </span>
          </Button>

          {/* Connection Status */}
          {isConnected && (
            <div className="absolute top-[85px] left-[1115px] w-[180px] flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
              </div>
            </div>
          )}

          {/* Logo and Title */}
          <div className="absolute w-[349px] h-[51px] top-[15px] left-0 flex items-center">
            <img
              className="w-[47px] h-[47px] object-cover"
              alt="Logo black"
              src="/navbar-logo.png"
            />
            <div className="ml-[35px] [font-family:'Aeonik_TRIAL-Regular',Helvetica] font-normal text-[#252432] text-4xl text-center tracking-[0] leading-9">
              Paralyx Protocol
            </div>
          </div>

          {/* Center Logo */}
          <div className="absolute w-[311px] h-[299px] top-[195px] left-[526px]">
            <div className="relative h-[299px]">
              <img
                className="w-[299px] h-[299px] top-0 left-3 absolute object-cover"
                alt="Paralyx hero logo"
                src="/hero-logo.png"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
