import React, { useState, useEffect } from "react";
import {
  TURNKEY_CHECKING_MESSAGE,
  TURNKEY_CONNECTED_MESSAGE,
  TURNKEY_ERROR_MESSAGE,
} from "../constants/messages";
import { TurnkeySigner } from "../signers/Turnkey";

interface TurnkeyConfigStatusProps {
  onConfigChecked: () => void;
}

const TurnkeyConfigStatus: React.FC<TurnkeyConfigStatusProps> = ({
  onConfigChecked,
}) => {
  const [status, setStatus] = useState<"checking" | "verified" | "error">(
    "checking"
  );

  useEffect(() => {
    const checkTurnkeyConfig = async () => {
      try {
        // Check if Turnkey configuration is valid
        const isValid = TurnkeySigner.isConfigValid();

        if (isValid) {
          // Wait a moment to show the checking message (for UX purposes)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus("verified");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Turnkey configuration check failed:", error);
        setStatus("error");
      } finally {
        // Wait a moment before triggering the callback
        setTimeout(() => {
          onConfigChecked();
        }, 1500);
      }
    };

    checkTurnkeyConfig();
  }, [onConfigChecked]);

  return (
    <div className="animate-text-fade-in opacity-0 text-terminal-muted mb-2">
      {status === "checking" && TURNKEY_CHECKING_MESSAGE}
      {status === "verified" && TURNKEY_CONNECTED_MESSAGE}
      {status === "error" && TURNKEY_ERROR_MESSAGE}
    </div>
  );
};

export default TurnkeyConfigStatus;
