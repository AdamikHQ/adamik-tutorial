import React from "react";

export const DEFAULT_WELCOME_MESSAGE = (
  <span>
    Welcome to the Adamik Terminal. Available commands: ,{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-blue-500 font-bold">start</span>
    </span>
    ,{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-green-500 font-bold">help</span>
    </span>
    ,{" "}
    <span className="font-mono">
      <span className="text-purple-500">$</span>{" "}
      <span className="text-red-500 font-bold">clear</span>
    </span>
  </span>
);
