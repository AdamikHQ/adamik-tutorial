import React, { useState, useEffect } from "react";
import {
  SODOT_CHECKING_MESSAGE,
  SODOT_CONNECTED_MESSAGE,
  SODOT_ERROR_MESSAGE,
} from "../constants/messages";
import { SodotSigner } from "../signers/Sodot";

interface SodotConfigStatusProps {
  onConfigChecked: () => void;
}

const SodotConfigStatus: React.FC<SodotConfigStatusProps> = ({
  onConfigChecked,
}) => {
  const [status, setStatus] = useState<"checking" | "verified" | "error">(
    "checking"
  );

  useEffect(() => {
    const checkSodotConfig = async () => {
      try {
        // Check if SODOT configuration is valid
        const isValid = SodotSigner.isConfigValid();

        if (isValid) {
          // Wait a moment to show the checking message (for UX purposes)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus("verified");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("SODOT configuration check failed:", error);
        setStatus("error");
      } finally {
        // Wait a moment before triggering the callback
        setTimeout(() => {
          onConfigChecked();
        }, 1500);
      }
    };

    checkSodotConfig();
  }, [onConfigChecked]);

  return (
    <div className="animate-text-fade-in opacity-0 text-terminal-muted mb-2">
      {status === "checking" && SODOT_CHECKING_MESSAGE}
      {status === "verified" && SODOT_CONNECTED_MESSAGE}
      {status === "error" && SODOT_ERROR_MESSAGE}
    </div>
  );
};

export default SodotConfigStatus;
