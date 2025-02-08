import { ethers } from "hardhat";

// added manually
const deployedAddresses: Record<string, string | null> = {
  LuksoTestnet: null,
  LuksoMainnet: "0xe1dA84dF8b3700CD406738E72AB0fbAf559b474F",
};

async function main() {
  const [qnaOwner] = await ethers.getSigners();

  const deployedAddress =
    deployedAddresses[(await qnaOwner.provider.getNetwork()).name];
  if (!deployedAddress) {
    try {
      const questionAndAnswerFactory = await ethers.deployContract(
        "QuestionAndAnswerFactory"
      );

      await questionAndAnswerFactory.waitForDeployment();
      console.log(
        `Q&A factory smart contract deployed to ${questionAndAnswerFactory.target}`
      );
    } catch (e) {
      console.log("Failed to deploy Q&A smart contract ", e);
    }
  } else {
    console.log(`Q&A factory smart contract deployed to ${deployedAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
