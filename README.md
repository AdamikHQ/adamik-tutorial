# Adamik API Terminal Tutorial

## Project Overview

This interactive terminal-based application demonstrates how to interact with blockchain networks using the Adamik API and SODOT Multi-Party Computation (MPC) technology. The project provides a user-friendly interface for exploring various blockchain networks, generating cryptographic keys, creating addresses, and checking account balances.

## Features

- **Interactive Terminal Interface**: Explore blockchain networks through a command-line interface
- **Multi-Party Computation (MPC)**: Generate secure cryptographic keys using SODOT technology
- **Multi-Chain Support**: Works with Bitcoin, Ethereum, Optimism, and many other blockchain networks
- **Address Generation**: Create addresses for different blockchain networks
- **Balance Checking**: View account balances and token holdings
- **API Call Logging**: Visualize API interactions in real-time

## Available Commands

- **help** - Shows a list of available commands
- **start** - Launches an interactive flow to explore blockchain networks
- **getChains** - Shows the complete list of chains supported by Adamik API
- **chain** - Shows detailed information about a specific chain
- **clear** - Clears the terminal

## Getting Started

Follow these steps to run the project locally:

```sh
# Step 1: Clone the repository
git clone https://github.com/AdamikHQ/adamik-tutorial

# Step 2: Navigate to the project directory
cd adamik-tutorial

# Step 3: Install the necessary dependencies
pnpm install

# Step 4: Create a .env.local file with your API keys
# Step 4: Create a .env.local file with your SODOT vertex API keys
# Example:
# VITE_SODOT_VERTEX_URL_0=https://vertex-demo-0.sodot.dev
# VITE_SODOT_VERTEX_API_KEY_0=your-api-key-0
# VITE_SODOT_VERTEX_URL_1=https://vertex-demo-1.sodot.dev
# VITE_SODOT_VERTEX_API_KEY_1=your-api-key-1
# VITE_SODOT_VERTEX_URL_2=https://vertex-demo-2.sodot.dev
# VITE_SODOT_VERTEX_API_KEY_2=your-api-key-2

# Step 5: Start the development server
pnpm dev
```

## Technologies Used

This project is built with:

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React**: UI library for building interactive interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **SODOT MPC**: Secure Multi-Party Computation for cryptographic operations

## About SODOT MPC Technology

SODOT is a secure Multi-Party Computation (MPC) system that enables distributed key generation and signing. Unlike traditional wallets where a single entity controls the private key, SODOT splits cryptographic operations across multiple parties (vertices), enhancing security by ensuring no single party has access to the complete key.

## CORS Configuration

The application includes a proxy configuration in `vite.config.ts` to handle CORS issues when connecting to SODOT vertices. This allows the frontend to communicate with the SODOT API without cross-origin restrictions.

## Project Structure

- `src/components`: React components including the Terminal interface
- `src/utils`: Utility functions for terminal commands and rendering
- `src/signers`: Implementation of the SODOT signer
- `src/adamik`: API client for interacting with the Adamik API
- `src/contexts`: React contexts for state management
