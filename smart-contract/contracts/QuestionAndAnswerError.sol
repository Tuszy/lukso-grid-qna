// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.20;

/**
 * @dev Reverts when trying to revoke/answer an already answered question (0x26ed4fe2)
 */
error QuestionHasAlreadyBeenAnswered(bytes32 questionId);

/**
 * @dev Reverts when trying to ask the same question - keccak256(question value as string) (0x238b2123)
 */
error QuestionHasAlreadyBeenAsked(bytes32 questionId);

/**
 * @dev Reverts when trying to ask a question while sending a value that is lower than the minimum reward (0x491f1b7d)
 */
error ValueMustBeGreaterThanOrEqualMinReward(
    uint256 minReward,
    uint256 sentValue
);

/**
 * @dev Reverts when trying to set the same minimum reward (0xdac00563)
 */
error MinRewardHasNotChanged(uint256 minReward);

/**
 * @dev Reverts when trying to set _ASKER_KEY manually (externally) - it must be set within the ask function (0x9da96705)
 */
error MustNotSetAskerKeyManually();

/**
 * @dev Reverts when trying to set _ASK_TIMESTAMP_KEY manually (externally) - it must be set within the ask function (0x1ef41ef8)
 */
error MustNotSetAskTimestampKeyManually();

/**
 * @dev Reverts when trying to set _ANSWER_TIMESTAMP_KEY manually (externally) - it must be set within the ask function (0x83a79b45)
 */
error MustNotSetAnswerTimestampKeyManually();

/**
 * @dev Reverts when trying to set _QUESTION_KEY manually (externally) - it must be set within the ask function (0x833647ec)
 */
error MustNotSetQuestionKeyManually();

/**
 * @dev Reverts when trying to set _ANSWER_KEY manually (externally) - it must be set within the answer function (0x46dc1c8b)
 */
error MustNotSetAnswerKeyManually();

/**
 * @dev Reverts when trying to set _REWARD_KEY manually (externally) - it must be set within the ask function (0x72971fb4)
 */
error MustNotSetRewardKeyManually();

/**
 * @dev Reverts when owner tries to transfer the ownership (0x3a025e89)
 */
error TransferringOwnershipIsNotAllowed();

/**
 * @dev Reverts when owner is an EOA (0xff7bdea6)
 */
error OwnerMustNotBeAnEOA(address owner);

/**
 * @dev Reverts when owner is asking a question himself (0xcf56fa77)
 */
error OwnerMustNotBeAsker(address owner);

/**
 * @dev Reverts when trying to deploy another Question and Answer contract through the factory (0xb24eb9f1)
 */
error QuestionAndAnswerContractAlreadyDeployed(
    address contractAddress,
    address owner
);
