import React from "react";

// React component messages
export const DEFAULT_WELCOME_MESSAGE = (
  <span>
    Welcome to Turnkey Multichain Demo. Available commands:{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-green-500 font-bold">help</span>
    </span>
    ,{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-blue-500 font-bold">start</span>
    </span>
    ,{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-red-500 font-bold">clear</span>
    </span>
  </span>
);

// Turnkey configuration messages
export const TURNKEY_CHECKING_MESSAGE = (
  <span className="text-yellow-400">Verifying Turnkey configuration...</span>
);

export const TURNKEY_CONNECTED_MESSAGE = (
  <span className="text-green-400">✓ Turnkey configuration verified</span>
);

export const TURNKEY_ERROR_MESSAGE = (
  <span className="text-red-400">
    ✗ Turnkey configuration invalid. Some features may not work properly.
  </span>
);

// Terminal messages
export const WELCOME_MESSAGE = `Welcome to the Adamik Tutorial! This interactive tutorial will guide you through the process of interacting with various blockchains.

Type \`help\` to see available commands.
Type \`start\` to begin the tutorial.`;

export const HELP_HINT = "Type `help` to see available commands.";
