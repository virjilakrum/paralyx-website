import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useWallet } from "../../hooks/useWallet";
import confetti from "canvas-confetti";
import emailjs from "@emailjs/browser";
import SplineBackground from "../../components/SplineBackground";

export const Paralyx = (): JSX.Element => {
  // Wallet hook
  const {
    account,
    isConnected,
    isConnecting,
    isSigned,
    isSigning,
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

  // Email state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Confetti effect function
  const triggerConfetti = () => {
    // First burst - from left
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#eeccf0', '#e5b9e8', '#d4a5e8', '#c291e6', '#af7ee4']
    });
    
    // Second burst - from right
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.8, y: 0.6 },
        colors: ['#eeccf0', '#e5b9e8', '#d4a5e8', '#c291e6', '#af7ee4']
      });
    }, 200);
    
    // Third burst - from center
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 90,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#fcf5ff', '#eeccf0', '#e5b9e8', '#d4a5e8', '#c291e6']
      });
    }, 400);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle waitlist submission
  const handleWaitlistSubmit = async () => {
    if (!email.trim()) {
      setSubmitMessage("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setSubmitMessage("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // EmailJS configuration - Replace these with your actual EmailJS credentials
      const serviceId = "service_paralyx";
      const templateId = "template_waitlist";
      const publicKey = "YOUR_PUBLIC_KEY_HERE"; // Replace with your actual public key from EmailJS

      const templateParams = {
        to_email: "contact@paralyx.com",
        from_email: email,
        wallet_address: account || "Not connected",
        message: `New waitlist signup from ${email}`,
        timestamp: new Date().toLocaleString(),
        user_email: email,
      };

      // If EmailJS is configured, send real email, otherwise simulate
      if (publicKey && publicKey !== "YOUR_PUBLIC_KEY_HERE") {
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
      } else {
        // Simulate email sending delay for development
        console.log("EmailJS not configured, simulating email send:", templateParams);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Trigger confetti on success
      triggerConfetti();
      
      // Show success message
      setSubmitMessage("Successfully joined the waitlist!");
      setEmail("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(""), 3000);
      
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitMessage("Error joining waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen relative overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Spline Interactive Background - Full Screen */}
      <SplineBackground className="opacity-80" />
      
      <div className="absolute inset-0 flex justify-center items-start w-full h-full">
        <div className="w-full max-w-[1440px] min-h-screen relative z-10 px-4">
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

          <div className="relative w-full max-w-[1384px] h-[1098px] mx-auto bg-[url(/mask.png)] bg-[100%_100%] bg-opacity-20">
            {/* Navigation Bar */}
            <Card className="absolute w-[499px] h-[68px] top-[20px] left-1/2 transform -translate-x-1/2 bg-[#eeccf0] bg-opacity-90 backdrop-blur-sm rounded border border-solid border-black shadow-lg">
              <div className="flex h-full items-center justify-center px-[55px]">
                {navItems.map((item, index) => (
                  <div
                    key={`nav-${index}`}
                    className={`${index === 0 ? "" : "ml-[60px]"} ${
                      item.isActive
                        ? "font-aeonik font-bold text-[#252432]"
                        : "font-aeonik font-normal text-black"
                    } text-base tracking-[0] leading-6 whitespace-nowrap cursor-pointer hover:text-[#252432] transition-colors duration-200`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </Card>

            {/* Waitlist Section - Only visible when wallet is connected */}
            {isConnected && isSigned && (
              <div className="absolute top-[520px] left-[420px] w-[440px] flex flex-col items-center gap-6">
                {/* Email Input */}
                <div className="w-full flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[45px] px-4 bg-[#fcf5ff] bg-opacity-95 backdrop-blur-md border-2 border-[#eeccf0] rounded-lg font-aeonik text-black text-sm placeholder-gray-500 focus:outline-none focus:border-[#c291e6] focus:bg-opacity-100 transition-all duration-200 shadow-lg"
                  />
                  {submitMessage && (
                    <p className={`text-sm font-aeonik text-center px-3 py-2 rounded-md backdrop-blur-sm ${submitMessage.includes('Successfully') ? 'text-green-800 bg-green-100 bg-opacity-90' : 'text-red-800 bg-red-100 bg-opacity-90'}`}>
                      {submitMessage}
                    </p>
                  )}
                </div>
                
                {/* Waitlist Button */}
                <Button
                  className="w-[280px] h-[50px] bg-[#eeccf1] bg-opacity-95 backdrop-blur-md rounded border border-solid border-black hover:bg-[#e5b9e8] hover:bg-opacity-100 font-aeonik font-bold text-black text-sm text-center tracking-[0] leading-6 whitespace-nowrap transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  variant="outline"
                  onClick={handleWaitlistSubmit}
                  disabled={isSubmitting || !email.trim()}
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist for Token Bridge"}
                </Button>
              </div>
            )}

            {/* Message for non-connected users */}
            {!isConnected && (
              <div className="absolute top-[560px] left-[440px] w-[400px] text-center">
                <p className="font-aeonik text-black text-lg bg-[#fcf5ff] bg-opacity-95 backdrop-blur-md border-2 border-[#eeccf0] rounded-lg px-6 py-4 shadow-xl">
                  Connect your wallet to join the waitlist
                </p>
              </div>
            )}

            {/* Message for connected but not signed users */}
            {isConnected && !isSigned && (
              <div className="absolute top-[560px] left-[440px] w-[400px] text-center">
                <p className="font-aeonik text-black text-lg bg-[#fcf5ff] bg-opacity-95 backdrop-blur-md border-2 border-[#eeccf0] rounded-lg px-6 py-4 shadow-xl">
                  Please sign the message to join the waitlist
                </p>
              </div>
            )}

            {/* Wallet Connect Button */}
            {!isConnected && (
              <Button
                className="absolute w-[140px] h-[48px] top-[30px] right-[20px] bg-[#eeccf0] bg-opacity-95 backdrop-blur-md rounded border border-solid border-black hover:bg-[#e5b9e8] hover:bg-opacity-100 flex items-center justify-center gap-2 px-3 font-aeonik shadow-lg"
                variant="outline"
                onClick={connect}
                disabled={isConnecting || isSigning}
              >
                <img className="w-5 h-5" alt="Meta mask" src="/metamask-logo.png" />
                <span className="text-xs font-medium text-black">
                  {isConnecting
                    ? "Connecting..."
                    : isSigning
                    ? "Signing..."
                    : "Connect"}
                </span>
              </Button>
            )}

            {/* Wallet Connected Area */}
            {isConnected && (
              <div className="absolute top-[30px] right-[20px] w-[140px] flex flex-col gap-2">
                {/* Wallet Address Display */}
                <div className="bg-[#eeccf0] bg-opacity-95 backdrop-blur-md rounded border border-solid border-black p-2 flex items-center justify-center gap-2 shadow-lg h-[48px]">
                  <img className="w-4 h-4" alt="Meta mask" src="/metamask-logo.png" />
                  <span className="text-xs font-medium text-black font-aeonik">
                    {formatAddress(account!)}
                  </span>
                </div>
                
                {/* Status & Disconnect Button */}
                <div className="flex items-center justify-between gap-1 mt-1">
                  <div className="flex items-center gap-1 bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className={`w-2 h-2 rounded-full ${isSigned ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs font-aeonik text-black">
                      {isSigned ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <Button
                    className="bg-red-100 bg-opacity-95 backdrop-blur-sm hover:bg-red-200 hover:bg-opacity-100 border border-red-300 text-red-700 text-xs px-1 py-1 h-auto font-aeonik shadow-md"
                    variant="outline"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}

            {/* Logo and Title */}
            <div className="absolute top-[20px] left-[20px] flex items-center h-[68px]">
              <img
                className="w-[50px] h-[50px] object-cover drop-shadow-lg"
                alt="Logo black"
                src="/navbar-logo.png"
              />
              <div className="ml-[20px] font-aeonik font-normal text-white text-3xl tracking-[0] leading-none drop-shadow-lg">
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
    </div>
  );
};
