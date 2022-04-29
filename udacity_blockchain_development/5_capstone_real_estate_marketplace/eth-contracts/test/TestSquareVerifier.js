// define a variable to import the <Verifier> or <renamedVerifier> solidity contract generated by Zokrates
const zokratesVerifier = artifacts.require("ZokratesVerifier")

// Test verification with correct proof
// - use the contents from proof.json generated from zokrates steps
const proof = require("../../zokrates/proof")

// Test verification with incorrect proof
contract.only("ZokratesVerifier", (accounts) => {
  const account_one = accounts[0]

  describe("Test verification with correct proof", function () {
    beforeEach(async function () {
      this.contract = await zokratesVerifier.new({ from: account_one })
    })

    it("verification with correct proof", async function () {
      const result = await this.contract.verifyTx.call(
        proof.proof.a,
        proof.proof.b,
        proof.proof.c,
        proof.inputs,
        { from: account_one }
      )

      assert.equal(result, true, "Unexpected verification result")
    })

    // Test verification with incorrect proof
    it("Test verification with incorrect proof", async function () {
      const inputs = [1, 2]
      const result = await this.contract.verifyTx.call(
        proof.proof.a,
        proof.proof.b,
        proof.proof.c,
        inputs,
        { from: account_one }
      )

      assert.equal(result, false, "The proof is not correct")
    })
  })
})
