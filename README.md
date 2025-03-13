# Sodot Multichain Demo

## Project Overview

This interactive terminal-based application demonstrates how to interact with over 60 blockchain networks using Sodot's Multi-Party Computation (MPC) technology. The project provides a user-friendly interface for exploring various blockchain networks, generating cryptographic keys, creating addresses, checking account balances, and executing transactions.

## Features

- **Interactive Terminal Interface**: Explore blockchain networks through a command-line interface
- **Multi-Party Computation (MPC)**: Generate secure cryptographic keys using SODOT technology
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
git clone https://github.com/AdamikHQ/adamik-tutorial

# Step 2: Navigate to the project directory
cd adamik-tutorial

# Step 3: Install the necessary dependencies
pnpm install

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

## Deployment on Vercel

This project includes a proxy setup for SODOT API requests when deployed on Vercel. The proxy handles the communication between the frontend and the SODOT vertices.

### How it works

1. The frontend makes requests to `/api/sodot-proxy?vertex=X` where X is the vertex number (0, 1, or 2)
2. The Vercel serverless function forwards these requests to the appropriate SODOT vertex using the environment variables
3. The proxy returns the response from the SODOT vertex to the frontend

### API Route Structure

The API routes are structured as follows:

- `/api/sodot-proxy/[...path].js` - Handles all requests to SODOT vertices
- The vertex number is passed as a query parameter: `?vertex=X`
- The path to the SODOT vertex endpoint is passed as part of the URL path

For example, to call the `/ecdsa/derive-pubkey` endpoint on vertex 0, the frontend would make a request to:
`/api/sodot-proxy/ecdsa/derive-pubkey?vertex=0`

### Environment Variables for Vercel

Make sure to set the following environment variables in your Vercel project:

```
VITE_SODOT_VERTEX_URL_0=https://your-sodot-vertex-0-url
VITE_SODOT_VERTEX_URL_1=https://your-sodot-vertex-1-url
VITE_SODOT_VERTEX_URL_2=https://your-sodot-vertex-2-url
VITE_SODOT_VERTEX_API_KEY_0=your-api-key-0
VITE_SODOT_VERTEX_API_KEY_1=your-api-key-1
VITE_SODOT_VERTEX_API_KEY_2=your-api-key-2
```

These environment variables are used by the proxy to forward requests to the correct SODOT vertices.
