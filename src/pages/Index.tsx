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
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-semibold text-lg">&gt;_</span>
          </div>
          <h1 className="text-xl font-medium">Adamik Terminal</h1>
        </div>

        <nav className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/about")}
            className="text-sm font-medium hover:bg-gray-100"
          >
            About
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://github.com/AdamikHQ", "_blank")}
            className="text-sm font-medium"
          >
            Documentation
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              60+ Blockchain, All in One Place
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leverage Sodot MPC technology and interact with more than 60+
              blockchains
            </p>
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
        © {new Date().getFullYear()} Adamik Tutorial. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
