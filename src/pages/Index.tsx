
import { useState, useEffect } from 'react';
import Terminal from '@/components/Terminal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
          <h1 className="text-xl font-medium">API Terminal</h1>
        </div>
        
        <nav className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/about')}
            className="text-sm font-medium hover:bg-gray-100"
          >
            About
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://github.com', '_blank')}
            className="text-sm font-medium"
          >
            Documentation
          </Button>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        {/* Removed the conditional rendering based on animation state to ensure content is always visible */}
        <div className="max-w-4xl w-full mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Interactive API Tutorial</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to use our API through an interactive terminal-based tutorial.
              Type commands to explore features and see examples.
            </p>
          </div>
          
          <Terminal 
            welcomeMessage="Welcome to the API Terminal. Type 'intro' to get started or 'help' to see available commands."
            initialCommands={["help"]} // Added a default command to show available commands
            className="shadow-2xl"
          />
          
          <div className="mt-8 text-sm text-center text-gray-500">
            Tip: Start with <code className="bg-gray-200 px-1.5 py-0.5 rounded">intro</code> to learn about the API or <code className="bg-gray-200 px-1.5 py-0.5 rounded">tutorial</code> for a guided walkthrough.
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 px-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} API Terminal. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
