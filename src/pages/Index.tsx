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
        {/* About button and GitHub logo removed */}
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

          {/* Tip text removed */}
        </div>
      </main>

      {/* Footer removed */}
    </div>
  );
};

export default Index;
