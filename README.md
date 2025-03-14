# Turnkey Multichain Demo

## Project Overview

This interactive terminal-based application demonstrates how to interact with over 60 blockchain networks using Turnkey's secure signing technology. The project provides a user-friendly interface for exploring various blockchain networks, generating cryptographic keys, creating addresses, checking account balances, and executing transactions.

## Features

- **Interactive Terminal Interface**: Explore blockchain networks through a command-line interface
- **Secure Key Management**: Generate secure cryptographic keys using Turnkey technology
- **Multi-Chain Support**: Works with over 60 blockchain networks including Ethereum, Optimism, TON, and more
- **Address Generation**: Create addresses for different blockchain networks
- **Balance Checking**: View account balances and token holdings
- **Transaction Workflow**: Prepare, sign, and broadcast transactions
- **API Call Logging**: Visualize API interactions in real-time

## Available Commands

- **help** - Shows a list of available commands
- **start** - Launches an interactive flow to explore blockchain networks
- **prepare-tx** - Prepare an unsigned transaction
- **sign-tx** - Sign a prepared transaction
- **broadcast-tx** - Broadcast a signed transaction to the network
- **explore-chains** - Explore all supported chains
- **clear** - Clears the terminal

## Guided Flow

The application provides a guided workflow that takes you through the process of:

1. Starting the application with `start`
2. Selecting a blockchain network (e.g., `optimism`, `ton`, etc.)
3. Preparing a transaction with `prepare-tx`
4. Signing the transaction with `sign-tx`
5. Broadcasting the transaction with `broadcast-tx`
6. Exploring all supported chains with `explore-chains`

## Getting Started

Follow these steps to run the project locally:

```sh
# Step 1: Clone the repository
git clone https://github.com/AdamikHQ/adamik-tutorial -b signer-turnkey

# Step 2: Navigate to the project directory
cd adamik-tutorial

# Step 3: Install the necessary dependencies
pnpm install

# Step 4: Create a .env.local file with your Turnkey API keys
# Example:
# VITE_TURNKEY_API_PUBLIC_KEY=your-api-public-key
# VITE_TURNKEY_API_PRIVATE_KEY=your-api-private-key
# VITE_TURNKEY_BASE_URL=https://api.turnkey.com
# VITE_TURNKEY_ORGANIZATION_ID=your-organization-id
# VITE_TURNKEY_WALLET_ID=your-wallet-id

# Step 5: Start the development server
pnpm dev
```

## Technologies Used

This project is built with:

- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **React**: UI library for building interactive interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Turnkey**: Secure key management for cryptographic operations

## About Turnkey Technology

Turnkey is a secure key management system that enables developers to easily integrate blockchain functionality into their applications. It provides a secure and reliable way to manage private keys and sign transactions across multiple blockchain networks.

## CORS Configuration

The application includes a proxy configuration in `vite.config.ts` to handle CORS issues when connecting to external APIs. This allows the frontend to communicate with the APIs without cross-origin restrictions.

## Project Structure

- `src/components`: React components including the Terminal interface
- `src/utils`: Utility functions for terminal commands and rendering
- `src/signers`: Implementation of the Turnkey signer
- `src/adamik`: API client for interacting with the Adamik API
- `src/contexts`: React contexts for state management

## Environment Variables

The following environment variables are required:

```
VITE_ADAMIK_API_BASE_URL=https://api.adamik.io
VITE_ADAMIK_API_KEY=your-api-key-here

VITE_TURNKEY_API_PUBLIC_KEY=your-api-public-key
VITE_TURNKEY_API_PRIVATE_KEY=your-api-private-key
VITE_TURNKEY_BASE_URL=https://api.turnkey.com
VITE_TURNKEY_ORGANIZATION_ID=your-organization-id
VITE_TURNKEY_WALLET_ID=your-wallet-id
```
