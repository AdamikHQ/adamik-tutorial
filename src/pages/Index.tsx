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
            variant="ghost"
            onClick={() => navigate("/about")}
            className="text-sm font-medium hover:bg-gray-100"
          >
            About
          </Button>
        </div>

        <nav className="flex items-center">
          <a
            href="https://github.com/AdamikHQ/adamik-tutorial/tree/sodot-signer"
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
                  src="/SodotMultichainDemo.svg"
                  alt="Sodot Multi Chain Demo, powered by Adamik API"
                  className="max-w-full h-auto"
                  style={{ marginTop: "10px" }}
                />
              </div>
              <p className="text-lg text-gray-600 pt-2">
                Leverage Sodot's MPC technology to interact with over 60
                blockchains
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

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400 mb-3">
              Ready to explore multi-chain development for your project?
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://adamik.io/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact us
              </a>
              <a
                href="https://calendly.com/roman-j94"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-blue-500 bg-blue-100 bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors"
              >
                Schedule a demo
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Sodot Multichain. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
