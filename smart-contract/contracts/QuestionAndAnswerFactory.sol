// SPDX-License-Identifier: Apache 2.0
pragma solidity ^0.8.20;

import {QuestionAndAnswer} from "./QuestionAndAnswer.sol";
import {QuestionAndAnswerContractAlreadyDeployed} from "./QuestionAndAnswerError.sol";

/**
 * @title Question and Answer NFT Factory.
 * This contract allows users to deploy Question And Answer NFT smart contracts.
 * The mapping keeps track of the created Q&A smart contracts for the universal profiles to prevent duplicates.
 * @author Dennis Tuszynski
 */
contract QuestionAndAnswerFactory {
    mapping(address => address) public QuestionAndAnswerMapping;

    /**
     * @dev Emitted when a new question and answer contract has been created.
     * @param contractAddress The contract address
     * @param owner The owner address
     */
    event QuestionAndAnswerContractCreated(
        address indexed contractAddress,
        address indexed owner
    );

    /**
     * @notice Constructs a Q&A contract and adds it
     * @param metadataUrl_ The url pointing to the metadata json.
     * @param owner_ The address of the Q&A owner.
     * @param minReward_ Minimum reward expected to be able to ask a question. (mint price with open end)
     */
    function CreateNewQuestionAndAnswerContract(
        address owner_,
        bytes memory metadataUrl_,
        uint256 minReward_
    ) external returns (address) {
        if (QuestionAndAnswerMapping[owner_] != address(0)) {
            revert QuestionAndAnswerContractAlreadyDeployed(
                QuestionAndAnswerMapping[owner_],
                owner_
            );
        }

        address qna = address(
            new QuestionAndAnswer(owner_, metadataUrl_, minReward_)
        );
        QuestionAndAnswerMapping[owner_] = qna;

        emit QuestionAndAnswerContractCreated(qna, owner_);

        return qna;
    }
}
