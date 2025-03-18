import React from "react";

export const DEFAULT_WELCOME_MESSAGE = (
  <span>
    Welcome to Multichain Demo. Available commands:{" "}
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

export const SIGNER_CHECKING_MESSAGE = (
  <span className="text-yellow-400">
    Verifying secure signer configuration...
  </span>
);

export const SIGNER_CONNECTED_MESSAGE = (
  <span className="text-green-400">✓ Secure signer configuration verified</span>
);

export const SIGNER_ERROR_MESSAGE = (
  <span className="text-red-400">
    ✗ Secure signer configuration invalid. Some features may not work properly.
  </span>
);

// Keep old constants for backward compatibility
export const SODOT_CHECKING_MESSAGE = SIGNER_CHECKING_MESSAGE;
export const SODOT_CONNECTED_MESSAGE = SIGNER_CONNECTED_MESSAGE;
export const SODOT_ERROR_MESSAGE = SIGNER_ERROR_MESSAGE;
