import { network } from "hardhat";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAddress } from "viem";
import ContractModule from "../ignition/modules/ProxyModule.js";

describe("Contract", async function () {
  const { ignition, viem } = await network.connect();

  const [owner, otherAccount] = await viem.getWalletClients();

  const { contract } = await ignition.deploy(ContractModule);

  describe("Proxy interaction", function () {
    it("Should be usable via proxy", async function () {
      assert.equal(
        getAddress(await contract.read.owner()),
        getAddress(owner.account.address),
      );
    });
  });
});
