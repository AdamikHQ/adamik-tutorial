import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
            onClick={() => navigate("/")}
            className="text-sm font-medium hover:bg-gray-100"
          >
            Terminal
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://github.com/adamikcrypt/adamik-tutorial",
                "_blank"
              )
            }
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
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              About API Terminal
            </h2>
            <p className="text-lg text-gray-600">
              An interactive way to learn and explore blockchain networks
              through the Adamik API.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">
                What is API Terminal?
              </h3>
              <p className="text-gray-600">
                API Terminal is an interactive learning tool designed to help
                developers understand blockchain networks and cryptographic
                operations. Through a command-line interface, you can explore
                different blockchains, generate cryptographic keys using SODOT
                MPC technology, create blockchain addresses, and check account
                balances across multiple networks.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Interactive blockchain exploration via command-line</li>
                <li>Multi-party computation (MPC) key generation with SODOT</li>
                <li>Address derivation for multiple blockchain networks</li>
                <li>Real-time account balance checking</li>
                <li>API call logging and visualization</li>
                <li>
                  Support for Bitcoin, Ethereum, Optimism, and other networks
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">How to Use</h3>
              <p className="text-gray-600 mb-4">
                Simply type commands in the terminal to interact with blockchain
                networks and explore cryptographic operations. Start with the{" "}
                <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                  help
                </code>{" "}
                command to see available options, or{" "}
                <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                  start
                </code>{" "}
                to begin generating keys and addresses for a blockchain.
              </p>
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-sm font-medium mb-2">Common commands:</p>
                <code className="block text-sm text-gray-800 mb-1">
                  help - Shows a list of available commands
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  start - Launches an interactive flow to explore blockchain
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  getChains - Shows the complete list of chains supported by
                  Adamik API
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  chain - Shows detailed information about a specific chain
                </code>
                <code className="block text-sm text-gray-800">
                  clear - Clears the terminal
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                About SODOT MPC Technology
              </h3>
              <p className="text-gray-600">
                SODOT is a secure Multi-Party Computation (MPC) system that
                enables distributed key generation and signing. Unlike
                traditional wallets where a single entity controls the private
                key, SODOT splits cryptographic operations across multiple
                parties (vertices), enhancing security by ensuring no single
                party has access to the complete key.
              </p>
              <p className="text-gray-600 mt-2">
                In this tutorial, we use SODOT to generate keys and sign
                transactions across various blockchain networks, demonstrating
                how MPC can provide institutional-grade security for blockchain
                operations.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Button
              onClick={() => navigate("/")}
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
