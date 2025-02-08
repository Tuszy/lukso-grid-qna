// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.20;

// Lukso
import {ILSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

/**
 * @title Question And Answer NFT Interface.
 * @author Dennis Tuszynski
 * @dev Interface of a Question And Answer NFT.
 */
interface IQuestionAndAnswer is ILSP8IdentifiableDigitalAsset {
    /**
     * @dev Emitted when a new question has been asked.
     * @param questioner The questioner who asked the question.
     * @param questionId The id of the question that has been asked.
     * @param reward The reward that has been offered.
     */
    event QuestionAsked(
        address indexed questioner,
        bytes32 indexed questionId,
        uint256 indexed reward
    );

    /**
     * @dev Emitted when the Q&A owner answers a question.
     * @param questioner The questioner who asked the question.
     * @param questionId The id of the question that has been answered.
     * @param reward The reward that has been unlocked.
     */
    event QuestionAnswered(
        address indexed questioner,
        bytes32 indexed questionId,
        uint256 indexed reward
    );

    /**
     * @dev Emitted when the question has been revoked by the questioner.
     * @param questioner The questioner who revoked the question.
     * @param questionId The id of the question that has been revoked.
     * @param reward The reward that has been returned to the questioner.
     */
    event QuestionRevoked(
        address indexed questioner,
        bytes32 indexed questionId,
        uint256 indexed reward
    );

    /**
     * @dev Emitted when the minimum reward has been changed by the owner.
     *
     * @param oldMinReward The old minimum reward.
     * @param newMinReward The new minimum reward.
     */
    event MinRewardChanged(
        uint256 indexed oldMinReward,
        uint256 indexed newMinReward
    );

    /**
     * @notice The expected minimum reward to be able to ask a question.
     *
     * @dev Minimum reward is comparable with a minimum mint price.
     *
     * @return The minimum reward.
     */
    function minReward() external view returns (uint256);

    /**
     * @notice The answered status tells us whether the question has already been answered.
     * Attention: An answered question cannot be revoked because the owner of the Q&A has already been rewarded.
     *
     * @dev Indicates whether a question has already been answered.
     * If not then the question can still be revoked to retrieve the offered reward back (burns the LSP8 token).
     *
     * @param questionId The question id to retrieve the answered status for.
     * @return The answered status (true: answered false: unanswered).
     */
    function answered(bytes32 questionId) external view returns (bool);

    /**
     * @notice Mints a Q&A nft to the questioner (= `msg.sender`).
     *
     * @param questionId The keccak256 hash of the question utf8 string.
     * @param questionUrl The url pointing to the json containing the question.
     */
    function ask(bytes32 questionId, bytes memory questionUrl) external payable;

    /**
     * @notice Allows questioner to revoke a question and retrieve the offered reward back.
     * Attention: Only possible if the question has not been answered yet.
     *
     * @param questionId The id of the question to revoke.
     */
    function revoke(bytes32 questionId) external;

    /**
     * @notice Allows owner to answer a question and thus changes the 'answered' status and retrieve the reward.
     *
     * @param questionId The id of the question to answer.
     * @param answerUrl The url pointing to the json containing the answer.
     */
    function answer(bytes32 questionId, bytes memory answerUrl) external;

    /**
     * @notice Allows owner to set the minimum reward.
     *
     * @param newMinReward The new minimum reward
     */
    function setMinReward(uint256 newMinReward) external;

    /**
     * @notice Returns the asker for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return address Asker address
     */
    function getAsker(bytes32 questionId) external view returns (address);

    /**
     * @notice Returns the ask timestamp for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return timestamp timestamp as uint256
     */
    function getAskTimestamp(
        bytes32 questionId
    ) external view returns (uint256);

    /**
     * @notice Returns the answer timestamp for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return timestamp timestamp as uint256
     */
    function getAnswerTimestamp(
        bytes32 questionId
    ) external view returns (uint256);

    /**
     * @notice Returns the reward value for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return reward Reward as uint256
     */
    function getReward(bytes32 questionId) external view returns (uint256);

    /**
     * @notice Returns the answer value for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return answer Answer as bytes
     */
    function getAnswer(bytes32 questionId) external view returns (bytes memory);

    /**
     * @notice Returns the question value for the question with the given id. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     * @return question Question as bytes
     */
    function getQuestion(
        bytes32 questionId
    ) external view returns (bytes memory);

    /**
     * @notice Returns the question data. If it does not exist, it reverts with LSP8NonExistentTokenId.
     *
     * @param questionId The id of the question
     */
    function getQuestionAndAnswer(
        bytes32 questionId
    )
        external
        view
        returns (
            address asker,
            uint256 reward,
            uint256 askTimestamp,
            uint256 answerTimestamp,
            bytes memory q,
            bytes memory a,
            bool isAnswered
        );
}
