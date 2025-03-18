import React, { useState, useEffect } from "react";
import {
  SIGNER_CHECKING_MESSAGE,
  SIGNER_CONNECTED_MESSAGE,
  SIGNER_ERROR_MESSAGE,
} from "../constants/messages";
import { SodotSigner } from "../signers/Sodot";

interface SignerConfigStatusProps {
  onConfigChecked: () => void;
}

const SignerConfigStatus: React.FC<SignerConfigStatusProps> = ({
  onConfigChecked,
}) => {
  const [status, setStatus] = useState<"checking" | "verified" | "error">(
    "checking"
  );

  useEffect(() => {
    const checkSignerConfig = async () => {
      try {
        // Check if signer configuration is valid
        const isValid = SodotSigner.isConfigValid();

        if (isValid) {
          // Wait a moment to show the checking message (for UX purposes)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus("verified");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Signer configuration check failed:", error);
        setStatus("error");
      } finally {
        // Wait a moment before triggering the callback
        setTimeout(() => {
          onConfigChecked();
        }, 1500);
      }
    };

    checkSignerConfig();
  }, [onConfigChecked]);

  return (
    <div className="animate-text-fade-in opacity-0 text-terminal-muted mb-2">
      {status === "checking" && SIGNER_CHECKING_MESSAGE}
      {status === "verified" && SIGNER_CONNECTED_MESSAGE}
      {status === "error" && SIGNER_ERROR_MESSAGE}
    </div>
  );
};

export default SignerConfigStatus;
