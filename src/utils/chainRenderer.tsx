import React from "react";
import { AdamikChain } from "../adamik/types";

// Function to render chain information
export const renderChainInfo = (
  chainId: string,
  chain: AdamikChain,
  pubkey: string,
  addressInfo: any,
  balance: any
) => {
  const formattedNativeBalance = (
    Number(balance.balances.native.available) / Math.pow(10, chain.decimals)
  ).toFixed(chain.decimals);

  return (
    <div>
      <p className="mb-4 text-green-400 font-bold">
        ✓ Chain selected and keys generated!
      </p>
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">
          {chain.name} ({chainId})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1">
              <strong>Token:</strong> {chain.ticker}
            </p>
            <p className="mb-1">
              <strong>Decimals:</strong> {chain.decimals}
            </p>
            <p className="mb-1">
              <strong>Family:</strong> {chain.family}
            </p>
          </div>
          <div>
            <p className="mb-1">
              <strong>Curve:</strong> {chain.signerSpec.curve}
            </p>
            <p className="mb-1">
              <strong>Hash Function:</strong> {chain.signerSpec.hashFunction}
            </p>
            <p className="mb-1">
              <strong>Coin Type:</strong> {chain.signerSpec.coinType}
            </p>
          </div>
        </div>

        {/* Supported Features section - temporarily hidden
        <div className="mt-3">
          <p className="mb-1"><strong>Supported Features:</strong></p>
          <ul className="list-disc ml-4">
            {Object.entries(chain.supportedFeatures).map(
              ([category, features]) => (
                <li key={category}>
                  <strong className="capitalize">{category}:</strong>{" "}
                  {Object.keys(features).join(", ")}
                </li>
              )
            )}
          </ul>
        </div>
        */}
      </div>

      <div className="bg-gray-800 p-4 rounded mb-4">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">
          Key Details (SODOT MPC)
        </h3>
        <div>
          <div className="mb-2">
            <strong>Public Key:</strong>
            <div className="font-mono text-sm break-all bg-black p-2 rounded mt-1">
              {pubkey}
            </div>
          </div>
          <div className="mb-2">
            <strong>Address:</strong> ({addressInfo.type})
            <div className="font-mono text-sm break-all bg-black p-2 rounded mt-1">
              {addressInfo.address}
            </div>
          </div>
          {addressInfo.allAddresses && addressInfo.allAddresses.length > 1 && (
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                Other available address formats:
              </p>
              <ul className="list-disc ml-4 text-sm text-gray-400">
                {addressInfo.allAddresses.slice(1).map((addr) => (
                  <li key={addr.address}>
                    {addr.type}: {addr.address}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">
          Account Information
        </h3>
        <div className="grid gap-2">
          <div>
            <strong>Native Balance:</strong>
            <div className="grid grid-cols-2 gap-2 ml-4 mt-1">
              <p>
                Available: {formattedNativeBalance} {chain.ticker}
              </p>
              <p>
                Total:{" "}
                {(
                  Number(balance.balances.native.total) /
                  Math.pow(10, chain.decimals)
                ).toFixed(chain.decimals)}{" "}
                {chain.ticker}
              </p>
              {balance.balances.native.unconfirmed !== "0" &&
                !isNaN(Number(balance.balances.native.unconfirmed)) && (
                  <p>
                    Unconfirmed:{" "}
                    {(
                      Number(balance.balances.native.unconfirmed) /
                      Math.pow(10, chain.decimals)
                    ).toFixed(chain.decimals)}{" "}
                    {chain.ticker}
                  </p>
                )}
            </div>
          </div>
          {balance.balances.tokens && balance.balances.tokens.length > 0 && (
            <div>
              <strong>Tokens:</strong>
              <div className="ml-4 mt-1">
                {balance.balances.tokens.map((token, index) => (
                  <div key={index} className="mb-2">
                    <p>
                      {token.token.name} ({token.token.ticker})
                    </p>
                    <p className="text-sm text-gray-400">
                      Amount:{" "}
                      {(
                        Number(token.amount) /
                        Math.pow(10, Number(token.token.decimals))
                      ).toFixed(Number(token.token.decimals))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {balance.balances.staking && (
            <div>
              <strong>Staking:</strong>
              <div className="grid gap-1 ml-4 mt-1">
                <p>
                  Total:{" "}
                  {(
                    Number(balance.balances.staking.total) /
                    Math.pow(10, chain.decimals)
                  ).toFixed(chain.decimals)}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Locked:{" "}
                  {(
                    Number(balance.balances.staking.locked) /
                    Math.pow(10, chain.decimals)
                  ).toFixed(chain.decimals)}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Unlocking:{" "}
                  {(
                    Number(balance.balances.staking.unlocking) /
                    Math.pow(10, chain.decimals)
                  ).toFixed(chain.decimals)}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Unlocked:{" "}
                  {(
                    Number(balance.balances.staking.unlocked) /
                    Math.pow(10, chain.decimals)
                  ).toFixed(chain.decimals)}{" "}
                  {chain.ticker}
                </p>
                {balance.balances.staking.positions &&
                  balance.balances.staking.positions.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Staking Positions:</p>
                      <div className="ml-4">
                        {balance.balances.staking.positions.map(
                          (pos, index) => (
                            <div
                              key={index}
                              className="mb-2 bg-black p-2 rounded"
                            >
                              <p>
                                Amount:{" "}
                                {(
                                  Number(pos.amount) /
                                  Math.pow(10, chain.decimals)
                                ).toFixed(chain.decimals)}{" "}
                                {chain.ticker}
                              </p>
                              <p>Status: {pos.status}</p>
                              <p>
                                Completion:{" "}
                                {new Date(
                                  pos.completionDate * 1000
                                ).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-400">
                                Validators: {pos.validatorAddresses.join(", ")}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {balance.balances.staking.rewards &&
                  ((balance.balances.staking.rewards.native &&
                    balance.balances.staking.rewards.native.length > 0) ||
                    (balance.balances.staking.rewards.tokens &&
                      balance.balances.staking.rewards.tokens.length > 0)) && (
                    <div className="mt-2">
                      <p className="font-semibold">Rewards:</p>
                      <div className="ml-4">
                        {balance.balances.staking.rewards.native &&
                          balance.balances.staking.rewards.native.map(
                            (reward, index) => (
                              <div key={index} className="mb-1">
                                <p>
                                  {(
                                    Number(reward.amount) /
                                    Math.pow(10, chain.decimals)
                                  ).toFixed(chain.decimals)}{" "}
                                  {chain.ticker}
                                  <span className="text-sm text-gray-400">
                                    {" "}
                                    from {reward.validatorAddress}
                                  </span>
                                </p>
                              </div>
                            )
                          )}
                        {balance.balances.staking.rewards.tokens &&
                          balance.balances.staking.rewards.tokens.map(
                            (reward, index) => (
                              <div key={index} className="mb-1">
                                <p>
                                  {(
                                    Number(reward.amount) /
                                    Math.pow(10, Number(reward.token.decimals))
                                  ).toFixed(Number(reward.token.decimals))}{" "}
                                  {reward.token.ticker}
                                  <span className="text-sm text-gray-400">
                                    {" "}
                                    from {reward.validatorAddress}
                                  </span>
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="text-medium text-gray-400 mt-3">
        Type{" "}
        <span className="font-mono">
          <span className="text-purple-500">$</span>{" "}
          <span className="text-blue-500 font-bold">start</span>
        </span>{" "}
        to select a different chain or{" "}
        <span className="font-mono">
          <span className="text-purple-500">$</span>{" "}
          <span className="text-red-500 font-bold">clear</span>
        </span>{" "}
        to clear the terminal.
      </p>
    </div>
  );
};
