import React from "react";
import { AdamikChain } from "../adamik/types";

// Define the structure for commands
export type CommandResult = {
  success: boolean;
  output: React.ReactNode;
  type?: "success" | "error" | "info";
  chainSelection?: boolean;
  clearTerminal?: boolean;
  helpExecuted?: boolean;
};

// Track the current state of the workflow
export type WorkflowState = {
  selectedChain?: string;
  selectedChainData?: AdamikChain;
  address?: string;
  pubkey?: string;
  balance?: any;
  transaction?: any;
  signature?: string;
  txHash?: string;
};

// Command definition type
export type Command = {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<CommandResult> | CommandResult;
};

// Global state to track workflow progress
export let workflowState: WorkflowState = {};

// Reset workflow state
export const resetWorkflowState = () => {
  workflowState = {};
};

// Check if tutorial is completed
export const isTutorialCompleted = (): boolean => {
  return sessionStorage.getItem("tutorialCompleted") === "true";
};

// Set tutorial as completed
export const setTutorialCompleted = (completed: boolean = true): void => {
  if (completed) {
    sessionStorage.setItem("tutorialCompleted", "true");
  } else {
    sessionStorage.removeItem("tutorialCompleted");
  }
};
