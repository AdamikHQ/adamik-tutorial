import React from "react";
import { AdamikChain } from "../adamik/types";
import { formatNumber } from "./utils";

// Function to render chain information
export const renderChainInfo = (
  chainId: string,
  chain: AdamikChain,
  pubkey: string,
  addressInfo: any,
  balance: any
) => {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <p className="text-green-400 font-bold">
          ✓ Chain information retrieved
        </p>
        <p className="text-green-400 font-bold">✓ Public keys generated</p>
        <p className="text-green-400 font-bold">
          ✓ Address for {chain.name} retrieved
        </p>
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
                Available:{" "}
                {formatNumber(
                  balance.balances.native.available,
                  chain.decimals
                )}{" "}
                {chain.ticker}
              </p>
              <p>
                Total:{" "}
                {formatNumber(balance.balances.native.total, chain.decimals)}{" "}
                {chain.ticker}
              </p>
              {balance.balances.native.unconfirmed !== "0" &&
                !isNaN(Number(balance.balances.native.unconfirmed)) && (
                  <p>
                    Unconfirmed:{" "}
                    {formatNumber(
                      balance.balances.native.unconfirmed,
                      chain.decimals
                    )}{" "}
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
                      {formatNumber(token.amount, Number(token.token.decimals))}
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
                  {formatNumber(balance.balances.staking.total, chain.decimals)}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Locked:{" "}
                  {formatNumber(
                    balance.balances.staking.locked,
                    chain.decimals
                  )}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Unlocking:{" "}
                  {formatNumber(
                    balance.balances.staking.unlocking,
                    chain.decimals
                  )}{" "}
                  {chain.ticker}
                </p>
                <p>
                  Unlocked:{" "}
                  {formatNumber(
                    balance.balances.staking.unlocked,
                    chain.decimals
                  )}{" "}
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
                                {formatNumber(pos.amount, chain.decimals)}{" "}
                                {chain.ticker}
                              </p>
                              <p>Status: {pos.status}</p>
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
                                  {formatNumber(reward.amount, chain.decimals)}{" "}
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
                                  {formatNumber(
                                    reward.amount,
                                    Number(reward.token.decimals)
                                  )}{" "}
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
          <span className="text-blue-500 font-bold">prepare-tx</span>
        </span>{" "}
        to prepare a transaction for this chain.
      </p>
    </div>
  );
};
