import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-sm font-medium hover:bg-gray-100"
        >
          Terminal
        </Button>

        <nav className="flex items-center">
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
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl w-full mx-auto animate-text-fade-in opacity-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              About Multichain Demo
            </h2>
            <p className="text-lg text-gray-600">
              Interact with over 60 blockchain networks using secure MPC and
              Adamik technologies.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">
                What is Multichain Demo?
              </h3>
              <p className="text-gray-600">
                Multichain Demo is an interactive tool designed to showcase how
                developers can interact with multiple blockchain networks using
                secure MPC technology. Through a command-line interface, you can
                explore different blockchains, generate cryptographic keys using
                secure MPC technology, create blockchain addresses, check
                account balances, and execute transactions across multiple
                networks.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Interactive blockchain exploration via command-line</li>
                <li>Multi-party computation (MPC) key generation</li>
                <li>Address derivation for multiple blockchain networks</li>
                <li>Real-time account balance checking</li>
                <li>
                  Complete transaction workflow (prepare, sign, broadcast)
                </li>
                <li>API call logging and visualization</li>
                <li>
                  Support for over 60 blockchain networks including Ethereum,
                  Optimism, TON, and more
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
                  prepare-tx - Prepare an unsigned transaction
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  sign-tx - Sign a prepared transaction
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  broadcast-tx - Broadcast a signed transaction to the network
                </code>
                <code className="block text-sm text-gray-800 mb-1">
                  explore-chains - Explore all supported chains
                </code>
                <code className="block text-sm text-gray-800">
                  clear - Clears the terminal
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Guided Workflow</h3>
              <p className="text-gray-600 mb-3">
                The terminal provides a guided workflow that takes you through
                the complete process of blockchain interaction:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                <li>
                  Starting the application with{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    start
                  </code>
                </li>
                <li>
                  Selecting a blockchain network (e.g.,{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    optimism
                  </code>
                  ,{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    ton
                  </code>
                  , etc.)
                </li>
                <li>
                  Preparing a transaction with{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    prepare-tx
                  </code>
                </li>
                <li>
                  Signing the transaction with{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    sign-tx
                  </code>
                </li>
                <li>
                  Broadcasting the transaction with{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    broadcast-tx
                  </code>
                </li>
                <li>
                  Exploring all supported chains with{" "}
                  <code className="bg-gray-200 text-black px-1.5 py-0.5 rounded font-medium">
                    explore-chains
                  </code>
                </li>
              </ol>
              <p className="text-gray-600 mt-3">
                The terminal will suggest the next command in the workflow,
                making it easy to follow along and learn the complete
                transaction process.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">
                About MPC Technology
              </h3>
              <p className="text-gray-600">
                This demo uses a secure Multi-Party Computation (MPC) system
                that enables distributed key generation and signing. Unlike
                traditional wallets where a single entity controls the private
                key, MPC splits cryptographic operations across multiple parties
                (vertices), enhancing security by ensuring no single party has
                access to the complete key.
              </p>
              <p className="text-gray-600 mt-2">
                In this demo, we use MPC to generate keys and sign transactions
                across various blockchain networks, demonstrating how MPC can
                provide institutional-grade security for blockchain operations.
              </p>
              <p className="text-gray-600 mt-2">
                This demo is powered by{" "}
                <a
                  href="https://sodot.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Sodot MPC technology
                </a>
                , a secure and robust implementation of MPC specifically
                designed for blockchain applications.
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
        © {new Date().getFullYear()} Multichain Demo. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
