// Hardhat
import { ethers, lspFactory } from "hardhat";

// Types
import {
  keccak256,
  toUtf8Bytes,
  type AddressLike,
  type BigNumberish,
  type BytesLike,
  type Interface,
} from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { QuestionAndAnswer } from "../typechain-types";

// Interfaces
import {
  LSP0ERC725AccountABIInterface,
  LSP6KeyManagerInterface,
  QuestionAndAnswerInterface,
} from "./Interfaces";

// Constants
import { OPERATION_TYPES } from "@lukso/lsp-smart-contracts";
import { DeployedUniversalProfileContracts } from "@lukso/lsp-factory.js";

export const createUniversalProfile = async (
  universalProfileOwner: HardhatEthersSigner,
  qna: QuestionAndAnswer,
  profile?: DeployedUniversalProfileContracts
) => {
  const universalProfile =
    profile ??
    (await lspFactory.UniversalProfile.deploy({
      controllerAddresses: [universalProfileOwner.address],
    }));

  const universalProfileAddress = universalProfile.LSP0ERC725Account.address;

  const qnaContractAddress = await qna.getAddress();

  const QnaContract = new ethers.Contract(
    qnaContractAddress,
    QuestionAndAnswerInterface,
    universalProfileOwner
  );

  const LSP0ERC725Account = new ethers.Contract(
    universalProfileAddress,
    LSP0ERC725AccountABIInterface,
    universalProfileOwner
  );

  const LSP6KeyManager = new ethers.Contract(
    universalProfile.LSP6KeyManager.address,
    LSP6KeyManagerInterface,
    universalProfileOwner
  );

  const execute = async (
    functionName: string,
    value: BigNumberish,
    ...params: any[]
  ) => {
    const encodedInterfaceCall = QuestionAndAnswerInterface.encodeFunctionData(
      functionName,
      params
    );

    const tx = await LSP0ERC725Account.execute(
      OPERATION_TYPES.CALL,
      qnaContractAddress,
      value,
      encodedInterfaceCall,
      { value: value != 0 ? value : undefined }
    );

    return await tx.wait();
  };

  const questionToId = (question: string) =>
    ethers.keccak256(ethers.toUtf8Bytes(question));

  const ask = async (question: string, value: BigNumberish) =>
    await execute(
      "ask",
      value,
      questionToId(question),
      ethers.toUtf8Bytes(question)
    );

  const revoke = async (question: string) =>
    await execute("revoke", 0, questionToId(question));

  const answer = async (question: string, answer: string) =>
    await execute(
      "answer",
      0,
      questionToId(question),
      ethers.toUtf8Bytes(answer)
    );

  const setMinReward = async (newMinReward: BigNumberish) =>
    await execute("setMinReward", 0, newMinReward);

  const renounceOwnership = async () => await execute("renounceOwnership", 0);

  const transferOwnership = async (newOwner: AddressLike) =>
    await execute("transferOwnership", 0, newOwner);

  const transfer = async (to: AddressLike, question: string) =>
    await execute(
      "transfer",
      0,
      universalProfileAddress,
      to,
      questionToId(question),
      false,
      ethers.ZeroHash
    );

  const setDataForTokenId = async (
    question: string,
    key: string,
    value: string
  ) =>
    await execute(
      "setDataForTokenId",
      0,
      questionToId(question),
      keccak256(toUtf8Bytes(key)),
      toUtf8Bytes(value)
    );

  const getDataForTokenId = async (question: string, key: string) =>
    await qna.getDataForTokenId(
      questionToId(question),
      keccak256(toUtf8Bytes(key))
    );

  return {
    universalProfileOwner, // EOA (= Owner -> KeyManager -> Universal Profile)
    universalProfile, // Universal Profile contract instance
    universalProfileAddress, // Universal Profile address
    ask,
    revoke,
    answer,
    setMinReward,
    renounceOwnership,
    transferOwnership,
    transfer,
    setDataForTokenId,
    getDataForTokenId,
  };
};

// Local constant
const MAX_ACCOUNTS = 5;
export const getUniversalProfiles = async (
  qna: QuestionAndAnswer,
  ownerProfile: DeployedUniversalProfileContracts
) => {
  const signers = await ethers.getSigners();

  const accounts = [];
  for (let i = 0; i < MAX_ACCOUNTS && i < signers.length; i++) {
    accounts.push(
      await createUniversalProfile(
        signers[i],
        qna,
        i === 0 ? ownerProfile : undefined
      )
    );
  }

  return accounts;
};
