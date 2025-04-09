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
    <div className="min-h-screen flex flex-col bg-[#FAFCFF]">
      {/* Header */}
      <header className="w-full py-2 px-8 flex justify-between items-center">
        {/* About button and GitHub logo removed */}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-4">
        <div className="w-full max-w-[1400px] mx-auto">
          <TerminalLayout
            welcomeMessage={DEFAULT_WELCOME_MESSAGE}
            className=""
          />

          {/* Tip text removed */}
        </div>
      </main>

      {/* Footer removed */}
    </div>
  );
};

export default Index;
