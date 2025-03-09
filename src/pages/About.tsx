
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate('/')}
            className="text-sm font-medium hover:bg-gray-100"
          >
            Terminal
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
        <div className="max-w-3xl w-full mx-auto animate-text-fade-in opacity-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">About API Terminal</h2>
            <p className="text-lg text-gray-600">
              An interactive way to learn and understand our API.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">What is API Terminal?</h3>
              <p className="text-gray-600">
                API Terminal is an interactive learning tool designed to help developers understand how our API works. 
                Through a command-line interface, you can explore features, see examples, and learn best practices
                for integrating with our services.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Interactive command-line experience</li>
                <li>Comprehensive API documentation</li>
                <li>Real-world code examples</li>
                <li>Step-by-step tutorial</li>
                <li>Best practices and error handling guides</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">How to Use</h3>
              <p className="text-gray-600 mb-4">
                Simply type commands in the terminal to navigate through different topics and learn at your own pace.
                Start with the <code className="bg-gray-100 px-1.5 py-0.5 rounded">intro</code> command to get a general overview,
                or <code className="bg-gray-100 px-1.5 py-0.5 rounded">tutorial</code> for a guided walkthrough.
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Common commands:</p>
                <code className="block text-sm text-gray-800 mb-1">help - List all available commands</code>
                <code className="block text-sm text-gray-800 mb-1">intro - Introduction to the API</code>
                <code className="block text-sm text-gray-800 mb-1">tutorial - Start interactive tutorial</code>
                <code className="block text-sm text-gray-800">endpoints - List API endpoints</code>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button 
              onClick={() => navigate('/')}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Return to Terminal
            </Button>
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

export default About;
