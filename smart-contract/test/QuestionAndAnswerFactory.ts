// Crypto
import { ethers, lspFactory } from "hardhat";

// Test
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

// LSP4
import { lsp4MetadataVerifiableUrl } from "../test-util/util";

describe("QuestionAndAnswerFactory", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();

    const ownerProfile = await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [owner.address],
    });

    const universalProfileAddress = ownerProfile.LSP0ERC725Account.address;

    const exactReward = ethers.parseEther("1.0");
    const QnAFactory = await ethers.getContractFactory(
      "QuestionAndAnswerFactory"
    );

    return {
      QnAFactory,
      universalProfileAddress,
      exactReward,
    };
  }

  describe("Deployment", function () {
    it("Should deploy a QNA contract and assign the given owner", async function () {
      const { QnAFactory, universalProfileAddress } = await loadFixture(
        deployFixture
      );

      const qnaFactory = await QnAFactory.deploy();

      const qnaTx = await qnaFactory.CreateNewQuestionAndAnswerContract(
        universalProfileAddress,
        lsp4MetadataVerifiableUrl,
        ethers.parseUnits("1.0", "ether")
      );

      const qnaRc = await qnaTx.wait();

      const event = qnaRc.logs.find(
        (l) => l?.fragment?.name === "QuestionAndAnswerContractCreated"
      );

      expect(event).not.to.be.undefined;
      expect(event!.args[0]).not.to.be.undefined;
      expect(event!.args[1]).not.to.be.undefined;

      expect(
        await qnaFactory.QuestionAndAnswerMapping(universalProfileAddress)
      ).to.equal(event!.args[0]);
      expect(universalProfileAddress).to.equal(event!.args[1]);
    });
  });

  it("Should revert with QuestionAndAnswerContractAlreadyDeployed if a user tries to deploy another QNA contract", async function () {
    const { QnAFactory, universalProfileAddress } = await loadFixture(
      deployFixture
    );

    const qnaFactory = await QnAFactory.deploy();

    const qnaRc = await (
      await qnaFactory.CreateNewQuestionAndAnswerContract(
        universalProfileAddress,
        lsp4MetadataVerifiableUrl,
        ethers.parseUnits("1.0", "ether")
      )
    ).wait();
    const event = qnaRc.logs.find(
      (l) => l?.fragment?.name === "QuestionAndAnswerContractCreated"
    );
    expect(event).not.to.be.undefined;
    expect(event!.args[0]).not.to.be.undefined;
    expect(event!.args[1]).not.to.be.undefined;

    await expect(
      qnaFactory.CreateNewQuestionAndAnswerContract(
        universalProfileAddress,
        lsp4MetadataVerifiableUrl,
        ethers.parseUnits("1.0", "ether")
      )
    ).to.be.revertedWithCustomError(
      QnAFactory,
      "QuestionAndAnswerContractAlreadyDeployed"
    );
  });
});
