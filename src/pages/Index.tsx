import { useState, useEffect } from "react";
import TerminalLayout from "@/components/TerminalLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DEFAULT_WELCOME_MESSAGE } from "../constants/messages";

const Index = () => {
  const navigate = useNavigate();
  const [activeAnimation, setActiveAnimation] = useState(true);

  useEffect(() => {
    // After component mount, start the animation sequence with a shorter delay
    const timer = setTimeout(() => {
      setActiveAnimation(false);
    }, 500); // Reduced from 2000ms to 500ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            onClick={() => window.open("https://adamik.io", "_blank")}
            className="flex items-center space-x-2 bg-[#0D0D40] hover:bg-[#0D0D40]/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <img
              src="/Adamik_symbol_flat_white.svg"
              alt="Adamik"
              className="h-5 w-5"
            />
            <span>Adamik Website</span>
          </Button>
        </div>

        <nav className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/about")}
            className="text-sm font-medium hover:bg-gray-100 mr-2"
          >
            About
          </Button>
          <a
            href="https://github.com/AdamikHQ/adamik-tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-md hover:bg-gray-100"
          >
            <img src="/github-mark.svg" alt="GitHub" className="h-12 w-12" />
            <span className="sr-only">GitHub</span>
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center mb-8 mt-6 md:mt-0">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <img
                  src="/AdamikMultichainDemo.svg"
                  alt="Multichain Demo, powered by Adamik API"
                  className="max-w-full h-auto"
                  style={{ marginTop: "10px" }}
                />
              </div>
              <p className="text-lg text-gray-600 pt-2">
                Interact with over 60 blockchains, with a single API
              </p>
            </div>
          </div>

          <TerminalLayout
            welcomeMessage={DEFAULT_WELCOME_MESSAGE}
            className="shadow-2xl"
          />

          <div className="mt-8 text-sm text-center text-gray-500">
            Tip: Type{" "}
            <span className="font-mono">
              <span className="text-purple-500">$</span>{" "}
              <span className="text-green-500 font-bold">help</span>
            </span>{" "}
            to see all available commands,{" "}
            <span className="font-mono">
              <span className="text-purple-500">$</span>{" "}
              <span className="text-blue-500 font-bold">start</span>
            </span>{" "}
            to begin exploring blockchain networks, or{" "}
            <span className="font-mono">
              <span className="text-purple-500">$</span>{" "}
              <span className="text-red-500 font-bold">clear</span>
            </span>{" "}
            to clear the terminal.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Multichain Demo. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
