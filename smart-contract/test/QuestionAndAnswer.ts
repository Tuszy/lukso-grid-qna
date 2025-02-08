// Crypto
import { ethers, lspFactory, Web3Provider } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Test
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

// Universal Profile
import { getUniversalProfiles } from "../test-util/universal-profile";

// Constants
import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  LSP4_TOKEN_TYPES,
  LSP8_TOKEN_ID_FORMAT,
} from "@lukso/lsp-smart-contracts";

// Interface Id
import { interfaceIdOfQnA } from "../test-util/Interfaces";

// Schema
import ERC725, { ERC725JSONSchema } from "@erc725/erc725.js";
import LSP4DigitalAssetSchema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";
import { lsp4MetadataVerifiableUrl } from "../test-util/util";

const name = "Question & Answer";
const symbol = "QnA";

describe("QuestionAndAnswer", function () {
  async function deployFixture() {
    const [owner] = await ethers.getSigners();

    const ownerProfile = await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [owner.address],
    });

    const universalProfileAddress = ownerProfile.LSP0ERC725Account.address;

    const exactReward = ethers.parseEther("1.0");
    const QnA = await ethers.getContractFactory("QuestionAndAnswer");
    const qna = await QnA.deploy(
      universalProfileAddress,
      lsp4MetadataVerifiableUrl,
      exactReward
    );

    const [qnaOwner, asker] = await getUniversalProfiles(qna, ownerProfile);

    const lowerThanReward = ethers.parseEther("0.999999999999999999");
    const greaterThanReward = ethers.parseEther("1.000000000000000001");
    const answer = "I am fine";
    const question = "How are you?";
    const questionId = ethers.keccak256(ethers.toUtf8Bytes(question));

    return {
      QnA,
      qna,
      qnaOwner,
      asker,
      questionId,
      question,
      answer,
      exactReward,
      lowerThanReward,
      greaterThanReward,
    };
  }

  describe("Deployment", function () {
    it("Should revert if owner is an EOA", async function () {
      const [owner] = await ethers.getSigners();

      const QnA = await ethers.getContractFactory("QuestionAndAnswer");
      await expect(
        QnA.deploy(
          owner.address,
          lsp4MetadataVerifiableUrl,
          ethers.parseUnits("1.0", "ether")
        )
      ).to.be.reverted;
    });

    it("Should set the right QNA name", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(
        ethers.toUtf8String(
          await qna.getData(ERC725YDataKeys.LSP4.LSP4TokenName)
        )
      ).to.equal(name);
    });

    it("Should set the right QNA symbol", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(
        ethers.toUtf8String(
          await qna.getData(ERC725YDataKeys.LSP4.LSP4TokenSymbol)
        )
      ).to.equal(symbol);
    });

    it("Should set the default lsp4 metadata json", async function () {
      const { qna } = await loadFixture(deployFixture);

      /*const erc725 = new ERC725(
        LSP4DigitalAssetSchema,
        await qna.getAddress(),
        Web3Provider,
        {
          ipfsGateway: "https://api.universalprofile.cloud/ipfs/",
        }
      );

      console.log("DATA:", await erc725.fetchData("LSP4Metadata"));*/

      expect(await qna.getData(ERC725YDataKeys.LSP4.LSP4Metadata)).to.equal(
        lsp4MetadataVerifiableUrl
      );
    });

    it("Should set the token id type to hash id", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(
        await qna.getData(ERC725YDataKeys.LSP8.LSP8TokenIdFormat)
      ).to.equal(BigInt(LSP8_TOKEN_ID_FORMAT.HASH));
    });

    it("Should set the correct base uri", async function () {
      const { qna } = await loadFixture(deployFixture);
      expect(
        await qna.getData(ERC725YDataKeys.LSP8.LSP8TokenMetadataBaseURI)
      ).to.equal(
        ethers.concat([
          "0x00008019f9b10000",
          ethers.toUtf8Bytes("https://lukso-grid-qna-baseuri.tuszy.com/"),
          ethers.toUtf8Bytes((await qna.getAddress()).toLowerCase()),
          ethers.toUtf8Bytes("/"),
        ])
      );
    });

    it("Should set the right token type", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(await qna.getData(ERC725YDataKeys.LSP4.LSP4TokenType)).to.equal(
        BigInt(LSP4_TOKEN_TYPES.NFT)
      );
    });

    it("Should set the creators array length to 1", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(
        await qna.getData(ERC725YDataKeys.LSP4["LSP4Creators[]"].length)
      ).to.equal(ethers.zeroPadValue(ethers.toBeHex(1), 16));
    });

    it("Should add the owner to the creators array", async function () {
      const { qna, qnaOwner } = await loadFixture(deployFixture);

      expect(
        await qna.getData(
          ethers.concat([
            ERC725YDataKeys.LSP4["LSP4Creators[]"].index,
            ethers.zeroPadValue(ethers.toBeHex(0), 16),
          ])
        )
      ).to.equal(qnaOwner.universalProfileAddress.toLowerCase());
    });

    it("Should add the owner to the creators map", async function () {
      const { qna, qnaOwner } = await loadFixture(deployFixture);

      expect(
        await qna.getData(
          ethers.concat([
            ERC725YDataKeys.LSP4.LSP4CreatorsMap,
            qnaOwner.universalProfileAddress,
          ])
        )
      ).to.equal(
        ethers.concat([
          INTERFACE_IDS.LSP0ERC725Account,
          ethers.zeroPadValue(ethers.toBeHex(0), 16),
        ])
      );
    });

    it("Should set the right owner", async function () {
      const { qna, qnaOwner } = await loadFixture(deployFixture);

      expect(await qna.owner()).to.equal(qnaOwner.universalProfileAddress);
    });

    it("Should allow assigning a universal profile address as the owner", async function () {
      const { QnA, qnaOwner } = await loadFixture(deployFixture);

      let qnaPromise = QnA.deploy(
        qnaOwner.universalProfileAddress,
        lsp4MetadataVerifiableUrl,
        ethers.parseUnits("1.0", "ether")
      );
      await expect(qnaPromise).not.to.be.reverted;
      const qna = await qnaPromise;
      expect(await qna.owner()).to.equal(qnaOwner.universalProfileAddress);
    });

    it("Should support QnA interface id", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(await qna.supportsInterface(interfaceIdOfQnA)).to.equal(true);
    });

    it("Should support ERC725Y interface id", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(await qna.supportsInterface(INTERFACE_IDS.ERC725Y)).to.equal(true);
    });

    it("Should support LSP8 interface id", async function () {
      const { qna } = await loadFixture(deployFixture);

      expect(
        await qna.supportsInterface(INTERFACE_IDS.LSP8IdentifiableDigitalAsset)
      ).to.equal(true);
    });

    it("Should initialize the min reward", async function () {
      const { qna, exactReward } = await loadFixture(deployFixture);

      expect(await qna.minReward()).to.be.equal(exactReward);
    });
  });

  describe("function ask(bytes32 questionId, bytes memory questionUrl) external payable", function () {
    it("Should revert with the the custom error OwnerMustNotBeAsker if the asker is the owner", async function () {
      const { qna, exactReward, qnaOwner, question } = await loadFixture(
        deployFixture
      );

      await expect(
        qnaOwner.ask(question, exactReward)
      ).to.be.revertedWithCustomError(qna, "OwnerMustNotBeAsker");
    });

    it("Should revert with the the custom error ValueMustBeGreaterThanOrEqualMinReward if the sent value is below the minimum reward", async function () {
      const { qna, lowerThanReward, asker, question } = await loadFixture(
        deployFixture
      );

      await expect(
        asker.ask(question, lowerThanReward)
      ).to.be.revertedWithCustomError(
        qna,
        "ValueMustBeGreaterThanOrEqualMinReward"
      );
    });

    it("Should pass if the sent value is equal to the minimum reward", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await expect(asker.ask(question, exactReward)).not.to.be.reverted;
    });

    it("Should pass if the sent value is greater than the minimum reward", async function () {
      const { greaterThanReward, asker, question } = await loadFixture(
        deployFixture
      );

      await expect(asker.ask(question, greaterThanReward)).not.to.be.reverted;
    });

    it("Should fail if asker is an EOA", async function () {
      const { qna, exactReward, question, questionId } = await loadFixture(
        deployFixture
      );

      await expect(
        qna.ask(questionId, ethers.toUtf8Bytes(question), {
          value: exactReward,
        })
      ).to.be.revertedWithCustomError(qna, "OwnerMustNotBeAnEOA");
    });

    it("Should increase the total supply on valid question", async function () {
      const { qna, question, exactReward, asker } = await loadFixture(
        deployFixture
      );

      expect(await qna.totalSupply()).to.be.equal(0);

      await asker.ask(question, exactReward);

      expect(await qna.totalSupply()).to.be.equal(1);
    });

    it("Should revert with the the custom error QuestionHasAlreadyBeenAsked if the asked question has already been asked (questionId equals to keccak256 hash of question string value)", async function () {
      const { qna, question, exactReward, asker } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        asker.ask(question, exactReward)
      ).to.be.revertedWithCustomError(qna, "QuestionHasAlreadyBeenAsked");
    });

    it("Should set the question in the according 'Question' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await asker.getDataForTokenId(question, "Question");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes(question)));
    });

    it("Should set the answer in the according 'Answer' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await asker.getDataForTokenId(question, "Answer");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should set the answered value of the question to false", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.answered(questionId)).to.be.equal(false);
    });

    it("Should set the asker in the according 'Asker' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await asker.getDataForTokenId(question, "Asker");
      expect(ethers.hexlify(data).toUpperCase()).to.be.equal(
        asker.universalProfileAddress.toUpperCase()
      );
    });

    it("Should set the ask timestamp in the according 'AskTimestamp' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await asker.getDataForTokenId(question, "AskTimestamp");
      expect(ethers.toBigInt(data)).to.be.equal(await time.latest());
    });

    it("Should set the reward in the according 'Reward' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await asker.getDataForTokenId(question, "Reward");
      expect(ethers.toBigInt(data)).to.be.equal(exactReward);
    });

    it("Should set the reward in the according 'Reward' key (2)", async function () {
      const { greaterThanReward, asker, question } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, greaterThanReward);
      const data = await asker.getDataForTokenId(question, "Reward");
      expect(ethers.toBigInt(data)).to.be.equal(greaterThanReward);
    });

    it("Should send LSP8 token with question id to asker", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.tokenOwnerOf(questionId)).to.be.equal(
        asker.universalProfileAddress
      );
      expect(
        (await qna.tokenIdsOf(asker.universalProfileAddress))[0]
      ).to.be.equal(questionId);
    });

    it("Should pass if the same question is asked after being revoked", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      await expect(asker.revoke(question)).to.not.be.reverted;
      await expect(asker.ask(question, exactReward)).to.not.be.reverted;
    });

    it("Should emit the QuestionAsked event on successful ask", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await expect(asker.ask(question, exactReward))
        .to.emit(qna, "QuestionAsked")
        .withArgs(asker.universalProfileAddress, questionId, exactReward);
    });
  });

  describe("function answer(bytes32 questionId, bytes memory answerUrl) external", function () {
    it("Should pass if the question exists", async function () {
      const { exactReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      await expect(qnaOwner.answer(question, answer)).to.not.be.reverted;
    });

    it("Should revert if the question does not exist", async function () {
      const { question, qnaOwner, answer } = await loadFixture(deployFixture);

      await expect(qnaOwner.answer(question, answer)).to.be.reverted;
    });

    it("Should revert if the question has been revoked", async function () {
      const { asker, exactReward, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);

      await expect(qnaOwner.answer(question, answer)).to.be.reverted;
    });

    it("Should pass and return the reward if the question has been answered", async function () {
      const { exactReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      const beforeBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      await qnaOwner.answer(question, answer);
      const afterBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(exactReward);
    });

    it("Should pass and return the reward if the question has been answered (2)", async function () {
      const { greaterThanReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, greaterThanReward);

      const beforeBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      await qnaOwner.answer(question, answer);
      const afterBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(greaterThanReward);
    });

    it("Should pass and return the same reward if the question has been answered after the min reward was changed", async function () {
      const { greaterThanReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, greaterThanReward);

      await qnaOwner.setMinReward(ethers.parseEther("0.001"));

      const beforeBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      await qnaOwner.answer(question, answer);
      const afterBalance =
        await qnaOwner.universalProfileOwner.provider.getBalance(
          qnaOwner.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(greaterThanReward);
    });

    it("Should revert if the question to be answered has already been answered", async function () {
      const { qna, asker, question, exactReward, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      await expect(
        qnaOwner.answer(question, answer)
      ).to.be.revertedWithCustomError(qna, "QuestionHasAlreadyBeenAnswered");
    });

    it("Should set the answer in the according 'Answer' key", async function () {
      const { exactReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      const data = await asker.getDataForTokenId(question, "Answer");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes(answer)));
    });

    it("Should set the answer timestamp in the according 'AnswerTimestamp' key", async function () {
      const { exactReward, asker, question, qnaOwner, answer } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      const data = await asker.getDataForTokenId(question, "AnswerTimestamp");
      expect(ethers.toBigInt(data)).to.be.equal(await time.latest());
    });

    it("Should set the answered value of the question to true", async function () {
      const {
        qna,
        exactReward,
        asker,
        question,
        questionId,
        qnaOwner,
        answer,
      } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      expect(await qna.answered(questionId)).to.be.equal(true);
    });

    it("Should emit the QuestionAnswered event on successful ask", async function () {
      const {
        qna,
        exactReward,
        asker,
        question,
        questionId,
        answer,
        qnaOwner,
      } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      await expect(qnaOwner.answer(question, answer))
        .to.emit(qna, "QuestionAnswered")
        .withArgs(asker.universalProfileAddress, questionId, exactReward);
    });
  });

  describe("function revoke(bytes32 questionId) external", function () {
    it("Should revert if the question to be revoked is not existing", async function () {
      const { asker, question } = await loadFixture(deployFixture);

      await expect(asker.revoke(question)).to.be.reverted;
    });

    it("Should revert with the the custom error QuestionHasAlreadyBeenAnswered if the question to be revoked has been answered", async function () {
      const { qna, exactReward, asker, question, answer, qnaOwner } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      await expect(asker.revoke(question)).to.be.revertedWithCustomError(
        qna,
        "QuestionHasAlreadyBeenAnswered"
      );
    });

    it("Should pass if the question to be revoked has not been answered", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      await expect(asker.revoke(question)).to.not.be.reverted;
    });

    it("Should pass and return the reward if the question to be revoked has not been answered", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      const beforeBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      await asker.revoke(question);
      const afterBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(exactReward);
    });

    it("Should pass and return the reward if the question to be revoked has not been answered (2)", async function () {
      const { greaterThanReward, asker, question } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, greaterThanReward);

      const beforeBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      await asker.revoke(question);
      const afterBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(greaterThanReward);
    });

    it("Should pass and return the same reward if the question to be revoked has not been answered and is revoked after the min reward was changed", async function () {
      const { greaterThanReward, asker, question, qnaOwner } =
        await loadFixture(deployFixture);

      await asker.ask(question, greaterThanReward);

      await qnaOwner.setMinReward(ethers.parseEther("0.001"));

      const beforeBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      await asker.revoke(question);
      const afterBalance =
        await asker.universalProfileOwner.provider.getBalance(
          asker.universalProfileAddress
        );
      expect(afterBalance - beforeBalance).to.be.eq(greaterThanReward);
    });

    it("Should revert if the question to be revoked has already been revoked", async function () {
      const { asker, question, exactReward } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      await expect(asker.revoke(question)).to.be.reverted;
    });

    it("Should clear the question in the according 'Question' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "Question");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should clear the answer in the according 'Answer' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "Answer");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should clear the answered value of the question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      expect(await qna.answered(questionId)).to.be.equal(false);
    });

    it("Should clear the reward in the according 'Reward' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "Reward");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should clear the reward in the according 'Asker' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "Asker");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should clear the reward in the according 'AskTimestamp' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "AskTimestamp");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should clear the reward in the according 'AnswerTimestamp' key", async function () {
      const { exactReward, asker, question } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await asker.revoke(question);
      const data = await asker.getDataForTokenId(question, "AnswerTimestamp");
      expect(data).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
    });

    it("Should emit the QuestionRevoked event on successful ask", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);

      await expect(asker.revoke(question))
        .to.emit(qna, "QuestionRevoked")
        .withArgs(asker.universalProfileAddress, questionId, exactReward);
    });
  });
  describe("function setMinReward(uint256 newMinReward) external", function () {
    it("Should revert with the the custom error MinRewardHasNotChanged if the owner tries to set the same min reward", async function () {
      const { qna, qnaOwner, exactReward } = await loadFixture(deployFixture);

      await expect(
        qnaOwner.setMinReward(exactReward)
      ).to.be.revertedWithCustomError(qna, "MinRewardHasNotChanged");
    });

    it("Should pass if a new min reward is set", async function () {
      const { qna, qnaOwner, greaterThanReward } = await loadFixture(
        deployFixture
      );

      await expect(qnaOwner.setMinReward(greaterThanReward)).to.not.be.reverted;

      expect(await qna.minReward()).to.be.equal(greaterThanReward);
    });

    it("Should revert if the anyone but the owner tries to set the min reward", async function () {
      const { asker, exactReward } = await loadFixture(deployFixture);

      await expect(asker.setMinReward(exactReward)).to.be.reverted;
    });
  });

  describe("function getAskTimestamp(bytes32 questionId) external view returns (uint256)", function () {
    it("Should revert if trying to get the ask timestamp value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getAskTimestamp(questionId)).to.be.reverted;
    });

    it("Should return the ask timestamp value for an existing question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.getAskTimestamp(questionId)).to.be.equal(
        await time.latest()
      );
    });
  });

  describe("function getAnswerTimestamp(bytes32 questionId) external view returns (uint256)", function () {
    it("Should revert if trying to get the answer timestamp value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getAnswerTimestamp(questionId)).to.be.reverted;
    });

    it("Should return the answer timestamp value for an existing question", async function () {
      const {
        qna,
        exactReward,
        asker,
        question,
        questionId,
        qnaOwner,
        answer,
      } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      await qnaOwner.answer(question, answer);
      expect(await qna.getAnswerTimestamp(questionId)).to.be.equal(
        await time.latest()
      );
    });
  });

  describe("function getAskerTimestamp(bytes32 questionId) external view returns (address)", function () {
    it("Should revert if trying to get the answer timestamp value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getAsker(questionId)).to.be.reverted;
    });

    it("Should return the asker address for an existing question", async function () {
      const { exactReward, asker, qna, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const data = await qna.getAsker(questionId);
      expect(ethers.hexlify(data).toUpperCase()).to.be.equal(
        asker.universalProfileAddress.toUpperCase()
      );
    });
  });

  describe("function getReward(bytes32 questionId) external view returns (uint256)", function () {
    it("Should revert if trying to get the reward value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getReward(questionId)).to.be.reverted;
    });

    it("Should return the reward value for an existing question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.getReward(questionId)).to.be.equal(exactReward);
    });
  });
  describe("function getAnswer(bytes32 questionId) external view returns (bytes memory)", function () {
    it("Should revert if trying to get the answer value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getAnswer(questionId)).to.be.reverted;
    });

    it("Should return the answer value for an existing question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.getAnswer(questionId)).to.be.equal(
        ethers.hexlify(ethers.toUtf8Bytes(""))
      );
    });
  });
  describe("function getQuestion(bytes32 questionId) external view returns (bytes memory)", function () {
    it("Should revert if trying to get the question value for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getQuestion(questionId)).to.be.reverted;
    });

    it("Should return the question value for an existing question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      expect(await qna.getQuestion(questionId)).to.be.equal(
        ethers.hexlify(ethers.toUtf8Bytes(question))
      );
    });
  });

  describe("function getQuestionAndAnswer(bytes32 questionId) external view  returns (address asker, uint256 reward, uint256 askTimestamp, uint256 answerTimestamp, bytes memory q, bytes memory a, bool isAnswered)", function () {
    it("Should revert if trying to get the question and answer values for a non existing question", async function () {
      const { qna, questionId } = await loadFixture(deployFixture);

      await expect(qna.getQuestionAndAnswer(questionId)).to.be.reverted;
    });

    it("Should return the question and answer values for an asked question", async function () {
      const { qna, exactReward, asker, question, questionId } =
        await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const {
        reward,
        q,
        a,
        isAnswered,
        asker: askingAddress,
        askTimestamp,
      } = await qna.getQuestionAndAnswer(questionId);
      expect(reward).to.be.equal(exactReward);
      expect(q).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes(question)));
      expect(a).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes("")));
      expect(askingAddress.toUpperCase()).to.be.equal(
        asker.universalProfileAddress.toUpperCase()
      );
      expect(askTimestamp).to.be.equal(await time.latest());
      expect(isAnswered).to.be.equal(false);
    });

    it("Should return the question and answer values for an answered question", async function () {
      const {
        qna,
        exactReward,
        asker,
        question,
        questionId,
        qnaOwner,
        answer,
      } = await loadFixture(deployFixture);

      await asker.ask(question, exactReward);
      const { askTimestamp } = await qna.getQuestionAndAnswer(questionId);
      expect(askTimestamp).to.be.equal(await time.latest());
      await qnaOwner.answer(question, answer);
      const {
        reward,
        q,
        a,
        isAnswered,
        answerTimestamp,
        asker: askingAddress,
      } = await qna.getQuestionAndAnswer(questionId);
      expect(reward).to.be.equal(exactReward);
      expect(q).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes(question)));
      expect(a).to.be.equal(ethers.hexlify(ethers.toUtf8Bytes(answer)));
      expect(askingAddress.toUpperCase()).to.be.equal(
        asker.universalProfileAddress.toUpperCase()
      );
      expect(answerTimestamp).to.be.equal(await time.latest());
      expect(isAnswered).to.be.equal(true);
    });
  });

  describe("function setDataForTokenId(bytes32 tokenId, bytes32 dataKey, bytes memory dataValue) public virtual", function () {
    it("Should revert with the the custom error MustNotSetQuestionKeyManually if the owner tries to manipulate the question", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "Question", "random")
      ).to.be.revertedWithCustomError(qna, "MustNotSetQuestionKeyManually");
    });

    it("Should revert with the the custom error MustNotSetAnswerKeyManually if the owner tries to manipulate the answer", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "Answer", "random")
      ).to.be.revertedWithCustomError(qna, "MustNotSetAnswerKeyManually");
    });

    it("Should revert with the the custom error MustNotSetRewardKeyManually if the owner tries to manipulate the reward", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "Reward", "random")
      ).to.be.revertedWithCustomError(qna, "MustNotSetRewardKeyManually");
    });

    it("Should revert with the the custom error MustNotSetAskerKeyManually if the owner tries to manipulate the asker", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "Asker", "random")
      ).to.be.revertedWithCustomError(qna, "MustNotSetAskerKeyManually");
    });

    it("Should revert with the the custom error MustNotSetAskTimestampKeyManually if the owner tries to manipulate the ask timestamp", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "AskTimestamp", "random")
      ).to.be.revertedWithCustomError(qna, "MustNotSetAskTimestampKeyManually");
    });

    it("Should revert with the the custom error MustNotSetAnswerTimestampKeyManually if the owner tries to manipulate the answer timestamp", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        qnaOwner.setDataForTokenId(question, "AnswerTimestamp", "random")
      ).to.be.revertedWithCustomError(
        qna,
        "MustNotSetAnswerTimestampKeyManually"
      );
    });
  });

  describe("function renounceOwnership() public virtual", async function () {
    it("Should revert with the the custom error TransferringOwnershipIsNotAllowed if the owner tries to renounce the ownership", async function () {
      const { qna, qnaOwner } = await loadFixture(deployFixture);

      await expect(qnaOwner.renounceOwnership()).to.be.revertedWithCustomError(
        qna,
        "TransferringOwnershipIsNotAllowed"
      );
    });

    it("Should revert if anyone tries to renounce the ownership", async function () {
      const { asker } = await loadFixture(deployFixture);

      await expect(asker.renounceOwnership()).to.be.reverted;
    });
  });

  describe("function transferOwnership(address) public virtual", async function () {
    it("Should revert with the the custom error TransferringOwnershipIsNotAllowed if the owner tries to transfer the ownership", async function () {
      const { qna, qnaOwner, asker } = await loadFixture(deployFixture);

      await expect(
        qnaOwner.transferOwnership(asker.universalProfileAddress)
      ).to.be.revertedWithCustomError(qna, "TransferringOwnershipIsNotAllowed");
    });

    it("Should revert if anyone tries to transfer the ownership", async function () {
      const { asker } = await loadFixture(deployFixture);

      await expect(asker.transferOwnership(asker.universalProfileAddress)).to.be
        .reverted;
    });
  });

  describe("function transfer(address from, address to, bytes32 tokenId, bool force, bytes memory data) public virtual", async function () {
    it("Should revert with the the custom error OwnerMustNotBeAsker if a question is transferred to the owner", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        asker.transfer(qnaOwner.universalProfileAddress, question)
      ).to.be.revertedWithCustomError(qna, "OwnerMustNotBeAsker");
    });

    it("Should revert with the the custom error OwnerMustNotBeAnEOA if a question is transferred to an EOA", async function () {
      const { qna, qnaOwner, question, asker, exactReward } = await loadFixture(
        deployFixture
      );

      await asker.ask(question, exactReward);

      await expect(
        asker.transfer(qnaOwner.universalProfileOwner.address, question)
      ).to.be.revertedWithCustomError(qna, "OwnerMustNotBeAnEOA");
    });
  });
});
