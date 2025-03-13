import React from "react";

export const DEFAULT_WELCOME_MESSAGE = (
  <span>
    Welcome to Sodot Multichain Demo. Available commands:{" "}
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

export const SODOT_CHECKING_MESSAGE = (
  <span className="text-yellow-400">Verifying SODOT configuration...</span>
);

export const SODOT_CONNECTED_MESSAGE = (
  <span className="text-green-400">✓ SODOT configuration verified</span>
);

export const SODOT_ERROR_MESSAGE = (
  <span className="text-red-400">
    ✗ SODOT configuration invalid. Some features may not work properly.
  </span>
);
