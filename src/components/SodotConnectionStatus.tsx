import React, { useState, useEffect } from "react";
import {
  SODOT_CHECKING_MESSAGE,
  SODOT_CONNECTED_MESSAGE,
  SODOT_ERROR_MESSAGE,
} from "../constants/messages";
import { SodotSigner } from "../signers/Sodot";

interface SodotConnectionStatusProps {
  onConnectionChecked: () => void;
}

const SodotConnectionStatus: React.FC<SodotConnectionStatusProps> = ({
  onConnectionChecked,
}) => {
  const [status, setStatus] = useState<"checking" | "connected" | "error">(
    "checking"
  );

  useEffect(() => {
    const checkSodotConnection = async () => {
      try {
        // Check if SODOT configuration is valid
        const isValid = SodotSigner.isConfigValid();

        if (isValid) {
          // Wait a moment to show the checking message (for UX purposes)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus("connected");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("SODOT connection check failed:", error);
        setStatus("error");
      } finally {
        // Wait a moment before triggering the callback
        setTimeout(() => {
          onConnectionChecked();
        }, 1500);
      }
    };

    checkSodotConnection();
  }, [onConnectionChecked]);

  return (
    <div className="animate-text-fade-in opacity-0 text-terminal-muted mb-2">
      {status === "checking" && SODOT_CHECKING_MESSAGE}
      {status === "connected" && SODOT_CONNECTED_MESSAGE}
      {status === "error" && SODOT_ERROR_MESSAGE}
    </div>
  );
};

export default SodotConnectionStatus;
